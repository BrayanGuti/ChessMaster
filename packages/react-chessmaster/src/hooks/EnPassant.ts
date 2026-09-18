import { ChessBoardCell, ChessBoardPositions, MoveRecord } from "../store/types"

type Coords = ChessBoardCell['coordinates']

/**
 * The square a pawn could capture en passant on right now, or null.
 * It is derived from the last move (a pawn that just advanced two squares), so it needs no
 * extra state: the move history already holds everything, including in saved games.
 */
export function getEnPassantTarget(moveHistory: MoveRecord[]): Coords | null {
  const last = moveHistory[moveHistory.length - 1]
  if (!last || last.piece[1] !== 'P' || last.from[0] !== last.to[0]) return null

  const fromRank = Number(last.from[1])
  const toRank = Number(last.to[1])
  if (Math.abs(toRank - fromRank) !== 2) return null

  return { col: last.to.charCodeAt(0) - 97, row: 8 - (fromRank + toRank) / 2 }
}

/**
 * If moving `from` to `to` is an en passant capture, the square of the pawn it removes
 * (beside the capturing pawn, not on the destination square). Otherwise null.
 */
export function getEnPassantCapturedSquare(
  board: ChessBoardPositions,
  from: Coords,
  to: Coords,
  enPassant: Coords | null
): Coords | null {
  if (!enPassant || to.row !== enPassant.row || to.col !== enPassant.col) return null
  if (board[from.row][from.col].piece[1] !== 'P' || from.col === to.col) return null
  return { row: from.row, col: to.col }
}
