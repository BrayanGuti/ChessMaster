import { describe, it, expect } from 'vitest'
import { applyGameEnd, hasAnyLegalMove } from '../hooks/CheckMate'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { startingPosition, buildBoard } from './fixtures'

/**
 * Textbook corner stalemate: black king on a8 cannot move to a7/b7/b8
 * (all covered by the white queen on b6), and it is not currently in check.
 */
function positionWithGenuineStalemate() {
  return buildBoard([
    ['BK', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', 'WQ', 'WK', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
  ])
}

/**
 * White bishop on b4 checks the black king on e1 diagonally. Black has a
 * knight on c6 that can capture the bishop (c6 -> b4 is a valid knight move).
 */
function positionWhereKnightCanCaptureChecker() {
  return buildBoard([
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', 'BN', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', 'WB', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', 'BK', '', '', ''],
  ])
}

/**
 * Classic back-rank mate: white king on g1 boxed in by its own unmoved
 * pawns on f2/g2/h2, checked by a black rook on a1 along the open first rank.
 */
function positionWithBackRankMate() {
  return buildBoard([
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', 'WP', 'WP', 'WP'],
    ['BR', '', '', '', '', '', 'WK', ''],
  ])
}

/**
 * White king on g1 checked by a black rook on a1 along the first rank, but
 * f1 is free and safe — the king can step aside, so this is check, not mate.
 */
function positionWithCheckButKingCanEscape() {
  return buildBoard([
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', 'WP', 'WP'],
    ['BR', '', '', '', '', '', 'WK', ''],
  ])
}

describe('CheckMate — Check and Checkmate detection', () => {
  it('the starting position is neither check, mate nor stalemate', () => {
    const { checkState } = markCellsUnderAttack(startingPosition())
    expect(checkState).toEqual({ isCheckmate: false, isStalemate: false, check: false, colorOfCheck: null })
  })

  it('markCellsUnderAttack only reports the check: mate and stalemate wait for applyGameEnd', () => {
    const { checkState } = markCellsUnderAttack(positionWithBackRankMate())
    expect(checkState.check).toBe(true)
    expect(checkState.colorOfCheck).toBe('W')
    expect(checkState.isCheckmate).toBe(false)
    expect(checkState.isStalemate).toBe(false)
  })

  it('hasAnyLegalMove is true for black in the starting position', () => {
    const board = startingPosition()
    expect(hasAnyLegalMove(board, 'B')).toBe(true)
  })

  it('hasAnyLegalMove is false for black in a stalemate position (king not in check)', () => {
    const { newBoard, checkState } = markCellsUnderAttack(positionWithGenuineStalemate())
    expect(checkState.check).toBe(false)
    expect(hasAnyLegalMove(newBoard, 'B')).toBe(false)
  })

  it('reports a stalemate when the side to move has no legal move and is not in check', () => {
    const { newBoard, checkState } = markCellsUnderAttack(positionWithGenuineStalemate())
    applyGameEnd(newBoard, checkState, 'B', null, false)
    expect(checkState.isStalemate).toBe(true)
    expect(checkState.isCheckmate).toBe(false)
  })

  it('does not report checkmate when a piece can capture the checking piece', () => {
    const { newBoard, checkState } = markCellsUnderAttack(positionWhereKnightCanCaptureChecker())
    expect(checkState.check).toBe(true)
    expect(hasAnyLegalMove(newBoard, 'B')).toBe(true) // Nc6xb4
    applyGameEnd(newBoard, checkState, 'B', null, false)
    expect(checkState.isCheckmate).toBe(false)
  })

  it('detects a real back-rank checkmate (king boxed in by its own pawns)', () => {
    const { newBoard, checkState } = markCellsUnderAttack(positionWithBackRankMate())
    expect(checkState.check).toBe(true)
    applyGameEnd(newBoard, checkState, 'W', null, false)
    expect(checkState.isCheckmate).toBe(true)
    expect(checkState.colorOfCheck).toBe('W') // the loser
  })

  it('does not report checkmate when the king has a safe escape square', () => {
    const { newBoard, checkState } = markCellsUnderAttack(positionWithCheckButKingCanEscape())
    expect(checkState.check).toBe(true)
    applyGameEnd(newBoard, checkState, 'W', null, false)
    expect(checkState.isCheckmate).toBe(false)
  })

  it('waits while a promotion is pending: the position is not final yet', () => {
    const { newBoard, checkState } = markCellsUnderAttack(positionWithBackRankMate())
    applyGameEnd(newBoard, checkState, 'W', null, true)
    expect(checkState.isCheckmate).toBe(false)
    expect(checkState.isStalemate).toBe(false)
  })
})
