import styles from "./PlayerBadge.module.css";
import { useChessStore } from "../store/useChessStore";
import { COMPUTER_AVATAR, PLAYER_AVATARS } from "../assets/avatars";
import { CapturedPieces } from "../CapturedPieces/CapturedPieces";

const DEFAULT_LABELS: Record<"W" | "B", string> = {
  W: "White pieces",
  B: "Black pieces",
};

export function PlayerBadge({
  color,
  showCapturedPieces = false,
  className,
}: {
  color: "W" | "B";
  showCapturedPieces?: boolean;
  className?: string;
}) {
  const turn = useChessStore((state) => state.turn);
  const checkState = useChessStore((state) => state.checkState);
  const gameMode = useChessStore((state) => state.gameMode);
  const playerColor = useChessStore((state) => state.playerColor);
  const opponentLevel = useChessStore((state) => state.opponentLevel);
  const aiThinking = useChessStore((state) => state.aiThinking);

  const isGameOver = checkState.isCheckmate || checkState.isStalemate;
  const isActive = turn === color && !isGameOver;
  const isComputer = gameMode === "computer" && color !== playerColor;

  const label =
    gameMode !== "computer"
      ? DEFAULT_LABELS[color]
      : isComputer
        ? `Computer · Level ${opponentLevel}`
        : "You";

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
          src={isComputer ? COMPUTER_AVATAR : PLAYER_AVATARS[color]}
          alt=""
          className={styles.avatar}
          draggable={false}
        />
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.label}>{label}</span>
          {isComputer && aiThinking && (
            <span className={styles.thinking} role="status" aria-label="Computer is thinking">
              <span />
              <span />
              <span />
            </span>
          )}
        </div>
        {showCapturedPieces && (
          <CapturedPieces color={color} variant="inline" />
        )}
      </div>
    </div>
  );
}
