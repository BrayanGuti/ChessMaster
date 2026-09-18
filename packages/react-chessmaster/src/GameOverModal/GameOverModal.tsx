import styles from './GameOverModal.module.css';
import { useChessStore } from '../store/useChessStore';

const WINNER_LABEL: Record<'W' | 'B', string> = {
  W: 'White wins',
  B: 'Black wins',
};

export function GameOverModal() {
  const checkState = useChessStore((state) => state.checkState);
  const resetGame = useChessStore((state) => state.resetGame);
  const gameMode = useChessStore((state) => state.gameMode);
  const playerColor = useChessStore((state) => state.playerColor);

  if (!checkState.isCheckmate && !checkState.isStalemate) return null;

  const losingColor = checkState.colorOfCheck as 'W' | 'B' | null;
  const winningColor = losingColor === 'W' ? 'B' : 'W';
  const vsComputer = gameMode === 'computer';

  let title: string;
  let subtitle: string;
  if (checkState.isStalemate) {
    title = 'Draw';
    subtitle = 'Stalemate — no legal moves left';
  } else if (vsComputer) {
    title = winningColor === playerColor ? 'You win!' : 'Computer wins';
    subtitle = 'Checkmate';
  } else {
    title = 'Checkmate!';
    subtitle = WINNER_LABEL[winningColor];
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        {/* resetGame keeps the mode, color choice and level, so this is a rematch against the computer */}
        <button className={styles.button} onClick={resetGame}>
          {vsComputer ? 'Rematch' : 'New game'}
        </button>
      </div>
    </div>
  );
}
