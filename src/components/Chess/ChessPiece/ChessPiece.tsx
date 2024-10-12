import './ChessPiece.css'

export function ChessPiece({ piece }: { piece: ChessBoardCell['piece'] }) {
    if(piece === '') {
        return null
    }

    const pieceName = piece.substring(0, 2)

    return(
        <img src={`/Pieces/${pieceName}.svg`} alt={pieceName} className='chess-piece'/>
    )
}