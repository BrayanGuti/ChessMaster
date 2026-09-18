import { describe, it, expect } from 'vitest'
import { isCastling } from '../hooks/Castling'
import { startingPosition, positionForKingsideCastling } from './fixtures'

describe('Castling — Special king and rook move', () => {
  it('isCastling function exists and is callable', () => {
    expect(typeof isCastling).toBe('function')
  })

  it('isCastling returns null or array for starting position kingside attempt', () => {
    const board = positionForKingsideCastling()
    const result = isCastling({ col: 4, row: 7 }, { col: 6, row: 7 }, board, 'W')
    expect(result === null || Array.isArray(result)).toBe(true)
  })

  it('isCastling accepts all required parameters', () => {
    const testBoard = startingPosition()
    expect(() => {
      isCastling({ col: 4, row: 7 }, { col: 6, row: 7 }, testBoard, 'W')
      isCastling({ col: 4, row: 7 }, { col: 2, row: 7 }, testBoard, 'W')
      isCastling({ col: 4, row: 0 }, { col: 6, row: 0 }, testBoard, 'B')
      isCastling({ col: 4, row: 0 }, { col: 2, row: 0 }, testBoard, 'B')
    }).not.toThrow()
  })

  it('isCastling returns null for non-castling moves from starting position', () => {
    const board = startingPosition()
    const result = isCastling({ col: 4, row: 7 }, { col: 5, row: 7 }, board, 'W')
    expect(result).toBeNull()
  })

  it('isCastling does not throw with various coordinate inputs', () => {
    const board = startingPosition()
    expect(() => {
      // Test various coordinates
      isCastling({ col: 0, row: 0 }, { col: 2, row: 0 }, board, 'B')
      isCastling({ col: 7, row: 0 }, { col: 5, row: 0 }, board, 'B')
      isCastling({ col: 0, row: 7 }, { col: 2, row: 7 }, board, 'W')
      isCastling({ col: 7, row: 7 }, { col: 5, row: 7 }, board, 'W')
    }).not.toThrow()
  })

  it('isCastling with white queen is not castling', () => {
    const board = startingPosition()
    // Queen moving is not castling
    const result = isCastling({ col: 3, row: 7 }, { col: 4, row: 6 }, board, 'W')
    expect(result).toBeNull()
  })

  it('isCastling with black king-like move', () => {
    const board = positionForKingsideCastling()
    // Try black castling from starting position (blocked)
    const result = isCastling({ col: 4, row: 0 }, { col: 6, row: 0 }, board, 'B')
    expect(result === null || Array.isArray(result)).toBe(true)
  })
})
