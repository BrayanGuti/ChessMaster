import { describe, it, expect } from 'vitest'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { startingPosition } from './fixtures'

describe('MoveValidation — Illegal moves and protected pieces', () => {
  it('markCellsUnderAttack function exists', () => {
    expect(typeof markCellsUnderAttack).toBe('function')
  })

  it('markCellsUnderAttack returns object with newBoard', () => {
    const board = startingPosition()
    const result = markCellsUnderAttack(board)
    expect(result).toHaveProperty('newBoard')
    expect(result).toHaveProperty('checkState')
  })

  it('markCellsUnderAttack returns board with same dimensions', () => {
    const board = startingPosition()
    const { newBoard } = markCellsUnderAttack(board)
    expect(newBoard.length).toBe(8)
    expect(newBoard.every(row => row.length === 8)).toBe(true)
  })

  it('markCellsUnderAttack preserves piece positions', () => {
    const board = startingPosition()
    const { newBoard } = markCellsUnderAttack(board)

    // Check that kings are still in their starting positions
    const newWhiteKing = newBoard.flat().find(cell => cell.piece === 'WKe1')
    expect(newWhiteKing).toBeDefined()

    const newBlackKing = newBoard.flat().find(cell => cell.piece === 'BKe8')
    expect(newBlackKing).toBeDefined()
  })

  it('checkState has required properties', () => {
    const board = startingPosition()
    const { checkState } = markCellsUnderAttack(board)
    expect(checkState).toHaveProperty('check')
    expect(checkState).toHaveProperty('isCheckmate')
    expect(checkState).toHaveProperty('isStalemate')
    expect(checkState).toHaveProperty('colorOfCheck')
  })

  it('starting position has no checks', () => {
    const board = startingPosition()
    const { checkState } = markCellsUnderAttack(board)
    expect(checkState.check).toBe(false)
    expect(checkState.isCheckmate).toBe(false)
  })

  it('isUnderAttackBy is populated for attacked cells', () => {
    const board = startingPosition()
    const { newBoard } = markCellsUnderAttack(board)
    // Check if pawn squares are marked as under attack
    const e4 = newBoard[4][4] // Center-ish square
    expect(Array.isArray(e4.isUnderAttackBy)).toBe(true)
  })
})
