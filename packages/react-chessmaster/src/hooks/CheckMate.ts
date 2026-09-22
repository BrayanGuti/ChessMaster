import { calculateAvailableMoves } from "./CalculateMoves"
import { markCellsUnderAttack } from "./MarkCellsUnderAttack"
import { getEnPassantCapturedSquare } from "./EnPassant"
import { boardAfterMove } from "./BoardAfterMove"
import { ChessBoardPositions, CheckStatus, ChessBoardCell, Coords } from "../store/types"

export function hasAnyLegalMove(
  board: ChessBoardPositions,
  color: string,
  enPassant: ChessBoardCell['coordinates'] | null = null
): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.piece[0] !== color) continue

      const moves = calculateAvailableMoves(cell, board, enPassant)
      for (const move of moves) {
        const captured = getEnPassantCapturedSquare(board, cell.coordinates, move, enPassant)
        if (!wouldLeaveKingInCheck(board, cell, move, color, captured)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Decides checkmate and stalemate for the side to move with the same rule as the legal move
 * generator: no legal move at all means mate if in check, stalemate otherwise (markCellsUnderAttack
 * only reports the check). With a promotion pending the pawn is still on the last rank, so the
 * position is not final yet: makeCoronation evaluates it again. Mutates `checkState`.
 */
export function applyGameEnd(
  board: ChessBoardPositions,
  checkState: CheckStatus,
  sideToMove: string,
  enPassant: ChessBoardCell['coordinates'] | null,
  promotionPending: boolean
) {
  checkState.isCheckmate = false
  checkState.isStalemate = false
  if (promotionPending) return
  const canMove = hasAnyLegalMove(board, sideToMove, enPassant)
  if (checkState.check) checkState.isCheckmate = !canMove
  else checkState.isStalemate = !canMove
}

/**
 * Plays the move on a copy of the board and tells whether `color`'s own king ends up attacked.
 * `capturedSquare` is the pawn removed by an en passant capture (it is not on `toCoords`).
 */
export function wouldLeaveKingInCheck(
  board: ChessBoardPositions,
  fromCell: ChessBoardCell,
  toCoords: Coords,
  color: string,
  capturedSquare: Coords | null = null
): boolean {
  // Look at this side's king specifically: the move may also check the other king, and
  // checkState only reports the first king in check it finds
  const { newBoard } = markCellsUnderAttack(boardAfterMove(board, fromCell, toCoords, capturedSquare))
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.piece[0] === color && cell.piece[1] === 'K') {
        return cell.isUnderAttackBy.some(attacker => attacker.piece[0] !== color)
      }
    }
  }
  return false
}
