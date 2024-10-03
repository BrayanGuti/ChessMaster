import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import confetti from 'canvas-confetti' --> usar a futuro confetti 


interface ChessBoardState {
    positions: ChessBoardPositions
    // historialMoves: string[] --> implementar a futuro
}

export const useChessManager = create<ChessBoardState>()(persist(() => {
    return {
        positions: startGame()
    }
}, {
    name: 'ChessBoard'    
}))

function startGame (): ChessBoardPositions {
  const Position = [
    ['BRa8', 'BNb8', 'BBc8', 'BQd8', 'BKe8', 'BBf8', 'BNg8', 'BRh8'],
    ['BPa7', 'BPb7', 'BPc7', 'BPd7', 'BPe7', 'BPf7', 'BPg7', 'BPh7'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['WPa2', 'WPb2', 'WPc2', 'WPd2', 'WPe2', 'WPf2', 'WPg2', 'WPh2'],
    ['WRa1', 'WNb1', 'WBc1', 'WQd1', 'WKe1', 'WBf1', 'WNg1', 'WRh1']
  ]
  
  const initialPosition = Position.map((row, rowIndex) => {
    const boardRow = row.map((piece, colIndex) => {
    const cellName = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
    /**
    * Each cell has five different values:
    * -First Parameter -> piece: The piece occupying the cell.
    * -Second Parameter -> YouCanAttackHere/YouCanMoveHere: When you select a piece the other cells 
    *  indicate that the piece can attack here or move here by this parameter 
    *  can attack under attack or available to move.
    * -Third Parameter -> isUnderAttackBy: Indicate which pieces are attacking the cell.
    * -Fourth Parameter -> Represent if the piece that is in there has make its first move or no.
    * -Fifth Parameter -> cellName: The name of the cell (e.g., a8, b8, etc.).
    **/
    if (piece === '') return {piece: piece as ChessBoardCell['piece'], YouCanMoveHere: false, isUnderAttack: [], hasMoved: true, cellName: cellName as ChessBoardCell['cellName'] }
  
    return {piece: piece as ChessBoardCell['piece'], YouCanMoveHere: false, isUnderAttack: [], hasMoved: false, cellName: cellName as ChessBoardCell['cellName'] }
    })
    return boardRow
  })
  
  return initialPosition
  }