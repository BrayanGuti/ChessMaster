import { describe, it, expect } from 'vitest'
import { isCheckmate, hasAnyLegalMove } from '../hooks/CheckMate'
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
  it('starting position is not checkmate', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status.isCheckmate).toBe(false)
    expect(status.check).toBe(false)
  })

  it('starting position has no attackers', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status.attackers).toBeNull()
  })

  it('checkStatus object has required properties', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status).toHaveProperty('isCheckmate')
    expect(status).toHaveProperty('check')
    expect(status).toHaveProperty('attackers')
    expect(status).toHaveProperty('colorOfCheck')
  })

  it('isCheckmate returns boolean for check property', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(typeof status.check).toBe('boolean')
  })

  it('isCheckmate returns boolean for isCheckmate property', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(typeof status.isCheckmate).toBe('boolean')
  })

  it('deep looking mode parameter does not throw error', () => {
    const board = startingPosition()
    expect(() => {
      isCheckmate(board, false)
      isCheckmate(board, true)
    }).not.toThrow()
  })

  it('protectors and blockers are arrays', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(Array.isArray(status.protectors)).toBe(true)
    expect(Array.isArray(status.blockers)).toBe(true)
    expect(Array.isArray(status.allDefenders)).toBe(true)
  })

  it('moves array is included in checkStatus', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(Array.isArray(status.moves)).toBe(true)
  })

  it('colorOfCheck is null in starting position', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status.colorOfCheck).toBeNull()
  })

  it('numberOfAttackersIsOne is boolean', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(typeof status.numberOfAttackersIsOne).toBe('boolean')
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

  it('protectors include a piece that can capture the checking piece', () => {
    const { checkState } = markCellsUnderAttack(positionWhereKnightCanCaptureChecker())
    expect(checkState.check).toBe(true)
    expect(checkState.protectors.map(p => p.attacker.piece)).toContain('BNc6')
    expect(checkState.allDefenders.map(d => d.protector.piece)).toContain('BNc6')
  })

  it('detects a real back-rank checkmate (king boxed in by its own pawns)', () => {
    const { checkState } = markCellsUnderAttack(positionWithBackRankMate())
    expect(checkState.check).toBe(true)
    expect(checkState.isCheckmate).toBe(true)
  })

  it('does not report checkmate when the king has a safe escape square', () => {
    const { checkState } = markCellsUnderAttack(positionWithCheckButKingCanEscape())
    expect(checkState.check).toBe(true)
    expect(checkState.isCheckmate).toBe(false)
  })
})
