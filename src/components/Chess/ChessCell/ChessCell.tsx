import './ChessCell.css'
import { ChessPiece } from '../ChessPiece/ChessPiece'
import { UseChessCellCharacteristics } from '../hooks/ChessCellCharacteristics'

export function ChessCell({ cellInformation }: { cellInformation: ChessBoardCell }) {
  const { color, corner, handleCellClick, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck } = UseChessCellCharacteristics(cellInformation)
  
  const isClickable = cellInformation.piece[0] === turn ? 'isClickable' : ''
  const kingInCheck = (cellInformation.piece[0] === colorInCheck && cellInformation.piece[1] === 'K')  ? 'kingInCheck' : ''

  return (
    <div 
      onClick={handleCellClick} 
      className={`chess-cell ${color} ${youCanMoveHere} ${corner} ${thisIsTheSelectedPiece} ${isClickable} ${kingInCheck}`}
    >
      <ChessPiece piece={cellInformation.piece} />
    </div>
  )
}