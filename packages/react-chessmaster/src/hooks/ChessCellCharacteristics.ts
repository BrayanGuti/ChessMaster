import { useMemo } from "react"
import { useChessStore } from "../store/useChessStore"
import { ChessBoardCell } from "../store/types"

export function useChessCellCharacteristics(cellInformation: ChessBoardCell) {
  const pieceSelected = useChessStore(state => state.cellOfPieceSelected)
  const turn = useChessStore(state => state.turn)
  const colorInCheck = useChessStore(state => state.checkState?.colorOfCheck)

  const {
    color,
    corner,
    youCanMoveHere,
    thisIsTheSelectedPiece,
  } = useMemo(() => {
    const color = (cellInformation.coordinates.row + cellInformation.coordinates.col) % 2 === 0 ? 'white' : 'black'

    const corners: { [key: string]: string } = {
      'a8': 'cornerUpLeft',
      'h8': 'cornerUpRight',
      'a1': 'cornerDownLeft',
      'h1': 'cornerDownRight',
    }
    const corner = corners[cellInformation.cellName] || ''

    const youCanMoveHere =
      cellInformation.piece !== '' && cellInformation.YouCanMoveHere
        ? 'youCanAttackHere'
        : cellInformation.YouCanMoveHere
        ? 'youCanMoveHere'
        : ''

    const thisIsTheSelectedPiece = pieceSelected?.piece === cellInformation.piece ? 'thisIsTheSelectedPiece' : ''

    return { color, corner, youCanMoveHere, thisIsTheSelectedPiece }
  }, [cellInformation, pieceSelected])

  return { color, corner, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck }
}
