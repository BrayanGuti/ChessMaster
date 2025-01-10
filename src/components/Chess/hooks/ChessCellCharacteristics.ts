import { useMemo } from "react"
import { useChessManager } from "../store/useChessManager"

export function UseChessCellCharacteristics(cellInformation: ChessBoardCell) {
  const pieceSelected = useChessManager(state => state.cellOfPieceSelected)
  const clickCell = useChessManager(state => state.clickCell)
  const turn = useChessManager(state => state.turn)
  const colorInCheck = useChessManager(state => state.checkState?.colorOfCheck)

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
