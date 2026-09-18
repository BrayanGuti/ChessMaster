import { describe, it, expect } from 'vitest'
import { createChessStore } from '../store/createChessStore'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { ChessStoreApi } from '../store/types'
import { buildBoard, getCellByName } from './fixtures'

/** Store with a custom position and white to move. */
function storeWithPosition(pieces: string[][]): ChessStoreApi {
  const store = createChessStore()
  const { newBoard } = markCellsUnderAttack(buildBoard(pieces))
  store.setState({ chessBoardpositions: newBoard, turn: 'W' })
  return store
}

/** Moves a pawn to the last rank and picks the promotion piece, as CoronationPanel does. */
function promote(store: ChessStoreApi, from: string, to: string, piece: string) {
  store.getState().clickCell(getCellByName(store.getState().chessBoardpositions, from)!)
  const target = getCellByName(store.getState().chessBoardpositions, to)!
  if (!target.YouCanMoveHere) throw new Error(`Illegal move ${from}-${to}`)
  store.getState().clickCell(target)
  expect(store.getState().coronation.status).toBe(true)
  store.getState().makeCoronation(piece)
}

/*
 * Black: Kh1. White: Kf2, pawn b7.
 * Before promoting, the black king's only free square is h2 (g1 and g2 are covered by Kf2).
 * After b8=Q the queen covers h2 along the b8-h2 diagonal without attacking h1:
 * black has no legal move and is not in check -> stalemate.
 */
const PROMOTION_STALEMATE = [
  ['', '', '', '', '', '', '', ''],
  ['', 'WP', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', 'WK', '', ''],
  ['', '', '', '', '', '', '', 'BK'],
]

describe('promotion', () => {
  // KNOWN BUG: makeCoronation calls updateCellsUnderAttack() after changeTurn(), so the
  // stalemate check runs for the side that just promoted instead of the opponent.
  // Remove `.fails` once it is fixed.
  it.fails('detects a stalemate caused by the promoted piece', () => {
    const store = storeWithPosition(PROMOTION_STALEMATE)
    expect(store.getState().checkState.isStalemate).toBe(false)

    promote(store, 'b7', 'b8', 'WQ')

    const { checkState, turn } = store.getState()
    expect(getCellByName(store.getState().chessBoardpositions, 'b8')!.piece).toBe('WQb7')
    expect(turn).toBe('B')
    expect(checkState.check).toBe(false)
    expect(checkState.isCheckmate).toBe(false)
    expect(checkState.isStalemate).toBe(true)
  })

  it('does not report stalemate when the opponent still has a move', () => {
    // Same position plus a black pawn on a7 that can still advance
    const position = PROMOTION_STALEMATE.map(row => [...row])
    position[1][0] = 'BP'
    const store = storeWithPosition(position)

    promote(store, 'b7', 'b8', 'WQ')

    const { checkState, turn } = store.getState()
    expect(turn).toBe('B')
    expect(checkState.check).toBe(false)
    expect(checkState.isStalemate).toBe(false)
  })
})
