import styles from './ChessCell.module.css';
import { ChessPiece } from '../ChessPiece/ChessPiece';
import { useChessCellCharacteristics } from '../hooks/ChessCellCharacteristics';
import type { ChessBoardCell } from '../store/types';

// Interaction (click and drag) is handled by the board through pointer events; see useBoardDrag.
export function ChessCell({
  cellInformation,
  flipped = false,
  isLastMove = false,
  isDragOrigin = false,
}: {
  cellInformation: ChessBoardCell;
  /** The board is seen from black's side (changes which squares get the rounded corners) */
  flipped?: boolean;
  isLastMove?: boolean;
  isDragOrigin?: boolean;
}) {
  const { color, corner, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck, humanCanMove } =
    useChessCellCharacteristics(cellInformation, flipped);

  const isOwnPiece = humanCanMove && cellInformation.piece !== '' && cellInformation.piece[0] === turn;
  const isKingInCheck = cellInformation.piece[0] === colorInCheck && cellInformation.piece[1] === 'K';

  const styleMap: Record<string, string> = {
    white: styles.white,
    black: styles.black,
    youCanMoveHere: styles.youCanMoveHere,
    youCanAttackHere: styles.youCanAttackHere,
    cornerUpLeft: styles.cornerUpLeft,
    cornerUpRight: styles.cornerUpRight,
    cornerDownLeft: styles.cornerDownLeft,
    cornerDownRight: styles.cornerDownRight,
  };

  const classNames = [
    styles.chessCell,
    color ? styleMap[color] : '',
    youCanMoveHere ? styleMap[youCanMoveHere] : '',
    corner ? styleMap[corner] : '',
    isLastMove && styles.lastMove,
    thisIsTheSelectedPiece && styles.selected,
    isOwnPiece && styles.isClickable,
    isKingInCheck && styles.kingInCheck,
    isDragOrigin && styles.dragOrigin,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} data-chess-cell={cellInformation.cellName}>
      <ChessPiece piece={cellInformation.piece} />
    </div>
  );
}
