import { ChessBoardCell, ChessBoardPositions, Coords } from "../store/types"

/**
 * A copy of the board with the piece on `fromCell` moved to `to`: the origin is left empty and
 * marked as moved. `capturedSquare` is the pawn taken en passant, which is not on `to`.
 * The rook of a castling move is not moved here (see isCastling).
 */
export function boardAfterMove(
  board: ChessBoardPositions,
  fromCell: ChessBoardCell,
  to: Coords,
  capturedSquare: Coords | null = null
): ChessBoardPositions {
  return board.map(row =>
    row.map(cell => {
      if (cell.coordinates.row === to.row && cell.coordinates.col === to.col) {
        return { ...cell, piece: fromCell.piece }
      }
      if (cell.coordinates.row === fromCell.coordinates.row && cell.coordinates.col === fromCell.coordinates.col) {
        return { ...cell, piece: '', hasMoved: true }
      }
      if (capturedSquare && cell.coordinates.row === capturedSquare.row && cell.coordinates.col === capturedSquare.col) {
        return { ...cell, piece: '' }
      }
      return cell
    })
  )
}
