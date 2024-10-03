import './ChessCell.css'

export function ChessCell({ cellInformation }: { cellInformation: ChessBoardCell }) {
  return (
    <h1 key={cellInformation.cellName}>
        {cellInformation.piece}
    </h1>
  )
}
