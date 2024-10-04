import './ChessCell.css'
import { useMemo } from 'react'
import { ChessPiece } from '../ChessPiece/ChessPiece'

export function ChessCell({ cellInformation }: { cellInformation: ChessBoardCell }) {
  const color = useMemo((): string => {
    return (cellInformation.coordinates.row + cellInformation.coordinates.col) % 2 === 0 ? 'white' : 'black';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`chess-cell ${color}`}>
      <ChessPiece piece={cellInformation.piece} coords={cellInformation.coordinates} />
    </div>
  )
}
