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
      newBoard[row][col].isUnderAttackBy.push(piece) 
    })
  })

  isCheck(newBoard)

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

function isCheck(newBoard: ChessBoardPositions): boolean {
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.piece[1] !== 'K') { continue}

      const attackingPieces = cell.isUnderAttackBy
        .filter((attacker) => attacker[0] !== cell.piece[0])
        .map((attacker) => attacker)
      
      if (attackingPieces.length > 0) {
        console.log('check')

        const moves = calculateFuturesMoves(cell, newBoard)
        
        if(attackingPieces.length === 1) {
          thatPieceCanBeKilled(newBoard, attackingPieces[0])
        }

        if (attackingPieces.length > 1 && moves.length === 0) {
          return true
        }
      }   
    }
  }
  return false
}

function thatPieceCanBeKilled(newBoard: ChessBoardPositions, piece: string): Array<string> {
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.piece === piece) {
        return cell.isUnderAttackBy
        .filter((attacker) => attacker[0] !== cell.piece[0])
        .map((attacker) => attacker)
      }
    }
  }
  return []
}