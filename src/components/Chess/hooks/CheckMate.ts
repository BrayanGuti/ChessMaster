import { calculateAvailableMoves, calculateFuturesMoves } from "./CalculateMoves"
import { markCellsUnderAttack } from "./MarkCellsUnderAttack"

export function isCheckmate(newBoard: ChessBoardPositions, kingInCheck: ChessBoardCell): 
  { protectors: Array<{attacker: ChessBoardCell, cellToAttack: ChessBoardCell}>, 
    blockers: Array<{blocker: ChessBoardCell, cellToDefend: ChessBoardCell}>, 
    moves: Array<{ row: number, col: number }>, 
    isCheckmate: boolean, 
    check: boolean, 
    attackers: 
    {path: ChessBoardCell[], attackerCell: ChessBoardCell} | null, 
    numberOfAttackersIsOne: boolean } {
  
  const attackingPieces = thatPieceCanBeKilled(kingInCheck)
  const moves = calculateFuturesMoves(kingInCheck, newBoard)
  const protectors: Array<{attacker: ChessBoardCell, cellToAttack: ChessBoardCell}> = []
  const blockers: Array<{blocker: ChessBoardCell, cellToDefend: ChessBoardCell}> = []
  let isCheckmate = false
  let attackers = null
  let numberOfAttackersIsOne = false
  let check = false

  if(attackingPieces.length >= 1){
    check = true
  }

  if (attackingPieces.length === 1) {
    const [blocker, attacker] = canBlockAttack(newBoard, kingInCheck, attackingPieces[0].attacker)
    protectors.push(...thatPieceCanBeKilled(attackingPieces[0].attacker))
    blockers.push(... blocker)
    numberOfAttackersIsOne = true
    attackers = attacker
  }

  if (protectors.length === 0 && blockers.length === 0 && moves.length === 0) {
    isCheckmate = true
  }

  return {protectors, blockers, moves, isCheckmate, check, attackers, numberOfAttackersIsOne}
}


function thatPieceCanBeKilled(chessCell: ChessBoardCell): Array<{attacker: ChessBoardCell, cellToAttack: ChessBoardCell}> {
  return chessCell.isUnderAttackBy
    .filter((attacker) => attacker.piece[0] !== chessCell.piece[0] && attacker.piece[1] !== 'K')
    .map((attacker) => ({ attacker, cellToAttack: chessCell }))
}

function canBlockAttack(newBoard: ChessBoardPositions, kingInCheck: ChessBoardCell, attackerCell: ChessBoardCell): [{blocker: ChessBoardCell, cellToDefend: ChessBoardCell}[], {path: ChessBoardCell[], attackerCell: ChessBoardCell}] {
  const blockers: Array<{blocker: ChessBoardCell, cellToDefend: ChessBoardCell}> = []
  const path = getAttackPath(kingInCheck, attackerCell, newBoard)
  const pawns = getAllThePawns(newBoard, kingInCheck.piece[0])
  const attacker = {path, attackerCell}

  for (const cell of path) {
    cell.isUnderAttackBy.forEach((attacker) => {
      if (attacker.piece[0] === kingInCheck.piece[0] && attacker.piece[1] !== 'K' && attacker.piece[1] !== 'P' && isCurrentlyProtector(newBoard, attacker)) {
        blockers.push({blocker: attacker, cellToDefend: cell})
      }
    })

    for (const pawnCell of pawns) {
      calculateAvailableMoves(pawnCell, newBoard).forEach((move) => {
        if(move.col === cell.coordinates.col && move.row === cell.coordinates.row && isCurrentlyProtector(newBoard, pawnCell)){
          blockers.push({blocker: pawnCell, cellToDefend: cell})
        }
      })
    }
  }

  return [blockers, attacker]
}

function getAllThePawns(newBoard: ChessBoardPositions, color: string): Array<ChessBoardCell> {
  const pawns: ChessBoardCell[] = []
  newBoard.forEach((row) => {
    row.forEach((cell) => {
      if(cell.piece[0] === color && cell.piece[1] === 'P'){
        pawns.push(cell)
      }
    })
  })
  return pawns
}

function getAttackPath(kingCell: ChessBoardCell, attackerCell: ChessBoardCell, newBoard: ChessBoardPositions): Array<ChessBoardCell> {
  const path = []
  const { row: kingRow, col: kingCol } = kingCell.coordinates
  const { row: attackerRow, col: attackerCol } = attackerCell.coordinates
  if(attackerCell.piece[1] === 'R' || attackerCell.piece[1] === 'Q'){
    if (kingRow === attackerRow ) {
      const [minCol, maxCol] = [Math.min(kingCol, attackerCol), Math.max(kingCol, attackerCol)]
      for (let col = minCol + 1; col < maxCol; col++) {
        path.push(newBoard[kingRow][col])
      }
    }

    else if (kingCol === attackerCol) {
      const [minRow, maxRow] = [Math.min(kingRow, attackerRow), Math.max(kingRow, attackerRow)]
      for (let row = minRow + 1; row < maxRow; row++) {
        path.push(newBoard[row][kingCol])
      }
    }
  }

  if(attackerCell.piece[1] === 'B' || attackerCell.piece[1] === 'Q'){
    const rowDiff = Math.abs(kingRow - attackerRow)
    const colDiff = Math.abs(kingCol - attackerCol)
  
    if (rowDiff === colDiff) {
      const rowStep = kingRow < attackerRow ? 1 : -1  
      const colStep = kingCol < attackerCol ? 1 : -1
  
      for (let step = 1; step < rowDiff; step++) {
        path.push( newBoard[kingRow + step * rowStep][kingCol + step * colStep])
      }
    }
  }

  return path
}

function isCurrentlyProtector(newBoard:ChessBoardPositions, posibleProtector: ChessBoardCell): boolean {
  newBoard[posibleProtector.coordinates.row][posibleProtector.coordinates.col].piece = ""
  const newBoardStatus = markCellsUnderAttack(newBoard, true)  
  return !newBoardStatus.checkState.check
}

