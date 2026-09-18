import styles from './PlayerBadge.module.css';
import { useChessStore } from '../store/useChessStore';
import { PLAYER_AVATARS } from '../assets/avatars';
import { CapturedPieces } from '../CapturedPieces/CapturedPieces';

const DEFAULT_LABELS: Record<'W' | 'B', string> = {
  W: 'Fichas blancas',
  B: 'Fichas negras',
};

export function PlayerBadge({
  color,
  label,
  avatar,
  showCapturedPieces = false,
  className,
}: {
  color: 'W' | 'B';
  label?: string;
  avatar?: string;
  showCapturedPieces?: boolean;
  className?: string;
}) {
  const turn = useChessStore((state) => state.turn);
  const checkState = useChessStore((state) => state.checkState);

  const isGameOver = checkState.isCheckmate || checkState.isStalemate;
  const isActive = turn === color && !isGameOver;
  const isInCheck = checkState.check && checkState.colorOfCheck === color && !isGameOver;

  let status = 'Esperando';
  if (checkState.isCheckmate) {
    status = checkState.colorOfCheck === color ? 'Jaque mate' : 'Victoria';
  } else if (checkState.isStalemate) {
    status = 'Tablas';
  } else if (isInCheck) {
    status = 'En jaque';
  } else if (isActive) {
    status = 'Su turno';
  }

  const classNames = [
    styles.playerBadge,
    color === 'W' ? styles.white : styles.black,
    isActive && styles.active,
    isInCheck && styles.check,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} aria-current={isActive ? 'true' : undefined}>
      <div className={styles.avatarFrame}>
        <div className={styles.avatarInner}>
          <img
            src={avatar || PLAYER_AVATARS[color]}
            alt=""
            className={styles.avatar}
            draggable={false}
          />
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.header}>
          <span className={styles.label}>{label || DEFAULT_LABELS[color]}</span>
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {status}
          </span>
        </div>
        {showCapturedPieces && <CapturedPieces color={color} variant="inline" />}
      </div>
    </div>
  );
}
