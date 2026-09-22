import { calculateFuturesMoves } from './CalculateMoves'
import { ChessBoardCell, ChessBoardPositions, CheckStatus } from "../store/types"

type PiecesAndMovesList = Array<[ChessBoardCell, Array<{ row: number, col: number }>]>

/**
 * Marks which pieces attack each square and reports whether a king is in check. Checkmate and
 * stalemate are not decided here (the returned status has both false): that takes the legal
 * move rule, which applyGameEnd (CheckMate.ts) applies.
 */
export function markCellsUnderAttack(newBoard: ChessBoardPositions): {newBoard: ChessBoardPositions, checkState: CheckStatus} {

  const boardCleared = clearIsUnderAttackByAttribute(newBoard)
  const allPossibleMoves = calculateMovesForAllPieces(boardCleared)
  const boardUpdated = updateIsUnderAttackByAttribute(boardCleared, allPossibleMoves)

  return {newBoard: boardUpdated, checkState: checkStatusOf(boardUpdated)}
}

function checkStatusOf(board: ChessBoardPositions): CheckStatus {
  const kingInCheck = getKingInCheck(board)
  return {
    isCheckmate: false,
    isStalemate: false,
    check: kingInCheck !== null,
    colorOfCheck: kingInCheck ? kingInCheck.piece[0] : null
  }
}

function getKingInCheck(board: ChessBoardPositions): ChessBoardCell | null {
  for (const row of board) {
    for (const cell of row) {
      if (cell.piece[1] === 'K' && cell.isUnderAttackBy.some(attacker => attacker.piece[0] !== cell.piece[0])) {
        return cell
      }
    }
  }
  return null
}

function clearIsUnderAttackByAttribute(newBoard: ChessBoardPositions){
  return newBoard.map((row) =>
    row.map((cell) => ({
      ...cell,
      isUnderAttackBy: []
    }))
  )
}

function calculateMovesForAllPieces(board: ChessBoardPositions): PiecesAndMovesList{
  return board.reduce((acc, row) => {
    row.forEach((cell) => {
      if (cell.piece) {
        const moves = calculateFuturesMoves(cell, board)
        if (moves.length > 0) {
          acc.push([cell, moves])
        }
      }
    })
    return acc
  }, [] as Array<[ChessBoardCell, Array<{ row: number, col: number }>]>)
}

function updateIsUnderAttackByAttribute(board: ChessBoardPositions, allPossibleMoves: PiecesAndMovesList) {
  const updatedBoard = structuredClone(board)
  allPossibleMoves.forEach(([piece, cells]) => {
    cells.forEach(({ row, col }) => {
      updatedBoard[row][col].isUnderAttackBy.push(piece)
    })
  })
  return updatedBoard
}
