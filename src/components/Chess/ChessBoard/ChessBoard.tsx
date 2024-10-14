import './ChessBoard.css'
import { useChessManager } from '../store/useChessManager'
import { ChessCell } from '../ChessCell/ChessCell'
import { CoronationPanel } from '../CoronationPanel/CoronationPanel'

export function ChessBoard () {
  const positions = useChessManager((state) => state.chessBoardpositions)
  const coronation = useChessManager((state) => state.coronation)

  return (
    <section className="chess-board">
      {positions.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <ChessCell
            key={`${rowIndex}-${colIndex}`}
            cellInformation={cell}
          />
        ))
      ))}
      {coronation.status && <CoronationPanel cords={coronation.coordinates}/>}

    </section>
  )
}
