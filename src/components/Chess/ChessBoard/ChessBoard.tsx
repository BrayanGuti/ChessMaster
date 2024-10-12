import './ChessBoard.css'
import { useChessManager } from '../store/useChessManager'
import { ChessCell } from '../ChessCell/ChessCell'

export function ChessBoard () {
    const positions = useChessManager(state => state.chessBoardpositions)
    return(
        <section className="chess-board">
            {positions.map((row) => (
                row.map((cell, index) => (
                    <ChessCell key={index} cellInformation={cell}/>
                )
            )))}
        </section>
    )
}