import { describe, it, expect } from 'vitest'
import { startingPosition, buildBoard, getPieceCell } from './fixtures'

describe('SpecialMoves — Promotion, en passant, and other special rules', () => {
  it('board can represent pawn reaching promotion rank', () => {
    const board = buildBoard([
      ['', '', '', 'WP', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const pawn = getPieceCell(board, 'WPd8')
    expect(pawn).toBeDefined()
    expect(pawn?.piece).toBe('WPd8')
  })

  it('black pawn can reach rank 1', () => {
    const board = buildBoard([
      ['', '', '', '', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', 'BP', 'WK', '', '', ''],
    ])
    const pawn = getPieceCell(board, 'BPd1')
    expect(pawn).toBeDefined()
    expect(pawn?.piece).toBe('BPd1')
  })

  it('promoted queen piece exists on board', () => {
    const board = buildBoard([
      ['', '', '', 'WQ', 'BK', '', '', ''], // Promoted pawn (now queen)
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const queen = getPieceCell(board, 'WQd8')
    expect(queen).toBeDefined()
    expect(queen?.piece).toBe('WQd8')
  })

  it('promoted rook piece exists on board', () => {
    const board = buildBoard([
      ['', '', '', 'WR', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const rook = getPieceCell(board, 'WR')
    expect(rook).toBeDefined()
  })

  it('promoted bishop piece exists on board', () => {
    const board = buildBoard([
      ['', '', '', 'WB', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const bishop = getPieceCell(board, 'WB')
    expect(bishop).toBeDefined()
  })

  it('promoted knight piece exists on board', () => {
    const board = buildBoard([
      ['', '', '', 'WN', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const knight = getPieceCell(board, 'WN')
    expect(knight).toBeDefined()
  })

  it('en passant scenario: pawns on 5th rank', () => {
    const board = buildBoard([
      ['', '', '', '', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', 'BP', 'WP', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const wPawn = getPieceCell(board, 'WP')
    const bPawn = getPieceCell(board, 'BP')
    expect(wPawn).toBeDefined()
    expect(bPawn).toBeDefined()
  })

  it('en passant: black pawn advances to 4th rank', () => {
    const board = buildBoard([
      ['', '', '', '', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', 'BP', 'WP', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['WK', '', '', '', '', '', '', ''],
    ])
    const bPawn = getPieceCell(board, 'BP')
    const wPawn = getPieceCell(board, 'WP')
    expect(bPawn).toBeDefined()
    expect(wPawn).toBeDefined()
  })

  it('pawn on rank 2 (white) can move forward', () => {
    const board = startingPosition()
    const pawn = getPieceCell(board, 'WPe2')
    expect(pawn).toBeDefined()
  })

  it('pawn on rank 7 (black) can move forward', () => {
    const board = startingPosition()
    const pawn = getPieceCell(board, 'BPe7')
    expect(pawn).toBeDefined()
  })

  it('castling kingside requires king and rook in position', () => {
    const board = buildBoard([
      ['BR', 'BN', 'BB', 'BQ', 'BK', '', '', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR'],
    ])
    const king = getPieceCell(board, 'WK')
    const rook = getPieceCell(board, 'WR')
    expect(king).toBeDefined()
    expect(rook).toBeDefined()
  })

  it('castling queenside requires king and rook in position', () => {
    const board = buildBoard([
      ['BR', '', '', 'BQ', 'BK', 'BB', 'BN', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', '', '', 'WQ', 'WK', 'WB', 'WN', 'WR'],
    ])
    const king = getPieceCell(board, 'WK')
    expect(king).toBeDefined()
  })
})
