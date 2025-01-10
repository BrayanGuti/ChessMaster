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
        turn: 'W',
        checkState: {
          protectors: [], 
          blockers: [], 
          allDefenders: [],
          moves: [], 
          isCheckmate: false, 
          check: false, 
          attackers: null, 
          numberOfAttackersIsOne: false,
          colorOfCheck: null
        },
        cellOfPieceSelected: null,
        coronation: {
            status: false,
            coordinates: { col: 0, row: 0 },
            cellName: ''
        },
        soundToPlay: null, 
        setSoundToPlay: (sound) => set({ soundToPlay: sound }),
    
        clickCell: (cellInformation) => {
            const { cellOfPieceSelected, coronation, checkState} = get()

            if(coronation.status) return
            if(checkState.isCheckmate) return

			if(checkState.check){
                get().handleCellClickWhenChceck(cellInformation, cellOfPieceSelected)
                return
			}

            if(cellInformation.piece === '' && cellOfPieceSelected === null) return 

            if(cellOfPieceSelected === null && cellInformation.piece[0] === get().turn){
                get().selectPieceToMove(cellInformation)
                return
            }
            if (cellInformation.piece === cellOfPieceSelected?.piece) {
                get().removeAvailableMoves()
                set({ cellOfPieceSelected: null })
                return
            }

            if(cellInformation.piece[0] === cellOfPieceSelected?.piece[0]){
                get().removeAvailableMoves()
                get().selectPieceToMove(cellInformation)
                return
            }

            get().movePiece(cellInformation.coordinates)
        },

        selectPieceToMove: (cellInformation) => {
            set({ cellOfPieceSelected: cellInformation})
            const coordsOfAvailableMoves = calculateAvailableMoves(cellInformation, get().chessBoardpositions)
            get().showAvailableMoves(get().isProtectingCheck(coordsOfAvailableMoves, cellInformation))
        },

        handleCellClickWhenChceck: (cellClicked, cellOfPieceSelected) => {
            if(cellClicked.piece[1] === 'K'){
                get().selectPieceToMove(cellClicked)
                return
            } 
            const pieces = get().checkState.allDefenders;
            for (let i = 0; i < pieces.length; i++) {
              const piece = pieces[i];
                            
              if (piece.protector.cellName === cellClicked.cellName) {
                get().selectPieceToDefendCheck(piece)
                return
              }
            }
            if(cellOfPieceSelected !== null){
                get().movePiece(cellClicked.coordinates)
            } 
        },

        isProtectingCheck: (moves, cellInformation) => {
            if(cellInformation.piece[1] === 'K') return moves
            const { chessBoardpositions } = get()
            const filteredMoves: ChessBoardCell["coordinates"][] = []
            const chessBoardWithoutCellSelected = chessBoardpositions.map(row => 
                row.map(cell => 
                    cell.piece === cellInformation.piece 
                        ? { ...cell, piece: "" } 
                        : { ...cell }
                )
            )

            const { checkState } = markCellsUnderAttack(chessBoardWithoutCellSelected)
            if (checkState.check && checkState.numberOfAttackersIsOne) {            
                checkState.attackers?.path.forEach(cellPath => {
                    moves.forEach(move => {
                        if (cellPath.coordinates.col === move.col && cellPath.coordinates.row === move.row) {
                            filteredMoves.push(move)
                        }
                        if(move.col === checkState.attackers?.attackerCell.coordinates.col && move.row === checkState.attackers?.attackerCell.coordinates.row){
                            filteredMoves.push(move)
                        }
                    })
                })
                
                return filteredMoves.length > 0 ? filteredMoves : []
            }            
            return moves
        },

        makeCoronation: (piece: string) => {
            const { coronation } = get()
            const { chessBoardpositions } = get()
            const newChessBoardPositions = chessBoardpositions.map(row => {
                return row.map(cell => {
                    if(cell.coordinates.col === coronation.coordinates.col && cell.coordinates.row === coronation.coordinates.row){
                        return {
                            ...cell,
                            piece: piece + coronation.cellName
                        }
                    }
                    return cell
                })
            })
            set({ chessBoardpositions: newChessBoardPositions, coronation: { status: false, coordinates: { col: 0, row: 0 }, cellName:''} })
            get().removeAvailableMoves()
            get().updateCellsUnderAttack()
        },

        movePiece: (destinyCoords) => {
            const { cellOfPieceSelected, chessBoardpositions } = get()
        
            if (!cellOfPieceSelected) return
        
            const targetCell = chessBoardpositions[destinyCoords.row][destinyCoords.col]
            if (targetCell?.YouCanMoveHere) {
                const boardWithCastling = isCastling(
                    cellOfPieceSelected.coordinates,
                    destinyCoords,
                    chessBoardpositions,
                    cellOfPieceSelected.piece[0]
                )
        
                const updatedBoard = boardWithCastling || chessBoardpositions
                get().isCoronation(destinyCoords)
        
                const newChessBoardPositions = updatedBoard.map(row => 
                    row.map(cell => {
                        if (cell.coordinates.row === destinyCoords.row && cell.coordinates.col === destinyCoords.col) {
                            return { ...cell, piece: cellOfPieceSelected.piece }
                        }
                        if (cell.coordinates.row === cellOfPieceSelected.coordinates.row && cell.coordinates.col === cellOfPieceSelected.coordinates.col) {
                            return { ...cell, piece: '', hasMoved: true }
                        }
                        return cell
                    })
                )
        
                set({ chessBoardpositions: newChessBoardPositions, cellOfPieceSelected: null })
                get().removeAvailableMoves()
                get().updateCellsUnderAttack()
                get().changeTurn()
            }
        },        

        changeTurn: () => {
            const { turn } = get()
            set({ turn: turn === 'W' ? 'B' : 'W' })
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

        isCoronation: (destinyCoords) => {
            const { cellOfPieceSelected, turn } = get()
            const pieceSelected = cellOfPieceSelected?.piece[1]
            const coronationRow = (turn === 'W') ? 0 : 7
        
            if (pieceSelected === 'P' && destinyCoords.row === coronationRow) {
                const cellName = cellOfPieceSelected ? `${cellOfPieceSelected.piece[2] + cellOfPieceSelected.piece[3]}` : ''
                set({
                    coronation: {
                        status: true,
                        coordinates: destinyCoords,
                        cellName
                    }
                })
            }
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
            const { newBoard, checkState } = markCellsUnderAttack(get().chessBoardpositions)
		    set({ chessBoardpositions: newBoard })
            set({ checkState })
            
		    
		    if(checkState.isCheckmate){
		    	console.log('checkmate')
                get().setSoundToPlay('game-over')
                return
            }
            
            if(!checkState.check){
                get().setSoundToPlay(randomSound('move-1', 'move-2'))
                console.log('no check')
		    	return
		    }
            
            get().setSoundToPlay('check')
            console.log('check')
        },

		selectPieceToDefendCheck: (piece) => {
            set({ cellOfPieceSelected: piece.protector })
            const coordsOfAvailableMoves: ChessBoardCell['coordinates'][] = []
            piece.cellToProtect.forEach(cell => {
                coordsOfAvailableMoves.push(cell.coordinates)
            })
            get().showAvailableMoves(coordsOfAvailableMoves)
		}
    })
)))

function randomSound(sound1: string, sound2: string) {
    return Math.random() < 0.5 ? sound1 : sound2
}