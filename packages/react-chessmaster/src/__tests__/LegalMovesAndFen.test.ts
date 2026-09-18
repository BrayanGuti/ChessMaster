import { describe, it, expect } from 'vitest'
import { createChessStore } from '../store/createChessStore'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { ChessStoreApi } from '../store/types'
import { buildBoard, getCellByName, positionForKingsideCastling } from './fixtures'

/** Store with a custom position (attacks computed) and the given side to move. */
function storeWithPosition(pieces: string[][], turn: 'W' | 'B' = 'W'): ChessStoreApi {
  const store = createChessStore()
  const { newBoard, checkState } = markCellsUnderAttack(buildBoard(pieces))
  store.setState({ chessBoardpositions: newBoard, checkState, turn })
  return store
}

const pieceAt = (store: ChessStoreApi, square: string) =>
  getCellByName(store.getState().chessBoardpositions, square)!.piece

describe('legalMoves', () => {
  it('lists the 20 opening moves', () => {
    const moves = createChessStore().getState().legalMoves()
    expect(moves).toHaveLength(20)
    expect(moves).toContain('e2e4')
    expect(moves).toContain('g1f3')
  })

  it('only allows moves that get out of check', () => {
    // Black king on e8 checked by the rook on e1: it must step off the e-file
    const store = storeWithPosition([
      ['', '', '', '', 'BK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WR', '', '', 'WK'],
    ], 'B')
    expect(store.getState().legalMoves().sort()).toEqual(['e8d7', 'e8d8', 'e8f7', 'e8f8'])
  })

  it('does not let a pinned piece move off the pin line', () => {
    const store = storeWithPosition([
      ['', '', '', '', 'BK', '', '', ''],
      ['', '', '', '', 'BB', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WR', '', '', 'WK'],
    ], 'B')
    const moves = store.getState().legalMoves()
    expect(moves.some(move => move.startsWith('e7'))).toBe(false)
    expect(moves.length).toBeGreaterThan(0)
  })

  it('does not allow castling out of check', () => {
    const store = storeWithPosition([
      ['BK', '', '', '', 'BR', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', 'WR'],
    ])
    expect(store.getState().checkState.check).toBe(true)
    expect(store.getState().legalMoves()).not.toContain('e1g1')
  })

  it('lists one move per promotion piece', () => {
    const store = storeWithPosition([
      ['', '', '', '', '', '', '', ''],
      ['WP', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', 'BK'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    const promotions = store.getState().legalMoves().filter(move => move.startsWith('a7a8'))
    expect(promotions.sort()).toEqual(['a7a8b', 'a7a8n', 'a7a8q', 'a7a8r'])
  })
})

describe('applyMove', () => {
  it('plays a legal move like a human move would', () => {
    const store = createChessStore()
    expect(store.getState().applyMove('e2e4')).toBe(true)
    const state = store.getState()
    expect(pieceAt(store, 'e4')).toBe('WPe2')
    expect(pieceAt(store, 'e2')).toBe('')
    expect(state.turn).toBe('B')
    expect(state.moveHistory.map(move => move.notation)).toEqual(['e4'])
    expect(state.cellOfPieceSelected).toBeNull()
    expect(state.chessBoardpositions.flat().some(cell => cell.YouCanMoveHere)).toBe(false)
  })

  it('rejects illegal and malformed moves without changing the game', () => {
    const store = createChessStore()
    const before = store.getState().toFEN()
    expect(store.getState().applyMove('e2e5')).toBe(false)
    expect(store.getState().applyMove('e7e5')).toBe(false) // black piece on white's turn
    expect(store.getState().applyMove('hello')).toBe(false)
    expect(store.getState().toFEN()).toBe(before)
    expect(store.getState().moveHistory).toHaveLength(0)
  })

  it('castles, moving the rook too', () => {
    const store = storeWithPosition(positionForKingsideCastling().map(row => row.map(cell => cell.piece.slice(0, 2))))
    expect(store.getState().applyMove('e1g1')).toBe(true)
    expect(pieceAt(store, 'g1')).toMatch(/^WK/)
    expect(pieceAt(store, 'f1')).toMatch(/^WR/)
    expect(pieceAt(store, 'h1')).toBe('')
  })

  it.each([
    ['a7a8n', 'WN'],
    ['a7a8r', 'WR'],
    ['a7a8q', 'WQ'],
    ['a7a8', 'WQ'], // no piece given: queen
  ])('promotes %s without opening the promotion panel', (uci, piece) => {
    const store = storeWithPosition([
      ['', '', '', '', '', '', '', ''],
      ['WP', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', 'BK'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ])
    expect(store.getState().applyMove(uci)).toBe(true)
    expect(pieceAt(store, 'a8').slice(0, 2)).toBe(piece)
    expect(store.getState().coronation.status).toBe(false)
    expect(store.getState().turn).toBe('B')
  })
})

describe('toFEN', () => {
  it('describes the starting position', () => {
    expect(createChessStore().getState().toFEN())
      .toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  })

  it('tracks turn, castling rights and move counters', () => {
    const store = createChessStore()
    store.getState().applyMove('e2e4')
    expect(store.getState().toFEN()).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')

    store.getState().applyMove('e7e5')
    store.getState().applyMove('e1e2') // the king moves: white loses both castling rights
    expect(store.getState().toFEN()).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR b kq - 1 2')
  })

  it('drops the castling right of a rook that moved', () => {
    const store = createChessStore()
    store.getState().applyMove('h2h4')
    store.getState().applyMove('a7a5')
    store.getState().applyMove('h1h3')
    store.getState().applyMove('a8a6')
    expect(store.getState().toFEN().split(' ')[2]).toBe('Qk')
  })
})
