import { create } from 'zustand'
import { startGame } from '../hooks/StartGame'
import { calculateAvailableMoves } from '../hooks/CalculateMoves'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { isCastling } from '../hooks/Castling'

// import { persist } from 'zustand/middleware' --> usar a futuro persistencia de datos
// import confetti from 'canvas-confetti' --> usar a futuro confetti 

export const useChessManager = create<ChessBoardState>(((
    (set, get) => ({
        chessBoardpositions: startGame(),
        cellOfPieceSelected: null,
    
        clickCell: (cellInformation) => {
            const { cellOfPieceSelected } = get()

            if(cellInformation.piece === '' && cellOfPieceSelected === null) return 

            if(cellOfPieceSelected === null){
                get().selectPieceToMove(cellInformation)
                return
            }
            if (cellInformation.piece === cellOfPieceSelected.piece) {
                get().removeAvailableMoves()
                set({ cellOfPieceSelected: null })
                return
            }

            if(cellInformation.piece[0] === cellOfPieceSelected.piece[0]){
                get().removeAvailableMoves()
                get().selectPieceToMove(cellInformation)
                return
            }

            get().movePiece(cellInformation.coordinates)
        },

        selectPieceToMove: (cellInformation) => {
            set({ cellOfPieceSelected: cellInformation})
            const coordsOfAvailableMoves = calculateAvailableMoves(cellInformation, get().chessBoardpositions)
            get().showAvailableMoves(coordsOfAvailableMoves)
        },

        movePiece: (destinyCoords) => {
            const cellOfPieceSelected = get().cellOfPieceSelected
            if (!cellOfPieceSelected) return
            
            const boardWithCastling = isCastling(cellOfPieceSelected.coordinates, destinyCoords, get().chessBoardpositions)
            const chessBoardpositions = boardWithCastling || get().chessBoardpositions

            if(cellOfPieceSelected && chessBoardpositions[destinyCoords.row][destinyCoords.col].YouCanMoveHere){
                const newChessBoardPositions = chessBoardpositions.map(row => {
                    return row.map(cell => {
                        if(cell.coordinates.col === destinyCoords.col && cell.coordinates.row === destinyCoords.row){
                            return {
                                ...cell,
                                piece: cellOfPieceSelected.piece,
                            }
                        }
                        if(cell.coordinates.col === cellOfPieceSelected.coordinates.col && cell.coordinates.row === cellOfPieceSelected.coordinates.row){
                            return {
                                ...cell,
                                piece: '',
                                hasMoved: true
                            }
                        }
                        return cell
                    })
                })
                set({ chessBoardpositions: newChessBoardPositions, cellOfPieceSelected: null })           
            }
            get().removeAvailableMoves()
            get().updateCellsUnderAttack()
        },

        showAvailableMoves: (coordsOfAvailableMoves) => {
            const { chessBoardpositions } = get()

            const newChessBoardPositions = chessBoardpositions.map(row => {
                return row.map(cell => {
                    if(coordsOfAvailableMoves.some(coords => coords.col === cell.coordinates.col && coords.row === cell.coordinates.row)){
                        return {
                            ...cell,
                            YouCanMoveHere: true
                        }
                    }
                    return {
                        ...cell,
                        YouCanMoveHere: false
                    }
                })
            })
            set({ chessBoardpositions: newChessBoardPositions })
        },

        removeAvailableMoves: () => {
            const { chessBoardpositions } = get()

            const newChessBoardPositions = chessBoardpositions.map(row => {
                return row.map(cell => {
                    return {
                        ...cell,
                        YouCanMoveHere: false
                    }
                })
            })
            set({ chessBoardpositions: newChessBoardPositions })
        },

        updateCellsUnderAttack: () => {
          const newBoard = markCellsUnderAttack(get().chessBoardpositions)
          set({ chessBoardpositions: newBoard })
          console.log(newBoard)
        }
    })
)))
