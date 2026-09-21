import { describe, it, expect } from 'vitest'
import { createChessStore } from '../store/createChessStore'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { ChessStoreApi } from '../store/types'
import { buildBoard, getCellByName } from './fixtures'

/** Store with a custom position and white to move. */
function storeWithPosition(pieces: string[][]): ChessStoreApi {
  const store = createChessStore()
  const { newBoard } = markCellsUnderAttack(buildBoard(pieces))
  store.setState({ chessBoardpositions: newBoard, turn: 'W' })
  return store
}

/** Plays every move through the engine path, which is the same path a human move takes. */
function play(store: ChessStoreApi, ...moves: string[]) {
  for (const move of moves) {
    if (!store.getState().applyMove(move)) throw new Error(`Illegal move ${move}`)
  }
}

const pieceAt = (store: ChessStoreApi, square: string) =>
  getCellByName(store.getState().chessBoardpositions, square)!.piece

/** The castling field of the FEN ("KQkq", "-", ...). */
const castlingRights = (store: ChessStoreApi) => store.getState().toFEN().split(' ')[2]

describe('undo', () => {
  it('puts the position, the turn and the history back', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'e7e5')

    store.getState().undoMove()

    const state = store.getState()
    expect(pieceAt(store, 'e5')).toBe('')
    expect(pieceAt(store, 'e7')).toBe('BPe7')
    expect(state.turn).toBe('B')
    expect(state.moveHistory.map(move => move.notation)).toEqual(['e4'])
    expect(state.cellOfPieceSelected).toBeNull()
  })

  it('does nothing before the first move, and never starts a new game', () => {
    const store = createChessStore()
    store.getState().undoMove()

    expect(store.getState().moveHistory).toHaveLength(0)
    expect(store.getState().gameId).toBe(0)
    expect(pieceAt(store, 'e2')).toBe('WPe2')
  })

  it('goes back move by move to the starting position', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'e7e5', 'g1f3', 'b8c6')

    for (let move = 0; move < 4; move++) store.getState().undoMove()

    const state = store.getState()
    expect(state.moveHistory).toHaveLength(0)
    expect(state.undoStack).toHaveLength(0)
    expect(state.turn).toBe('W')
    expect(pieceAt(store, 'g1')).toBe('WNg1')
    expect(pieceAt(store, 'b8')).toBe('BNb8')
  })

  // The move record keeps no `hasMoved` flag, and castling rights are read from those flags:
  // this is what an undo that reversed the move arithmetically would silently lose
  it('gives back the castling rights the undone move had spent', () => {
    const store = createChessStore()
    play(store, 'g2g4', 'g7g5', 'f1g2', 'f8g7', 'g1f3', 'g8f6')
    expect(castlingRights(store)).toBe('KQkq')

    play(store, 'h1g1') // the rook leaves its home square: no more kingside castling
    expect(castlingRights(store)).toBe('Qkq')

    store.getState().undoMove()

    expect(castlingRights(store)).toBe('KQkq')
    expect(pieceAt(store, 'h1')).toBe('WRh1')
    expect(store.getState().legalMoves()).toContain('e1g1')
  })

  it('takes back a castling move with its rook', () => {
    const store = createChessStore()
    play(store, 'g2g4', 'g7g5', 'f1g2', 'f8g7', 'g1f3', 'g8f6', 'e1g1')
    expect(pieceAt(store, 'g1')).toBe('WKe1')
    expect(pieceAt(store, 'f1')).toBe('WRf1') // castling renames the rook after its new square

    store.getState().undoMove()

    expect(pieceAt(store, 'e1')).toBe('WKe1')
    expect(pieceAt(store, 'h1')).toBe('WRh1')
    expect(pieceAt(store, 'f1')).toBe('')
    expect(pieceAt(store, 'g1')).toBe('')
    expect(castlingRights(store)).toBe('KQkq')
  })

  it('brings back the pawn captured en passant', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6')
    expect(pieceAt(store, 'd5')).toBe('')
    expect(pieceAt(store, 'd6')).toBe('WPe2')

    store.getState().undoMove()

    expect(pieceAt(store, 'e5')).toBe('WPe2')
    expect(pieceAt(store, 'd5')).toBe('BPd7')
    expect(pieceAt(store, 'd6')).toBe('')
    // The chance is on again: it is derived from the last move, which came back with the history
    expect(store.getState().legalMoves()).toContain('e5d6')
  })

  it('brings back the pawn, not the piece it promoted to', () => {
    const store = storeWithPosition([
      ['', '', '', '', '', '', '', ''],
      ['', 'WP', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', 'WK', '', ''],
      ['', '', '', '', '', '', '', 'BK'],
    ])
    play(store, 'b7b8q')
    expect(pieceAt(store, 'b8')).toBe('WQb7') // the promoted piece keeps the pawn's square name

    store.getState().undoMove()

    expect(pieceAt(store, 'b7')).toBe('WPb7')
    expect(pieceAt(store, 'b8')).toBe('')
    expect(store.getState().coronation.status).toBe(false)
    expect(store.getState().turn).toBe('W')
  })

  it('unlocks a finished game', () => {
    const store = createChessStore()
    play(store, 'f2f3', 'e7e5', 'g2g4', 'd8h4') // fool's mate
    expect(store.getState().checkState.isCheckmate).toBe(true)

    store.getState().undoMove()

    const state = store.getState()
    expect(state.checkState.isCheckmate).toBe(false)
    expect(state.checkState.check).toBe(false)
    expect(state.turn).toBe('B')
    expect(state.legalMoves().length).toBeGreaterThan(0)
  })

  it('takes back the computer reply too, so it is the player who moves', () => {
    const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'W', level: 2 } })
    play(store, 'e2e4', 'e7e5')
    expect(store.getState().turn).toBe('W')

    store.getState().undoMove()

    const state = store.getState()
    expect(state.turn).toBe('W')
    expect(state.moveHistory).toHaveLength(0)
    expect(pieceAt(store, 'e2')).toBe('WPe2')
    expect(pieceAt(store, 'e7')).toBe('BPe7')
  })

  // The player's own move can be the last ply (it mated, or the computer has not answered yet):
  // taking back two would then undo a move the player never made
  it('takes back one ply when the computer has not answered', () => {
    const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'W', level: 2 } })
    play(store, 'e2e4', 'e7e5', 'g1f3')

    store.getState().undoMove()

    expect(store.getState().turn).toBe('W')
    expect(store.getState().moveHistory.map(move => move.notation)).toEqual(['e4', 'e5'])
  })

  it('does nothing while the engine is thinking', () => {
    const store = createChessStore({ initialGameConfig: { mode: 'computer', colorChoice: 'W', level: 2 } })
    play(store, 'e2e4')
    store.getState().setAiThinking(true)

    store.getState().undoMove()

    expect(store.getState().moveHistory).toHaveLength(1)
  })

  it('a new game leaves nothing to undo', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'e7e5')

    store.getState().resetGame()
    expect(store.getState().undoStack).toHaveLength(0)

    play(store, 'd2d4')
    store.getState().startGame({ mode: 'local', colorChoice: 'W', level: 2 })
    expect(store.getState().undoStack).toHaveLength(0)
  })
})
