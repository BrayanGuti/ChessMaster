import { calculateAvailableMoves } from "./CalculateMoves"
import { wouldLeaveKingInCheck } from "./CheckMate"
import { ChessBoardCell, ChessBoardPositions } from "../store/types"

export type PromotionPiece = 'q' | 'r' | 'b' | 'n'

export interface LegalMove {
  from: ChessBoardCell['coordinates']
  to: ChessBoardCell['coordinates']
  /** Long algebraic (UCI) notation: "e2e4", or "e7e8q" for a promotion */
  uci: string
}

const PROMOTION_PIECES: PromotionPiece[] = ['q', 'r', 'b', 'n']

/**
 * Every legal move for `color`: each candidate from calculateAvailableMoves is played on a
 * copy of the board and kept only if it does not leave that side's king in check. This is the
 * same test hasAnyLegalMove uses, so it covers pins, checks and king safety in one rule.
 * Promotions are listed once per piece (e7e8q, e7e8r, e7e8b, e7e8n).
 */
export function getLegalMoves(board: ChessBoardPositions, color: 'W' | 'B'): LegalMove[] {
  const moves: LegalMove[] = []
  const kingInCheck = board.some(row =>
    row.some(cell =>
      cell.piece[0] === color && cell.piece[1] === 'K' &&
      cell.isUnderAttackBy.some(attacker => attacker.piece[0] !== color)
    )
  )

  for (const row of board) {
    for (const cell of row) {
      if (cell.piece[0] !== color) continue

      for (const to of calculateAvailableMoves(cell, board)) {
        const isCastling = cell.piece[1] === 'K' && Math.abs(to.col - cell.coordinates.col) === 2
        // Castling out of check is not allowed (the castling generator does not check the king's own square)
        if (isCastling && kingInCheck) continue
        if (wouldLeaveKingInCheck(board, cell, to, color)) continue

        const uci = cell.cellName + board[to.row][to.col].cellName
        const isPromotion = cell.piece[1] === 'P' && (to.row === 0 || to.row === 7)
        if (isPromotion) {
          PROMOTION_PIECES.forEach(piece => moves.push({ from: cell.coordinates, to, uci: uci + piece }))
        } else {
          moves.push({ from: cell.coordinates, to, uci })
        }
      }
    }
  }

  return moves
}

/** Splits "e7e8q" into board coordinates (row 0 = rank 8) and the promotion piece, or null if malformed. */
export function parseUci(uci: string): { from: LegalMove['from']; to: LegalMove['to']; promotion?: PromotionPiece } | null {
  const match = /^([a-h])([1-8])([a-h])([1-8])([qrbn])?$/.exec(uci.trim().toLowerCase())
  if (!match) return null
  const [, fromFile, fromRank, toFile, toRank, promotion] = match
  const coords = (file: string, rank: string) => ({ col: file.charCodeAt(0) - 97, row: 8 - Number(rank) })
  return {
    from: coords(fromFile, fromRank),
    to: coords(toFile, toRank),
    promotion: promotion as PromotionPiece | undefined,
  }
}
