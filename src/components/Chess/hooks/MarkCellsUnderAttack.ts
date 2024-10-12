import { calculateFuturesMoves } from './CalculateMoves'

export function markCellsUnderAttack(newBoard: ChessBoardPositions) {
  newBoard.forEach((row) => {
    row.forEach((cell) => {
      cell.isUnderAttackBy = []
    })
  })

  const cellsUnderAttack = getAttackedCells(newBoard)

  cellsUnderAttack.forEach(([piece, cells]) => {
    cells.forEach(({ row, col }) => {
      if (newBoard[row][col].piece[1] === 'K' && newBoard[row][col].piece[0] !== piece[0]) {
        console.log('CHECK')
      }
      newBoard[row][col].isUnderAttackBy.push(piece) 
    })
  })

  return newBoard
}

function getAttackedCells(newBoard: ChessBoardPositions) {
  const cellsUnderAttack: Array<[string, Array<{ row: number, col: number }>]> = []

  newBoard.forEach((row) => {
    row.forEach((cell) => {
      if (!cell.piece) return

      const piece = cell.piece
      const moves = calculateFuturesMoves(cell, newBoard)
      if (moves.length > 0) {
        cellsUnderAttack.push([piece, moves])
      }
    })
  })

  return cellsUnderAttack
}
