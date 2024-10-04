import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startGame } from '../hooks/StartGame';
import { calculateAvailableMoves } from '../hooks/CalculateMoves';
// import confetti from 'canvas-confetti' --> usar a futuro confetti 


interface ChessBoardState {
    chessBoardpositions: ChessBoardPositions
    // pieceSelected: ChessBoardCell['coordinates'] | null
    selectPieceToMove: (selectedPiece: ChessBoardCell['piece'], selectedCoordinates: ChessBoardCell['coordinates']) => void
    // historialMoves: string[] --> implementar a futuro
}

export const useChessManager = create<ChessBoardState>()(persist((get) => {
    return {
        chessBoardpositions: startGame(),
        // pieceSelected: null,

        selectPieceToMove: (selectedPiece, selectedCoordinates) => {
            const chessBoard = get.chessBoardpositions
            const coordsOfAvailableMoves = calculateAvailableMoves(selectedPiece, selectedCoordinates)
            console.log(coordsOfAvailableMoves)
        }
    }
}, {
    name: 'ChessBoard'    
}))
