import './ChessCell.css'
import { ChessPiece } from '../ChessPiece/ChessPiece'
import { UseChessCellCharacteristics } from '../hooks/ChessCellCharacteristics'

export function ChessCell({ cellInformation }: { cellInformation: ChessBoardCell }) {
  const { color, corner, handleCellClick, youCanMoveHere, thisIsTheSelectedPiece } = UseChessCellCharacteristics(cellInformation)

  return (
    <div 
      onClick={handleCellClick} 
      className={`chess-cell ${color} ${youCanMoveHere} ${corner} ${thisIsTheSelectedPiece}`}
    >
      <ChessPiece piece={cellInformation.piece} />
    </div>
  )
}
