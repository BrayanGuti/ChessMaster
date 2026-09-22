import { describe, it, expect } from 'vitest'
import { createChessStore, hydrateChessStore } from '../store/createChessStore'
import { toPersistedGame } from '../store/persistence'
import { ChessStoreApi } from '../store/types'

const KEY = 'react-chessmaster:result-dialog-test'

/** Plays every move through the engine path, which is the same path a human move takes. */
function play(store: ChessStoreApi, ...moves: string[]) {
  for (const move of moves) {
    if (!store.getState().applyMove(move)) throw new Error(`Illegal move ${move}`)
  }
}

/** Fool's mate: the fastest checkmate. */
function storeAtCheckmate(): ChessStoreApi {
  const store = createChessStore()
  play(store, 'f2f3', 'e7e5', 'g2g4', 'd8h4')
  return store
}

describe('closing and reopening the game-over dialog', () => {
  it('starts shown (not dismissed) once the game is over', () => {
    const state = storeAtCheckmate().getState()
    expect(state.checkState.isCheckmate).toBe(true)
    expect(state.resultDismissed).toBe(false)
  })

  it('dismissResult hides it, showResult brings it back', () => {
    const store = storeAtCheckmate()
    store.getState().dismissResult()
    expect(store.getState().resultDismissed).toBe(true)

    store.getState().showResult()
    expect(store.getState().resultDismissed).toBe(false)
  })

  it('dismissResult does nothing while the game is still going', () => {
    const store = createChessStore()
    play(store, 'e2e4')
    store.getState().dismissResult()
    expect(store.getState().resultDismissed).toBe(false)
  })

  it('a rematch shows the dialog again for the next game', () => {
    const store = storeAtCheckmate()
    store.getState().dismissResult()

    store.getState().resetGame()
    expect(store.getState().resultDismissed).toBe(false)
  })

  it('startGame also resets it', () => {
    const store = storeAtCheckmate()
    store.getState().dismissResult()

    store.getState().startGame({ mode: 'local', colorChoice: 'W', level: 2 })
    expect(store.getState().resultDismissed).toBe(false)
  })

  it('undoing the mate away shows the dialog again, ready for the next one', () => {
    const store = storeAtCheckmate()
    store.getState().dismissResult()

    store.getState().undoMove()
    expect(store.getState().checkState.isCheckmate).toBe(false)
    expect(store.getState().resultDismissed).toBe(false)
  })

  it('is not part of the persisted game: a reload always shows a finished game again', () => {
    localStorage.clear()
    const store = createChessStore({ storageKey: KEY })
    hydrateChessStore(store)
    play(store, 'f2f3', 'e7e5', 'g2g4', 'd8h4')
    store.getState().dismissResult()
    expect(store.getState().resultDismissed).toBe(true)
    expect(JSON.stringify(toPersistedGame(store.getState()))).not.toContain('resultDismissed')

    const reloaded = createChessStore({ storageKey: KEY })
    hydrateChessStore(reloaded)
    expect(reloaded.getState().checkState.isCheckmate).toBe(true)
    expect(reloaded.getState().resultDismissed).toBe(false)
  })
})
