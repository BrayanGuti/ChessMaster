import { useMemo } from "react"
import { useChessStore } from "../store/useChessStore"
import { ChessBoardCell } from "../store/types"

// Squares shown in each corner of the board, from white's side and from black's side
const CORNERS: Record<'normal' | 'flipped', Record<string, string>> = {
  normal: { a8: 'cornerUpLeft', h8: 'cornerUpRight', a1: 'cornerDownLeft', h1: 'cornerDownRight' },
  flipped: { h1: 'cornerUpLeft', a1: 'cornerUpRight', h8: 'cornerDownLeft', a8: 'cornerDownRight' },
}

export function useChessCellCharacteristics(cellInformation: ChessBoardCell, flipped = false) {
  const pieceSelected = useChessStore(state => state.cellOfPieceSelected)
  const turn = useChessStore(state => state.turn)
  const colorInCheck = useChessStore(state => state.checkState?.colorOfCheck)
  // Against the computer, the engine's turn is not playable by the human
  const humanCanMove = useChessStore(state => state.gameMode !== 'computer' || state.turn === state.playerColor)

  const {
    color,
    corner,
    youCanMoveHere,
    thisIsTheSelectedPiece,
  } = useMemo(() => {
    const color = (cellInformation.coordinates.row + cellInformation.coordinates.col) % 2 === 0 ? 'white' : 'black'

    const corner = CORNERS[flipped ? 'flipped' : 'normal'][cellInformation.cellName] || ''

    const youCanMoveHere =
      cellInformation.piece !== '' && cellInformation.YouCanMoveHere
        ? 'youCanAttackHere'
        : cellInformation.YouCanMoveHere
        ? 'youCanMoveHere'
        : ''

    const thisIsTheSelectedPiece = pieceSelected?.piece === cellInformation.piece ? 'thisIsTheSelectedPiece' : ''

    return { color, corner, youCanMoveHere, thisIsTheSelectedPiece }
  }, [cellInformation, pieceSelected, flipped])

  return { color, corner, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck, humanCanMove }
}
