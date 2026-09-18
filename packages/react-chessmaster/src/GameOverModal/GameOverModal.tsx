import styles from './GameOverModal.module.css';
import { useChessStore } from '../store/useChessStore';

const WINNER_LABEL: Record<'W' | 'B', string> = {
  W: 'White wins',
  B: 'Black wins',
};

export function GameOverModal() {
  const checkState = useChessStore((state) => state.checkState);
  const resetGame = useChessStore((state) => state.resetGame);

  if (!checkState.isCheckmate && !checkState.isStalemate) return null;

  const losingColor = checkState.colorOfCheck as 'W' | 'B' | null;
  const winningColor = losingColor === 'W' ? 'B' : 'W';

  const title = checkState.isCheckmate ? 'Checkmate!' : 'Draw';
  const subtitle = checkState.isCheckmate
    ? WINNER_LABEL[winningColor]
    : 'Stalemate — no legal moves left';

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <button className={styles.button} onClick={resetGame}>
          New game
        </button>
      </div>
    </div>
  );
}
