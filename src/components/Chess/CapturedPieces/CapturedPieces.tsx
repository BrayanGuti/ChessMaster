import styles from './CapturedPieces.module.css';
import { useChessStore } from '../store/useChessStore';
import { deriveCapturedPieces, CapturablePieceType } from '../store/deriveCapturedPieces';
import { PIECE_ASSETS } from '../assets/pieces';

const PIECE_ORDER: CapturablePieceType[] = ['Q', 'R', 'B', 'N', 'P'];

export function CapturedPieces({
  color,
  className,
}: {
  color: 'W' | 'B';
  className?: string;
}) {
  const moveHistory = useChessStore((state) => state.moveHistory);
  const captured = deriveCapturedPieces(moveHistory)[color];
  const opponentColor = color === 'W' ? 'B' : 'W';

  const entries = PIECE_ORDER
    .filter((type) => (captured[type] || 0) > 0)
    .map((type) => ({ type, count: captured[type] as number }));

  if (entries.length === 0) return null;

  return (
    <div className={`${styles.capturedPieces}${className ? ` ${className}` : ''}`}>
      {entries.map(({ type, count }) => (
        <span key={type} className={styles.entry}>
          <img
            src={PIECE_ASSETS[`${opponentColor}${type}`]}
            alt={`${opponentColor}${type}`}
            className={styles.icon}
          />
          <span className={styles.count}>x{count}</span>
        </span>
      ))}
    </div>
  );
}
