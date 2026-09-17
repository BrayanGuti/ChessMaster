import styles from './ChessCell.module.css';
import { ChessPiece } from '../ChessPiece/ChessPiece';
import { useChessCellCharacteristics } from '../hooks/ChessCellCharacteristics';
import type { ChessBoardCell } from '../store/types';

export function ChessCell({ cellInformation }: { cellInformation: ChessBoardCell }) {
  const { color, corner, handleCellClick, youCanMoveHere, thisIsTheSelectedPiece, turn, colorInCheck } = useChessCellCharacteristics(cellInformation);

  const isClickable = cellInformation.piece[0] === turn ? styles.isClickable : '';
  const kingInCheck = cellInformation.piece[0] === colorInCheck && cellInformation.piece[1] === 'K' ? styles.kingInCheck : '';

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
    thisIsTheSelectedPiece ? styles.thisIsTheSelectedPiece : '',
    isClickable,
    kingInCheck,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      onClick={handleCellClick}
      className={classNames}
    >
      <ChessPiece piece={cellInformation.piece} />
    </div>
  );
}