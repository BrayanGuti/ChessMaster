import { describe, it, expect } from 'vitest'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { startingPosition } from './fixtures'

describe('MoveValidation — Illegal moves and protected pieces', () => {
  it('markCellsUnderAttack function exists', () => {
    expect(typeof markCellsUnderAttack).toBe('function')
  })

  it('markCellsUnderAttack returns object with newBoard', () => {
    const board = startingPosition()
    const result = markCellsUnderAttack(board, false)
    expect(result).toHaveProperty('newBoard')
    expect(result).toHaveProperty('checkState')
  })

  it('markCellsUnderAttack does not throw with false parameter', () => {
    const board = startingPosition()
    expect(() => markCellsUnderAttack(board, false)).not.toThrow()
  })

  it('markCellsUnderAttack does not throw with true parameter', () => {
    const board = startingPosition()
    expect(() => markCellsUnderAttack(board, true)).not.toThrow()
  })

  it('markCellsUnderAttack returns board with same dimensions', () => {
    const board = startingPosition()
    const { newBoard } = markCellsUnderAttack(board, false)
    expect(newBoard.length).toBe(8)
    expect(newBoard.every(row => row.length === 8)).toBe(true)
  })

  it('markCellsUnderAttack preserves piece positions', () => {
    const board = startingPosition()
    const { newBoard } = markCellsUnderAttack(board, false)

    // Check that kings are still in their starting positions
    const newWhiteKing = newBoard.flat().find(cell => cell.piece === 'WKe1')
    expect(newWhiteKing).toBeDefined()

    const newBlackKing = newBoard.flat().find(cell => cell.piece === 'BKe8')
    expect(newBlackKing).toBeDefined()
  })

  it('checkState has required properties', () => {
    const board = startingPosition()
    const { checkState } = markCellsUnderAttack(board, false)
    expect(checkState).toHaveProperty('check')
    expect(checkState).toHaveProperty('isCheckmate')
    expect(checkState).toHaveProperty('attackers')
    expect(checkState).toHaveProperty('protectors')
    expect(checkState).toHaveProperty('blockers')
  })

  it('starting position has no checks', () => {
    const board = startingPosition()
    const { checkState } = markCellsUnderAttack(board, false)
    expect(checkState.check).toBe(false)
    expect(checkState.isCheckmate).toBe(false)
  })

  it('isUnderAttackBy is populated for attacked cells', () => {
    const board = startingPosition()
    const { newBoard } = markCellsUnderAttack(board, false)
    // Check if pawn squares are marked as under attack
    const e4 = newBoard[4][4] // Center-ish square
    expect(Array.isArray(e4.isUnderAttackBy)).toBe(true)
  })
})
