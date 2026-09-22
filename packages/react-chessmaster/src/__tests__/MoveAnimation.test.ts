import { describe, it, expect } from 'vitest'
import { createChessStore } from '../store/createChessStore'
import { ChessStoreApi, MoveRecord } from '../store/types'
import {
  capturedSquare,
  getMoveSlides,
  shouldAnimate,
  slideDuration,
  squareToCoords,
  MoveSnapshot,
} from '../ChessBoard/moveAnimation'

/** Plays the moves and returns the resulting history. */
function historyAfter(...moves: string[]): MoveRecord[] {
  const store: ChessStoreApi = createChessStore()
  for (const move of moves) {
    if (!store.getState().applyMove(move)) throw new Error(`Illegal move ${move}`)
  }
  return store.getState().moveHistory
}

const last = (history: MoveRecord[]) => history[history.length - 1]
const beforeLast = (history: MoveRecord[]) => history[history.length - 2]

describe('getMoveSlides', () => {
  it('slides the piece that moved', () => {
    expect(getMoveSlides(last(historyAfter('e2e4')))).toEqual([{ from: 'e2', to: 'e4' }])
  })

  it('slides a capturing piece like any other', () => {
    expect(getMoveSlides(last(historyAfter('e2e4', 'd7d5', 'e4d5')))).toEqual([{ from: 'e4', to: 'd5' }])
  })

  it('slides the rook along with the king when castling kingside', () => {
    const history = historyAfter('e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'e1g1')
    expect(getMoveSlides(last(history))).toEqual([
      { from: 'e1', to: 'g1' },
      { from: 'h1', to: 'f1' },
    ])
  })

  it('slides the rook along with the king when castling queenside, for black too', () => {
    const history = historyAfter('d2d4', 'd7d5', 'g1f3', 'b8c6', 'c1f4', 'c8f5', 'e2e3', 'd8d7', 'f1e2', 'e8c8')
    expect(getMoveSlides(last(history))).toEqual([
      { from: 'e8', to: 'c8' },
      { from: 'a8', to: 'd8' },
    ])
  })

  it('does not treat a plain king step as castling', () => {
    const history = historyAfter('e2e4', 'e7e5', 'e1e2')
    expect(getMoveSlides(last(history))).toEqual([{ from: 'e1', to: 'e2' }])
  })

  it('slides the pawn of a promotion to the last rank', () => {
    const record: MoveRecord = { piece: 'WPb7', from: 'b7', to: 'b8', captured: null, notation: '', turnNumber: 1 }
    expect(getMoveSlides(record)).toEqual([{ from: 'b7', to: 'b8' }])
  })
})

describe('slideDuration', () => {
  it('is quick for a step and grows with the distance, within limits', () => {
    const step = slideDuration({ from: 'e2', to: 'e3' })
    const knight = slideDuration({ from: 'g1', to: 'f3' })
    const rook = slideDuration({ from: 'a1', to: 'a8' })

    expect(step).toBeGreaterThanOrEqual(150)
    expect(knight).toBeGreaterThan(step)
    expect(rook).toBeGreaterThan(knight)
    expect(rook).toBeLessThanOrEqual(300)
  })

  it('does not depend on the direction of the move', () => {
    expect(slideDuration({ from: 'a1', to: 'h8' })).toBe(slideDuration({ from: 'h8', to: 'a1' }))
  })
})

describe('capturedSquare', () => {
  it('is null when nothing was captured', () => {
    const history = historyAfter('e2e4', 'e7e5')
    expect(capturedSquare(last(history), beforeLast(history))).toBeNull()
  })

  it('is the target square for an ordinary capture', () => {
    const history = historyAfter('e2e4', 'd7d5', 'e4d5')
    expect(capturedSquare(last(history), beforeLast(history))).toBe('d5')
  })

  it('is the target square when the captured piece is the one that just moved (a recapture)', () => {
    const history = historyAfter('e2e4', 'd7d5', 'e4d5', 'd8d5')
    expect(capturedSquare(last(history), beforeLast(history))).toBe('d5')
  })

  // The pawn taken en passant is not on the square the capturing pawn lands on
  it('is the square beside the capturing pawn for en passant', () => {
    const history = historyAfter('e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6')
    expect(last(history).to).toBe('d6')
    expect(capturedSquare(last(history), beforeLast(history))).toBe('d5')
  })

  it('is the same for black capturing en passant', () => {
    const history = historyAfter('a2a3', 'd7d5', 'a3a4', 'd5d4', 'e2e4', 'd4e3')
    expect(last(history).to).toBe('e3')
    expect(capturedSquare(last(history), beforeLast(history))).toBe('e4')
  })
})

describe('squareToCoords', () => {
  it('puts rank 8 on row 0 and file a on col 0', () => {
    expect(squareToCoords('a8')).toEqual({ row: 0, col: 0 })
    expect(squareToCoords('h1')).toEqual({ row: 7, col: 7 })
    expect(squareToCoords('e4')).toEqual({ row: 4, col: 4 })
  })
})

describe('shouldAnimate', () => {
  const history = historyAfter('e2e4', 'e7e5', 'g1f3')
  const snapshot = (moves: number, gameId = 0): MoveSnapshot => ({
    lastMove: history[moves - 1],
    moveCount: moves,
    gameId,
  })

  it('does not animate the first time the board is seen (a page that loads mid-game)', () => {
    expect(shouldAnimate(null, snapshot(3))).toBe(false)
  })

  it('animates a move that was just played', () => {
    expect(shouldAnimate(snapshot(2), snapshot(3))).toBe(true)
  })

  it('does not animate when nothing changed', () => {
    expect(shouldAnimate(snapshot(3), snapshot(3))).toBe(false)
  })

  it('does not animate when moves are taken back', () => {
    expect(shouldAnimate(snapshot(3), snapshot(2))).toBe(false)
    expect(shouldAnimate(snapshot(3), snapshot(1))).toBe(false)
  })

  it('does not animate a new game, even if it is already one move long', () => {
    const fresh: MoveSnapshot = { lastMove: undefined, moveCount: 0, gameId: 1 }
    expect(shouldAnimate(snapshot(3), fresh)).toBe(false)
    expect(shouldAnimate(fresh, { lastMove: history[0], moveCount: 1, gameId: 1 })).toBe(true)
    expect(shouldAnimate(snapshot(0, 0), { lastMove: history[0], moveCount: 1, gameId: 1 })).toBe(false)
  })

  it('animates the move played after an undo, even though the length is the same as before', () => {
    const afterUndo = snapshot(2)
    const replayed: MoveSnapshot = { lastMove: { ...history[2] }, moveCount: 3, gameId: 0 }
    expect(shouldAnimate(afterUndo, replayed)).toBe(true)
  })

  it('does not animate for a jump of several moves at once', () => {
    expect(shouldAnimate(snapshot(1), snapshot(3))).toBe(false)
  })
})
