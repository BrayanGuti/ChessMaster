import { describe, it, expect } from 'vitest'
import { createChessStore, hydrateChessStore } from '../store/createChessStore'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { ChessStoreApi, MoveRecord } from '../store/types'
import { buildBoard, getCellByName } from './fixtures'

const pieceAt = (store: ChessStoreApi, square: string) =>
  getCellByName(store.getState().chessBoardpositions, square)!.piece

function play(store: ChessStoreApi, ...moves: string[]) {
  for (const move of moves) {
    if (!store.getState().applyMove(move)) throw new Error(`Illegal move ${move}`)
  }
}

/** Store with a custom position whose last move was `lastMove` (it sets the en passant square). */
function storeAfter(pieces: string[][], lastMove: Omit<MoveRecord, 'notation' | 'turnNumber' | 'captured'>, turn: 'W' | 'B') {
  const store = createChessStore()
  const { newBoard, checkState } = markCellsUnderAttack(buildBoard(pieces))
  store.setState({
    chessBoardpositions: newBoard,
    checkState,
    turn,
    moveHistory: [{ ...lastMove, captured: null, notation: '', turnNumber: 1 }],
  })
  // Evaluate mate / stalemate for the side to move, as after a real move
  store.getState().updateCellsUnderAttack(turn)
  return store
}

describe('en passant', () => {
  it('captures the pawn that just advanced two squares', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'a7a6', 'e4e5', 'd7d5')
    expect(store.getState().legalMoves()).toContain('e5d6')

    play(store, 'e5d6')
    const history = store.getState().moveHistory
    const last = history[history.length - 1]
    expect(pieceAt(store, 'd6')).toBe('WPe2')
    expect(pieceAt(store, 'd5')).toBe('') // the captured pawn, beside the capturing one
    expect(pieceAt(store, 'e5')).toBe('')
    expect(last.captured).toBe('BPd7')
    expect(last.notation).toBe('exd6')
  })

  it('is only possible right after the two-square advance', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'a7a6', 'e4e5', 'd7d5', 'a2a3', 'a6a5')
    expect(store.getState().legalMoves()).not.toContain('e5d6')
  })

  it('is not offered after a one-square advance', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'd7d6', 'e4e5', 'd6d5')
    expect(store.getState().legalMoves()).not.toContain('e5d6')
  })

  it('is shown as a move hint when the pawn is selected (human path)', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'a7a6', 'e4e5', 'd7d5')
    store.getState().clickCell(getCellByName(store.getState().chessBoardpositions, 'e5')!)
    expect(getCellByName(store.getState().chessBoardpositions, 'd6')!.YouCanMoveHere).toBe(true)

    store.getState().clickCell(getCellByName(store.getState().chessBoardpositions, 'd6')!)
    expect(pieceAt(store, 'd5')).toBe('')
    expect(store.getState().turn).toBe('B')
  })

  it('is illegal when removing both pawns exposes the king along the rank', () => {
    // White king a5, pawns b5 (white) and c5 (black, just advanced), black rook h5
    const store = storeAfter([
      ['', '', '', '', '', '', '', 'BK'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['WK', 'WP', 'BP', '', '', '', '', 'BR'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ], { piece: 'BPc7', from: 'c7', to: 'c5' }, 'W')
    expect(store.getState().legalMoves()).not.toContain('b5c6')
  })

  it('counts as a way out of check (not checkmate)', () => {
    // The pawn that just advanced checks the white king; capturing it en passant is the only escape
    const store = storeAfter([
      ['', '', '', '', '', 'BR', '', 'BK'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', 'BP', 'WP', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', 'BB', 'BR', '', '', '', ''],
    ], { piece: 'BPd7', from: 'd7', to: 'd5' }, 'W')

    const { checkState, legalMoves } = store.getState()
    expect(checkState.check).toBe(true)
    expect(checkState.isCheckmate).toBe(false)
    expect(legalMoves()).toEqual(['e5d6'])
  })

  it('puts the en passant square in the FEN', () => {
    const store = createChessStore()
    play(store, 'e2e4', 'a7a6', 'e4e5', 'd7d5')
    expect(store.getState().toFEN().split(' ')[3]).toBe('d6')
    play(store, 'a2a3')
    expect(store.getState().toFEN().split(' ')[3]).toBe('-')
  })

  it('survives a save and reload in the middle of the chance', () => {
    const store = createChessStore({ storageKey: 'react-chessmaster:ep-test' })
    play(store, 'e2e4', 'a7a6', 'e4e5', 'd7d5')

    const restored = createChessStore({ storageKey: 'react-chessmaster:ep-test' })
    hydrateChessStore(restored)
    expect(restored.getState().legalMoves()).toContain('e5d6')
    localStorage.clear()
  })
})

describe('king safety', () => {
  it('rejects a pinned piece moving off the pin even if it gives check', () => {
    // The e2 bishop is pinned by the e8 rook; Bb5 would check the black king on a4
    const store = storeAfter([
      ['', '', '', '', 'BR', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['BK', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', 'WB', '', '', ''],
      ['', '', '', '', 'WK', '', '', ''],
    ], { piece: 'BKa5', from: 'a5', to: 'a4' }, 'W')
    const moves = store.getState().legalMoves()
    expect(moves.some(move => move.startsWith('e2'))).toBe(false)
  })
})
