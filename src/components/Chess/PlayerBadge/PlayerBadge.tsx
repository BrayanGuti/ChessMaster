import styles from "./PlayerBadge.module.css";
import { useChessStore } from "../store/useChessStore";
import { PLAYER_AVATARS } from "../assets/avatars";
import { CapturedPieces } from "../CapturedPieces/CapturedPieces";

const DEFAULT_LABELS: Record<"W" | "B", string> = {
  W: "White pieces",
  B: "Black pieces",
};

export function PlayerBadge({
  color,
  label,
  avatar,
  showCapturedPieces = false,
  className,
}: {
  color: "W" | "B";
  label?: string;
  avatar?: string;
  showCapturedPieces?: boolean;
  className?: string;
}) {
  const turn = useChessStore((state) => state.turn);
  const checkState = useChessStore((state) => state.checkState);

  const isGameOver = checkState.isCheckmate || checkState.isStalemate;
  const isActive = turn === color && !isGameOver;

  const classNames = [
    styles.playerBadge,
    color === "W" ? styles.white : styles.black,
    isActive && styles.active,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} aria-current={isActive ? "true" : undefined}>
      <div className={styles.avatarFrame}>
        <img
          src={avatar || PLAYER_AVATARS[color]}
          alt=""
          className={styles.avatar}
          draggable={false}
        />
      </div>

      <div className={styles.info}>
        <span className={styles.label}>{label || DEFAULT_LABELS[color]}</span>
        {showCapturedPieces && (
          <CapturedPieces color={color} variant="inline" />
        )}
      </div>
    </div>
  );
}
