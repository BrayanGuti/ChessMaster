import { describe, it, expect, beforeEach } from 'vitest'
import { createChessStore, hydrateChessStore } from '../store/createChessStore'
import { PERSIST_VERSION, resolveStorageKey, toPersistedGame } from '../store/persistence'
import { ChessStoreApi } from '../store/types'
import { getCellByName } from './fixtures'

const KEY = 'react-chess:test'

/** Plays a move through the same actions the UI uses: click the piece, then the target cell. */
function play(store: ChessStoreApi, from: string, to: string) {
  const origin = getCellByName(store.getState().chessBoardpositions, from)
  if (!origin) throw new Error(`No cell ${from}`)
  store.getState().clickCell(origin)
  const target = getCellByName(store.getState().chessBoardpositions, to)
  if (!target?.YouCanMoveHere) throw new Error(`Illegal move ${from}-${to}`)
  store.getState().clickCell(target)
}

/** A second board mounting with the same key, as after a page reload. */
function reload(key = KEY) {
  const store = createChessStore({ storageKey: key })
  hydrateChessStore(store)
  return store
}

function pieces(store: ChessStoreApi) {
  return toPersistedGame(store.getState()).pieces
}

describe('resolveStorageKey', () => {
  it('maps the persist prop to a namespaced key', () => {
    expect(resolveStorageKey(true)).toBe('react-chess:default')
    expect(resolveStorageKey('game-1')).toBe('react-chess:game-1')
    expect(resolveStorageKey(false)).toBeNull()
    expect(resolveStorageKey(undefined)).toBeNull()
    expect(resolveStorageKey('  ')).toBeNull()
  })
})

describe('game persistence', () => {
  beforeEach(() => localStorage.clear())

  it('restores board, turn, history and layout after a reload', () => {
    const store = reload()
    play(store, 'e2', 'e4')
    play(store, 'e7', 'e5')
    store.getState().setDisplaySettings(previous => ({ ...previous, moveHistory: true }))

    const restored = reload()
    const state = restored.getState()
    expect(pieces(restored)).toEqual(pieces(store))
    expect(state.turn).toBe('W')
    expect(state.moveHistory.map(move => move.notation)).toEqual(['e4', 'e5'])
    expect(state.displaySettings.moveHistory).toBe(true)
    expect(state.checkState.check).toBe(false)
    expect(state.checkState.isStalemate).toBe(false)
  })

  it('keeps playing correctly after a restore (hasMoved and attacks are rebuilt)', () => {
    const store = reload()
    play(store, 'e2', 'e4')

    const restored = reload()
    const board = restored.getState().chessBoardpositions
    expect(getCellByName(board, 'e4')!.hasMoved).toBe(true)
    expect(getCellByName(board, 'd7')!.hasMoved).toBe(false)

    play(restored, 'e7', 'e5')
    play(restored, 'g1', 'f3')
    expect(restored.getState().moveHistory.map(move => move.notation)).toEqual(['e4', 'e5', 'Nf3'])
  })

  it('restores a finished game as checkmate', () => {
    const store = reload()
    play(store, 'f2', 'f3')
    play(store, 'e7', 'e5')
    play(store, 'g2', 'g4')
    play(store, 'd8', 'h4')
    expect(store.getState().checkState.isCheckmate).toBe(true)

    const restored = reload()
    expect(restored.getState().checkState.isCheckmate).toBe(true)
    expect(restored.getState().checkState.colorOfCheck).toBe('W')
  })

  it('keeps boards with different keys apart', () => {
    const first = reload('react-chess:one')
    const second = reload('react-chess:two')
    play(first, 'e2', 'e4')

    expect(reload('react-chess:one').getState().moveHistory).toHaveLength(1)
    expect(reload('react-chess:two').getState().moveHistory).toHaveLength(0)
    expect(second.getState().moveHistory).toHaveLength(0)
  })

  it('starts a clean game when the saved value is not JSON', () => {
    localStorage.setItem(KEY, '{not json')
    const store = reload()
    expect(store.getState().moveHistory).toHaveLength(0)
    expect(store.getState().turn).toBe('W')
    // The corrupted value is removed, and the next move saves a valid game
    expect(localStorage.getItem(KEY)).toBeNull()
    play(store, 'e2', 'e4')
    expect(reload().getState().moveHistory).toHaveLength(1)
  })

  it('starts a clean game when the saved game is invalid', () => {
    const store = reload()
    play(store, 'e2', 'e4')
    const saved = JSON.parse(localStorage.getItem(KEY)!)
    saved.state.pieces[7][4] = '' // remove the white king
    localStorage.setItem(KEY, JSON.stringify(saved))

    const restored = reload()
    expect(restored.getState().moveHistory).toHaveLength(0)
    expect(pieces(restored)[7][4]).toBe('WKe1')
  })

  it('discards a save from another format version', () => {
    const store = reload()
    play(store, 'e2', 'e4')
    const saved = JSON.parse(localStorage.getItem(KEY)!)
    saved.version = PERSIST_VERSION + 1
    saved.state = { something: 'else' }
    localStorage.setItem(KEY, JSON.stringify(saved))

    expect(reload().getState().moveHistory).toHaveLength(0)
  })

  it('resetGame saves a fresh game but keeps the layout', () => {
    const store = reload()
    store.getState().setDisplaySettings(previous => ({ ...previous, playerBadges: true }))
    play(store, 'e2', 'e4')
    store.getState().resetGame()
    expect(store.getState().gameId).toBe(1)

    const restored = reload()
    expect(restored.getState().moveHistory).toHaveLength(0)
    expect(restored.getState().turn).toBe('W')
    expect(restored.getState().displaySettings.playerBadges).toBe(true)
  })

  it('writes nothing when persistence is off', () => {
    const store = createChessStore()
    hydrateChessStore(store)
    play(store, 'e2', 'e4')
    expect(localStorage.length).toBe(0)
  })
})
