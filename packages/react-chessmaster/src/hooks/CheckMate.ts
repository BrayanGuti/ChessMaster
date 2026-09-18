import { calculateAvailableMoves, calculateFuturesMoves } from "./CalculateMoves"
import { markCellsUnderAttack } from "./MarkCellsUnderAttack"
import { getEnPassantCapturedSquare } from "./EnPassant"
import { ChessBoardPositions, CheckStatus, ChessBoardCell } from "../store/types"

export function isCheckmate(Board: ChessBoardPositions, deepLooking = false): CheckStatus {
  const checkState: CheckStatus = {
    protectors: [],
    blockers: [],
    allDefenders: [],
    moves: [],
    isCheckmate: false,
    isStalemate: false,
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
    return checkState
  }

  const newBoard = structuredClone(Board)
  const attackingPieces = thatPieceCanBeKilledBy(kingInCheck)
  const moves = calculateFuturesMoves(kingInCheck, newBoard).filter(
    ({ row, col }) => newBoard[row][col].piece[0] !== kingInCheck.piece[0]
  )

  if (attackingPieces.length === 1) {
    const attackerPieceCell = attackingPieces[0].attacker
    const freshAttackerCell = newBoard[attackerPieceCell.coordinates.row][attackerPieceCell.coordinates.col]
    const [blocker, attackerInfo] = canBlockAttack(newBoard, kingInCheck, attackerPieceCell)
    checkState.protectors.push(...getProtectors(freshAttackerCell, newBoard))
    checkState.blockers.push(...blocker)
    checkState.allDefenders.push(...mergeProtectorsAndBlockers(checkState.protectors, checkState.blockers))
    checkState.numberOfAttackersIsOne = true
    checkState.attackers = attackerInfo
  }

  checkState.moves = moves

  if (checkState.protectors.length === 0 && checkState.blockers.length === 0 && moves.length === 0) {
    checkState.isCheckmate = true
  }

  return checkState
}

export function hasAnyLegalMove(
  board: ChessBoardPositions,
  color: string,
  enPassant: ChessBoardCell['coordinates'] | null = null
): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.piece[0] !== color) continue

      const moves = calculateAvailableMoves(cell, board, enPassant)
      for (const move of moves) {
        const captured = getEnPassantCapturedSquare(board, cell.coordinates, move, enPassant)
        if (!wouldLeaveKingInCheck(board, cell, move, color, captured)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Decides checkmate and stalemate for the side to move with the same rule as the legal move
 * generator: no legal move at all means mate if in check, stalemate otherwise. It replaces
 * isCheckmate's own verdict, which does not know about en passant (sometimes the only way out of
 * a check). With a promotion pending the pawn is still on the last rank, so the position is not
 * final yet: makeCoronation evaluates it again. Mutates `checkState`.
 */
export function applyGameEnd(
  board: ChessBoardPositions,
  checkState: CheckStatus,
  sideToMove: string,
  enPassant: ChessBoardCell['coordinates'] | null,
  promotionPending: boolean
) {
  checkState.isCheckmate = false
  checkState.isStalemate = false
  if (promotionPending) return
  const canMove = hasAnyLegalMove(board, sideToMove, enPassant)
  if (checkState.check) checkState.isCheckmate = !canMove
  else checkState.isStalemate = !canMove
}

/**
 * Plays the move on a copy of the board and tells whether `color`'s own king ends up attacked.
 * `capturedSquare` is the pawn removed by an en passant capture (it is not on `toCoords`).
 */
export function wouldLeaveKingInCheck(
  board: ChessBoardPositions,
  fromCell: ChessBoardCell,
  toCoords: { row: number, col: number },
  color: string,
  capturedSquare: ChessBoardCell['coordinates'] | null = null
): boolean {
  const simulatedBoard = board.map(row =>
    row.map(cell => {
      if (cell.coordinates.row === toCoords.row && cell.coordinates.col === toCoords.col) {
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

  // Look at this side's king specifically: the move may also check the other king, and
  // isCheckmate's checkState only reports the first king in check it finds
  const { newBoard } = markCellsUnderAttack(simulatedBoard, true)
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.piece[0] === color && cell.piece[1] === 'K') {
        return cell.isUnderAttackBy.some(attacker => attacker.piece[0] !== color)
      }
    }
  }
  return false
}

function mergeProtectorsAndBlockers(protectors: CheckStatus['protectors'], blockers: CheckStatus['blockers']): CheckStatus['allDefenders'] {
  const allDefenders: CheckStatus['allDefenders'] = []

  const modifiedProtectors = protectors.map((protector) => ({
    protector: protector.attacker,
    cellToProtect: protector.cellToAttack
  }))

  const modifiedBlockers = blockers.map((blocker) => ({
    protector: blocker.blocker,
    cellToProtect: blocker.cellToDefend
  }))

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

