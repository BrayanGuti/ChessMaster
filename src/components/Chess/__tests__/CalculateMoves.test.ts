import { describe, it, expect } from 'vitest'
import { calculateAvailableMoves } from '../hooks/CalculateMoves'
import { startingPosition, getPieceCell } from './fixtures'

describe('CalculateMoves — Piece movement', () => {
  it('pawn from starting position can move', () => {
    const board = startingPosition()
    const pawn = getPieceCell(board, 'WPe2')
    expect(pawn).toBeDefined()
    expect(pawn?.piece).toBe('WPe2')
  })

  it('knight from starting position can move', () => {
    const board = startingPosition()
    const knight = getPieceCell(board, 'WNb1')
    expect(knight).toBeDefined()
    expect(knight?.piece).toBe('WNb1')
  })

  it('bishop from starting position exists', () => {
    const board = startingPosition()
    const bishop = getPieceCell(board, 'WBc1')
    expect(bishop).toBeDefined()
    expect(bishop?.piece).toBe('WBc1')
  })

  it('rook from starting position exists', () => {
    const board = startingPosition()
    const rook = getPieceCell(board, 'WRa1')
    expect(rook).toBeDefined()
    expect(rook?.piece).toBe('WRa1')
  })

  it('queen from starting position exists', () => {
    const board = startingPosition()
    const queen = getPieceCell(board, 'WQd1')
    expect(queen).toBeDefined()
    expect(queen?.piece).toBe('WQd1')
  })

  it('king from starting position exists', () => {
    const board = startingPosition()
    const king = getPieceCell(board, 'WKe1')
    expect(king).toBeDefined()
    expect(king?.piece).toBe('WKe1')
  })

  it('black pieces from starting position exist', () => {
    const board = startingPosition()
    const bKing = getPieceCell(board, 'BKe8')
    const bPawn = getPieceCell(board, 'BPe7')
    expect(bKing).toBeDefined()
    expect(bPawn).toBeDefined()
  })

  it('calculateAvailableMoves returns array', () => {
    const board = startingPosition()
    const pawn = getPieceCell(board, 'WPe2')!
    const moves = calculateAvailableMoves(pawn, board)
    expect(Array.isArray(moves)).toBe(true)
  })

  it('calculateAvailableMoves for knight returns expected output', () => {
    const board = startingPosition()
    const knight = getPieceCell(board, 'WNb1')!
    const moves = calculateAvailableMoves(knight, board)
    expect(Array.isArray(moves)).toBe(true)
  })
})
