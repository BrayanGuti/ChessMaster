import { calculateFuturesMoves } from './CalculateMoves'
import { isCheckmate } from './CheckMate'

export function markCellsUnderAttack(newBoard: ChessBoardPositions, lookingForCheck = false) {
  const cellsUnderAttack: Array<[ChessBoardCell, Array<{ row: number, col: number }>]> = []

  newBoard.forEach((row) => {
    row.forEach((cell) => {
      cell.isUnderAttackBy = []
    })
  })

  newBoard.forEach((row) => {
    row.forEach((cell) => {
      if (!cell.piece) return

      const chessCellPiece = cell
      const moves = calculateFuturesMoves(cell, newBoard)
      if (moves.length > 0) {
        cellsUnderAttack.push([chessCellPiece, moves])
      }
    })
  })

  let kingInCheck = null

  cellsUnderAttack.forEach(([piece, cells]) => {
    cells.forEach(({ row, col }) => {
      if(newBoard[row][col].piece[1] === 'K' && piece.piece[0] !== newBoard[row][col].piece[0]){
        kingInCheck = newBoard[row][col] 
      }
      newBoard[row][col].isUnderAttackBy.push(piece) 
    })
  })

  if(kingInCheck){
    if(lookingForCheck){
      return {newBoard, checkState: { protectors: [], blockers: [], moves: [], isCheckmate: false, check: true, attackers: null, numberOfAttackersIsOne: false }}
    }

    return {newBoard, checkState: isCheckmate(newBoard, kingInCheck)}
  }

  return {newBoard, checkState: { protectors: [], blockers: [], moves: [], isCheckmate: false, check: false, attackers: null, numberOfAttackersIsOne: false }}
}

