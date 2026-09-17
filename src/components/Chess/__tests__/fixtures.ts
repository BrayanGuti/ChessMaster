import { ChessBoardPositions, ChessBoardCell } from '../store/types'

/**
 * Helper to build chess board from piece array notation.
 * Piece notation: "WPe2" (White Pawn e2), "BKe8" (Black King e8), "" (empty)
 * Array is 8x8 from rank 8 (row 0) to rank 1 (row 7)
 */
export function buildBoard(piecesArray: string[][]): ChessBoardPositions {
  if (piecesArray.length !== 8 || piecesArray.some(row => row.length !== 8)) {
    throw new Error('Board must be 8x8')
  }

  const board = piecesArray.map((row, rowIndex) => {
    return row.map((piece, colIndex) => {
      const cellName = String.fromCharCode(97 + colIndex) + (8 - rowIndex)
      const coordinates = { col: colIndex, row: rowIndex }

      if (piece === '') {
        return {
          piece: '' as ChessBoardCell['piece'],
          YouCanMoveHere: false,
          isUnderAttackBy: [],
          hasMoved: true,
          cellName: cellName as ChessBoardCell['cellName'],
          coordinates,
        }
      }

      // Construct full piece name with coordinates (e.g., "WPe2" from "WP" + "e2")
      const fullPieceName = piece + cellName

      return {
        piece: fullPieceName as ChessBoardCell['piece'],
        YouCanMoveHere: false,
        isUnderAttackBy: [],
        hasMoved: false,
        cellName: cellName as ChessBoardCell['cellName'],
        coordinates,
      }
    })
  })

  // Note: NOT applying markCellsUnderAttack here to keep test fixtures pure and predictable
  // Tests that need attack calculation will call it explicitly
  return board
}

/**
 * Mark a piece as already moved (hasMoved: true)
 */
export function setHasMoved(board: ChessBoardPositions, pieceName: string): ChessBoardPositions {
  return board.map(row =>
    row.map(cell =>
      cell.piece === pieceName ? { ...cell, hasMoved: true } : cell
    )
  )
}

/**
 * Empty board with just kings for testing
 */
export function emptyBoard(): ChessBoardPositions {
  return buildBoard([
    ['', '', '', '', 'BK', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', 'WK', '', '', ''],
  ])
}

/**
 * Standard starting position
 */
export function startingPosition(): ChessBoardPositions {
  return buildBoard([
    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
    ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR'],
  ])
}

/**
 * Position with simple check: white pawn attacks black king
 */
export function positionWithSimpleCheck(): ChessBoardPositions {
  return buildBoard([
    ['', '', '', '', 'BK', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', 'WP', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', 'WK', '', '', ''],
  ])
}

/**
 * Fool's mate position: white has made terrible moves, black can checkmate
 * 1.f3 e5 2.g4 Qh4#
 */
export function positionBeforeFoolsMate(): ChessBoardPositions {
  return buildBoard([
    ['BR', 'BN', 'BB', '', 'BK', 'BB', 'BN', 'BR'],
    ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', 'BP', '', '', ''],
    ['', '', '', '', '', '', 'WP', ''],
    ['', '', '', '', '', 'WP', '', ''],
    ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],
    ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR'],
  ])
}

/**
 * Position where white can move queen to h4 to deliver checkmate
 */
export function positionWithCheckmate(): ChessBoardPositions {
  return buildBoard([
    ['BR', '', 'BB', '', 'BK', 'BB', '', 'BR'],
    ['BP', 'BP', 'BP', 'BP', '', 'BP', 'BP', 'BP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', 'BP', '', '', ''],
    ['', '', '', '', '', '', '', 'WQ'],
    ['', '', '', '', '', 'WP', '', ''],
    ['WP', 'WP', 'WP', 'WP', 'WP', '', '', 'WP'],
    ['WR', 'WN', 'WB', '', 'WK', 'WB', 'WN', 'WR'],
  ])
}

/**
 * Position with stalemate: black king in corner, no moves, not in check
 */
export function positionWithStalemate(): ChessBoardPositions {
  return buildBoard([
    ['BK', 'WQ', '', '', '', '', '', ''],
    ['WP', 'WP', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', 'WK'],
  ])
}

/**
 * Castling setup: white can castle kingside, rook and king haven't moved
 */
export function positionForKingsideCastling(): ChessBoardPositions {
  return buildBoard([
    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
    ['WR', 'WN', 'WB', 'WQ', 'WK', '', '', 'WR'],
  ])
}

/**
 * Castling setup: white can castle queenside
 */
export function positionForQueensideCastling(): ChessBoardPositions {
  return buildBoard([
    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
    ['WR', '', '', 'WQ', 'WK', 'WB', 'WN', 'WR'],
  ])
}

/**
 * Get a cell by its name (e.g., "e4", "h1")
 */
export function getCellByName(board: ChessBoardPositions, cellName: string): ChessBoardCell | null {
  for (const row of board) {
    for (const cell of row) {
      if (cell.cellName === cellName) {
        return cell
      }
    }
  }
  return null
}

/**
 * Get a piece by its name (e.g., "WPe2")
 */
export function getPieceCell(board: ChessBoardPositions, pieceName: string): ChessBoardCell | null {
  for (const row of board) {
    for (const cell of row) {
      if (cell.piece === pieceName) {
        return cell
      }
    }
  }
  return null
}
