import { calculateFuturesMoves } from './CalculateMoves'
import { isCheckmate } from './CheckMate'


type PiecesAndMovesList = Array<[ChessBoardCell, Array<{ row: number, col: number }>]>

export function markCellsUnderAttack(newBoard: ChessBoardPositions, deepLooking = false): {newBoard: ChessBoardPositions, checkState: CheckStatus} {
  
  clearIsUnderAttackByAtribute(newBoard)
  const allPosibleMoves = calculateMovesForAllPieces(newBoard)
  updateIsUnderAttackByAtribute(newBoard, allPosibleMoves)
  
  return {newBoard, checkState: isCheckmate(newBoard, deepLooking)}
}

function clearIsUnderAttackByAtribute(newBoard: ChessBoardPositions){
  newBoard.forEach((row) => {
    row.forEach((cell) => {
      cell.isUnderAttackBy = []
    })
  })
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
  allPosibleMoves.forEach(([piece, cells]) => {
    cells.forEach(({ row, col }) => {
      board[row][col].isUnderAttackBy.push(piece) 
    })
  })

}