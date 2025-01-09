import { calculateAvailableMoves, calculateFuturesMoves } from "./CalculateMoves"
import { markCellsUnderAttack } from "./MarkCellsUnderAttack"

export function isCheckmate(Board: ChessBoardPositions, deepLooking = false): CheckStatus {
  const checkState: CheckStatus = {
    protectors: [], 
    blockers: [], 
    allDefenders: [],
    moves: [], 
    isCheckmate: false, 
    check: false, 
    attackers: null, 
    numberOfAttackersIsOne: false,
    colorOfCheck: null
  }

  const kingInCheck = getKingInCheck(Board)
  
  if(kingInCheck === null){
    return checkState
  }

  checkState.check = true
  checkState.colorOfCheck = kingInCheck.piece[0]

  if(deepLooking){
    console.log(kingInCheck.isUnderAttackBy)
    console.log('este es el rey en jaque:', kingInCheck.piece)
    return checkState
  }

  const newBoard = structuredClone(Board)
  const attackingPieces = thatPieceCanBeKilledBy(kingInCheck)
  const moves = calculateFuturesMoves(kingInCheck, newBoard)
  


  if (attackingPieces.length === 1) {
    const [blocker, attacker] = canBlockAttack(newBoard, kingInCheck, attackingPieces[0].attacker)
    checkState.protectors.push(...getProtectors(attackingPieces[0].attacker, newBoard))
    checkState.blockers.push(...blocker)
    checkState.allDefenders.push(...mergeProtectorsAndBlockers(checkState.protectors, checkState.blockers))
    checkState.numberOfAttackersIsOne = true
    checkState.attackers = attacker
  }

  if (checkState.protectors.length === 0 && checkState.blockers.length === 0 && moves.length === 0) {
    checkState.isCheckmate = true
  }

  return checkState
}

function mergeProtectorsAndBlockers(protectors: CheckStatus['protectors'], blockers: CheckStatus['blockers']): CheckStatus['allDefenders'] {
  const allDefenders: CheckStatus['allDefenders'] = []

  const modifiedProtectors = protectors.map((protector) => ({
    protector: protector.attacker,
    cellToProtect: protector.cellToAttack
  }))

  console.log('estos son los protectores:', modifiedProtectors)
  const modifiedBlockers = blockers.map((blocker) => ({
    protector: blocker.blocker,
    cellToProtect: blocker.cellToDefend
  }))
  console.log('estos son los blockers:', modifiedBlockers)

  const combinedDefenders = [...modifiedProtectors, ...modifiedBlockers]

  combinedDefenders.forEach((defender) => {
    const existingDefender = allDefenders.find(d => d.protector.cellName === defender.protector.cellName)
    if (existingDefender) {
      existingDefender.cellToProtect.push(...defender.cellToProtect)
    } else {
      allDefenders.push(defender)
    }
  })

  return allDefenders
}

function getKingInCheck(newBoard: ChessBoardPositions): ChessBoardCell | null {
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.piece[1] === 'K') {
        for (const attacker of cell.isUnderAttackBy) {
          if (attacker.piece[0] !== cell.piece[0]) {
            return cell
          }
        }
      }
    }
  }
  return null
}


function thatPieceCanBeKilledBy(chessCell: ChessBoardCell): Array<{attacker: ChessBoardCell, cellToAttack: ChessBoardCell}> {
  return chessCell.isUnderAttackBy
    .filter((attacker) => attacker.piece[0] !== chessCell.piece[0] && attacker.piece[1] !== 'K')
    .map((attacker) => ({ attacker, cellToAttack: chessCell }))
}

function getProtectors(cellToAttack: ChessBoardCell, board: ChessBoardPositions): CheckStatus['protectors'] {
  console.log('estos son los potenciales protectores:', thatPieceCanBeKilledBy(cellToAttack))
  console.log('tablero', board)

  const potentialProtectors = thatPieceCanBeKilledBy(cellToAttack)
    .filter(({ attacker }) => isCurrentlyProtector(board, attacker, cellToAttack))
    .map(({ attacker, cellToAttack }) => ({ attacker, cellToAttack: [cellToAttack] }))
  return potentialProtectors
}

function canBlockAttack(newBoard: ChessBoardPositions, kingInCheck: ChessBoardCell, attackerCell: ChessBoardCell): [{blocker: ChessBoardCell, cellToDefend: ChessBoardCell[]}[], {path: ChessBoardCell[], attackerCell: ChessBoardCell}] {
  const blockers: CheckStatus['blockers'] = []
  const path = getAttackPath(kingInCheck, attackerCell, newBoard)
  const pawns = getAllThePawns(newBoard, kingInCheck.piece[0])
  const attacker = {path, attackerCell}

  for (const cell of path) {
    cell.isUnderAttackBy.forEach((attacker) => {
      if (attacker.piece[0] === kingInCheck.piece[0] && attacker.piece[1] !== 'K' && attacker.piece[1] !== 'P' && isCurrentlyProtector(newBoard, attacker, cell)) {
        if(!isAlreadyProtector(blockers, attacker)){
          blockers.push({blocker: attacker, cellToDefend: [cell]})        
        }else{
          addCellToDefendToProtector(blockers, attacker, cell)
        }
      }
    })

    for (const pawnCell of pawns) {
      calculateAvailableMoves(pawnCell, newBoard).forEach((move) => {
        if(move.col === cell.coordinates.col && move.row === cell.coordinates.row && isCurrentlyProtector(newBoard, pawnCell, cell)){
          if(!isAlreadyProtector(blockers, pawnCell)){
            blockers.push({blocker: pawnCell, cellToDefend: [cell]})
          }else{
            addCellToDefendToProtector(blockers, pawnCell, cell)
          }
        }
      })
    }
  }

  return [blockers, attacker]
}

function isAlreadyProtector(protectors: CheckStatus['blockers'], protector: ChessBoardCell): boolean{
  return protectors.some((prot) => prot.blocker.piece === protector.piece)
}

function addCellToDefendToProtector(
  protectors: CheckStatus['blockers'], 
  protector: ChessBoardCell, 
  cellToDefend: ChessBoardCell
): void {
  protectors.forEach((prot) => {
    if (prot.blocker === protector) {
      prot.cellToDefend.push(cellToDefend)
    }
  })
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

function isCurrentlyProtector(board: ChessBoardPositions, protector: ChessBoardCell, target: ChessBoardCell): boolean {
  const simulatedBoard = structuredClone(board)
  const { row: targetRow, col: targetCol } = target.coordinates
  const { row: protectorRow, col: protectorCol } = protector.coordinates

  // Make the simulated move
  const newSimulatedBoard = simulatedBoard.map(row => 
    row.map(cell => {
        if (cell.coordinates.row === targetRow && cell.coordinates.col === targetCol) {
          return { ...cell, piece: protector.piece }
        }
        if (cell.coordinates.row === protectorRow && cell.coordinates.col === protectorCol) {
            return { ...cell, piece: '', hasMoved: true }
        }
        return cell
    })
  )

  const { checkState } = markCellsUnderAttack(newSimulatedBoard, true)
  
  if( checkState.check && checkState.colorOfCheck !== protector.piece[0]){
    return true
  }

  return !checkState.check
}

