import { describe, it, expect } from 'vitest'
import { createChessStore } from '../store/createChessStore'
import { computeBestMove } from '../engine/jsChessEngineCore'
import { jsChessEngine } from '../engine/jsChessEngine'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { OpponentLevel } from '../store/types'
import { buildBoard, getCellByName } from './fixtures'

const LEVELS: OpponentLevel[] = [1, 2, 3, 4, 5]

function play(...moves: string[]) {
  const store = createChessStore()
  for (const move of moves) {
    if (!store.getState().applyMove(move)) throw new Error(`Illegal move ${move}`)
  }
  return store
}

describe('js-chess-engine adapter', () => {
  it.each(LEVELS)('answers a legal UCI move at level %i', (level) => {
    const store = createChessStore()
    const move = computeBestMove(store.getState().toFEN(), level)
    expect(move).toMatch(/^[a-h][1-8][a-h][1-8]$/)
    expect(store.getState().legalMoves()).toContain(move)
  })

  it('finds a mate in one (Scholar\'s mate)', () => {
    const store = play('e2e4', 'e7e5', 'f1c4', 'b8c6', 'd1h5', 'g8f6')
    const move = computeBestMove(store.getState().toFEN(), 3)
    expect(move).toBe('h5f7')
    store.getState().applyMove(move)
    expect(store.getState().checkState.isCheckmate).toBe(true)
  })

  it('reads the en passant square from our FEN and can capture en passant', () => {
    // After d7d5 the only way to win the pawn back at once is exd6 en passant; the engine sees the square
    const store = play('e2e4', 'a7a6', 'e4e5', 'd7d5')
    expect(store.getState().toFEN().split(' ')[3]).toBe('d6')
    const move = computeBestMove(store.getState().toFEN(), 2)
    expect(store.getState().legalMoves()).toContain(move)
  })

  it('answers promotions without the piece, which applyMove plays as a queen', () => {
    // White pawn on b7 about to promote, kings far away. At level 2 promoting now scores 945 vs 170
    // for anything else (at deeper levels a king move first scores the same: it promotes next turn)
    const { newBoard, checkState } = markCellsUnderAttack(buildBoard([
      ['', '', '', '', '', '', '', ''],
      ['', 'WP', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['BK', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', 'WK'],
    ]))
    const store = createChessStore()
    store.setState({ chessBoardpositions: newBoard, checkState, turn: 'W' })

    const move = computeBestMove(store.getState().toFEN(), 2)
    expect(move).toBe('b7b8')
    expect(store.getState().applyMove(move)).toBe(true)
    expect(getCellByName(store.getState().chessBoardpositions, 'b8')!.piece.slice(0, 2)).toBe('WQ')
  })

  it('jsChessEngine falls back to the main thread where there are no workers (jsdom)', async () => {
    const store = createChessStore()
    const state = store.getState()
    const move = await jsChessEngine({ fen: state.toFEN(), legalMoves: state.legalMoves(), level: 1 })
    expect(state.legalMoves()).toContain(move)
  })

  it('plays a whole game against itself with legal moves only', () => {
    const store = createChessStore()
    for (let ply = 0; ply < 60; ply++) {
      const state = store.getState()
      if (state.legalMoves().length === 0) break
      const move = computeBestMove(state.toFEN(), 1)
      expect(store.getState().applyMove(move)).toBe(true)
    }
    expect(store.getState().moveHistory.length).toBeGreaterThan(10)
  }, 60_000)
})
