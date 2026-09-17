import styles from './GameSection.module.css';
import { ChessBoard } from '../../../components/Chess/ChessBoard/ChessBoard';

export function GameSection() {
  return (
    <section className={styles.gameSection}>
      <div className={styles.container}>
        <ChessBoard
          showMoveHistory
          showCapturedPieces
          showPlayerBadges
          className={styles.board}
        />
      </div>
    </section>
  );
}
