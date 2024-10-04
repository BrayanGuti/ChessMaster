import './ChessPiece.css'
import { useChessManager } from '../store/useChessManager'

export function ChessPiece({ piece, coords }: { piece: ChessBoardCell['piece'], coords: ChessBoardCell['coordinates'] }) {
    const selectPieceToMove = useChessManager(state => state.selectPieceToMove)
    
    if(piece === '') {
        return null
    }

    const handleClickedPiece = () => {
        selectPieceToMove(piece, coords)
    }

    const pieceName = piece.substring(0, 2)

    return(
        <img onClick={handleClickedPiece} src={`/Pieces/${pieceName}.svg`} alt={pieceName} className='chess-piece'/>
    )
}