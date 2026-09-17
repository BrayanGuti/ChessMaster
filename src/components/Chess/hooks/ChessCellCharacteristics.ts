import { useMemo } from "react"
import { useChessStore } from "../store/useChessStore"
import { ChessBoardCell } from "../store/types"

export function useChessCellCharacteristics(cellInformation: ChessBoardCell) {
  const pieceSelected = useChessStore(state => state.cellOfPieceSelected)
  const clickCell = useChessStore(state => state.clickCell)
  const turn = useChessStore(state => state.turn)
  const colorInCheck = useChessStore(state => state.checkState?.colorOfCheck)

  const {
    color,
    corner,
    handleCellClick,
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

    const handleCellClick = () => {
      clickCell(cellInformation)
    }

    return { color, corner, handleCellClick, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck}
  }, [cellInformation, pieceSelected, clickCell, turn, colorInCheck])

  return { color, corner, handleCellClick, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck }
}
