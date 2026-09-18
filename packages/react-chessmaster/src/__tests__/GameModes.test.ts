import { describe, it, expect, beforeEach } from 'vitest'
import { createChessStore, hydrateChessStore } from '../store/createChessStore'
import { toPersistedGame } from '../store/persistence'
import { randomEngine } from '../engine/engine'
import { ChessStoreApi } from '../store/types'
import { getCellByName } from './fixtures'

const KEY = 'react-chessmaster:modes-test'

function click(store: ChessStoreApi, square: string) {
  store.getState().clickCell(getCellByName(store.getState().chessBoardpositions, square)!)
}

function reload() {
  const store = createChessStore({ storageKey: KEY })
  hydrateChessStore(store)
  return store
}

describe('game modes', () => {
  it('starts in two-player mode by default', () => {
    const state = createChessStore().getState()
    expect(state.gameMode).toBe('local')
    expect(state.playerColor).toBe('W')
    expect(state.opponentLevel).toBe(2)
  })

  it('takes the first game configuration from the options', () => {
    const state = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'B', level: 4 } }).getState()
    expect(state.gameMode).toBe('computer')
    expect(state.playerColor).toBe('B')
    expect(state.opponentLevel).toBe(4)
  })

  it("ignores the human's clicks on the computer's turn", () => {
    const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'W', level: 2 } })
    click(store, 'e2')
    click(store, 'e4')
    expect(store.getState().turn).toBe('B')

    click(store, 'e7') // a black piece, but black is the computer
    expect(store.getState().cellOfPieceSelected).toBeNull()

    expect(store.getState().applyMove('e7e5')).toBe(true) // the engine's path still works
    expect(store.getState().turn).toBe('W')
  })

  it('lets the computer open when the human plays black', () => {
    const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'B', level: 2 } })
    click(store, 'e2')
    expect(store.getState().cellOfPieceSelected).toBeNull()
    expect(store.getState().applyMove('d2d4')).toBe(true)
    click(store, 'd7')
    expect(store.getState().cellOfPieceSelected?.cellName).toBe('d7')
  })

  it('startGame replaces the game and its configuration', () => {
    const store = createChessStore()
    store.getState().applyMove('e2e4')
    store.getState().startGame({ mode: 'computer', colorChoice: 'B', level: 5 })

    const state = store.getState()
    expect(state.moveHistory).toHaveLength(0)
    expect(state.turn).toBe('W')
    expect(state.gameMode).toBe('computer')
    expect(state.playerColor).toBe('B')
    expect(state.opponentLevel).toBe(5)
    expect(state.gameId).toBe(1)
  })

  it('a rematch (resetGame) keeps the mode, color choice and level', () => {
    const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'B', level: 3 } })
    store.getState().applyMove('e2e4')
    store.getState().resetGame()

    const state = store.getState()
    expect(state.moveHistory).toHaveLength(0)
    expect(state.gameMode).toBe('computer')
    expect(state.playerColor).toBe('B')
    expect(state.opponentLevel).toBe(3)
  })

  it("draws a 'random' color on every new game", () => {
    const store = createChessStore()
    const colors = new Set<string>()
    for (let i = 0; i < 40; i++) {
      store.getState().startGame({ mode: 'computer', colorChoice: 'random', level: 1 })
      colors.add(store.getState().playerColor)
    }
    expect(colors).toEqual(new Set(['W', 'B']))
    expect(store.getState().colorChoice).toBe('random')
  })

  it('the random engine finishes games with legal moves only', async () => {
    for (let game = 0; game < 2; game++) {
      const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'W', level: 1 } })
      for (let ply = 0; ply < 120; ply++) {
        const state = store.getState()
        const legalMoves = state.legalMoves()
        if (legalMoves.length === 0) {
          expect(state.checkState.isCheckmate || state.checkState.isStalemate).toBe(true)
          break
        }
        const move = await randomEngine({ fen: state.toFEN(), legalMoves, level: 1 })
        expect(store.getState().applyMove(move)).toBe(true)
        expect(store.getState().coronation.status).toBe(false)
      }
    }
  }, 60_000)
})

describe('persistence of the game configuration', () => {
  beforeEach(() => localStorage.clear())

  it('restores mode, colors and level after a reload', () => {
    const store = reload()
    store.getState().startGame({ mode: 'computer', colorChoice: 'random', level: 4 })
    store.getState().applyMove('e2e4')
    const playerColor = store.getState().playerColor

    const state = reload().getState()
    expect(state.gameMode).toBe('computer')
    expect(state.colorChoice).toBe('random')
    expect(state.playerColor).toBe(playerColor)
    expect(state.opponentLevel).toBe(4)
    expect(state.aiThinking).toBe(false)
  })

  it('keeps games saved by version 1 as two-player games', () => {
    const v1Store = createChessStore()
    v1Store.getState().applyMove('e2e4')
    const current = toPersistedGame(v1Store.getState())
    // The v1 format: no game configuration and no Game panel switch
    const v1State = {
      pieces: current.pieces,
      moved: current.moved,
      turn: current.turn,
      moveHistory: current.moveHistory,
      coronation: current.coronation,
      displaySettings: { playerBadges: false, capturedPieces: false, moveHistory: true },
    }
    localStorage.setItem(KEY, JSON.stringify({ state: v1State, version: 1 }))

    const state = reload().getState()
    expect(state.moveHistory.map(move => move.notation)).toEqual(['e4'])
    expect(state.gameMode).toBe('local')
    expect(state.opponentLevel).toBe(2)
    expect(state.displaySettings.gamePanel).toBe(true)
  })

  it('discards a save with an invalid game configuration', () => {
    const store = reload()
    store.getState().applyMove('e2e4')
    const saved = JSON.parse(localStorage.getItem(KEY)!)
    saved.state.opponentLevel = 9
    localStorage.setItem(KEY, JSON.stringify(saved))

    expect(reload().getState().moveHistory).toHaveLength(0)
  })
})
