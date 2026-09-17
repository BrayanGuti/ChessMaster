import styles from './PlayerBadge.module.css';
import { useChessStore } from '../store/useChessStore';

const DEFAULT_LABELS: Record<'W' | 'B', string> = {
  W: 'Jugador de fichas blancas',
  B: 'Jugador de fichas negras',
};

export function PlayerBadge({
  color,
  label,
  className,
}: {
  color: 'W' | 'B';
  label?: string;
  className?: string;
}) {
  const turn = useChessStore((state) => state.turn);
  const isActive = turn === color;

  return (
    <div
      className={`${styles.playerBadge}${isActive ? ` ${styles.active}` : ''}${className ? ` ${className}` : ''}`}
    >
      <span className={styles.avatar} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" />
        </svg>
      </span>
      <span className={styles.label}>{label || DEFAULT_LABELS[color]}</span>
    </div>
  );
}
