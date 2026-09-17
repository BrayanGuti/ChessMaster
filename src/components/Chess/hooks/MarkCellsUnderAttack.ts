import { calculateFuturesMoves } from './CalculateMoves'
import { isCheckmate } from './CheckMate'


type PiecesAndMovesList = Array<[ChessBoardCell, Array<{ row: number, col: number }>]>

export function markCellsUnderAttack(newBoard: ChessBoardPositions, deepLooking = false): {newBoard: ChessBoardPositions, checkState: CheckStatus} {

  const boardCleared = clearIsUnderAttackByAtribute(newBoard)
  const allPosibleMoves = calculateMovesForAllPieces(boardCleared)
  const boardUpdated = updateIsUnderAttackByAtribute(boardCleared, allPosibleMoves)

  return {newBoard: boardUpdated, checkState: isCheckmate(boardUpdated, deepLooking)}
}

function clearIsUnderAttackByAtribute(newBoard: ChessBoardPositions){
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

function updateIsUnderAttackByAtribute(board: ChessBoardPositions, allPosibleMoves: PiecesAndMovesList) {
  const updatedBoard = structuredClone(board)
  allPosibleMoves.forEach(([piece, cells]) => {
    cells.forEach(({ row, col }) => {
      updatedBoard[row][col].isUnderAttackBy.push(piece)
    })
  })
  return updatedBoard
}