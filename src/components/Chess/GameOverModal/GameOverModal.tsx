import styles from './GameOverModal.module.css';
import { useChessStore } from '../store/useChessStore';

const WINNER_LABEL: Record<'W' | 'B', string> = {
  W: 'Ganan las blancas',
  B: 'Ganan las negras',
};

export function GameOverModal() {
  const checkState = useChessStore((state) => state.checkState);
  const resetGame = useChessStore((state) => state.resetGame);

  if (!checkState.isCheckmate && !checkState.isStalemate) return null;

  const losingColor = checkState.colorOfCheck as 'W' | 'B' | null;
  const winningColor = losingColor === 'W' ? 'B' : 'W';

  const title = checkState.isCheckmate ? '¡Jaque mate!' : 'Tablas';
  const subtitle = checkState.isCheckmate
    ? WINNER_LABEL[winningColor]
    : 'Ahogado — nadie tiene movimientos legales';

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <button className={styles.button} onClick={resetGame}>
          Nueva partida
        </button>
      </div>
    </div>
  );
}
