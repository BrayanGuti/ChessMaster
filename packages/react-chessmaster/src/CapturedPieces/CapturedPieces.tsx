import styles from "./CapturedPieces.module.css";
import { useChessStore } from "../store/useChessStore";
import {
  deriveCapturedPieces,
  CapturablePieceType,
} from "../store/deriveCapturedPieces";
import { PIECE_ASSETS } from "../assets/pieces";

const PIECE_ORDER: CapturablePieceType[] = ["Q", "R", "B", "N", "P"];

const PIECE_VALUES: Record<CapturablePieceType, number> = {
  Q: 9,
  R: 5,
  B: 3,
  N: 3,
  P: 1,
};

const PIECE_NAMES: Record<CapturablePieceType, string> = {
  Q: "queen",
  R: "rook",
  B: "bishop",
  N: "knight",
  P: "pawn",
};

type Captured = Partial<Record<CapturablePieceType, number>>;

function materialOf(captured: Captured): number {
  return PIECE_ORDER.reduce(
    (total, type) => total + (captured[type] || 0) * PIECE_VALUES[type],
    0,
  );
}

export function CapturedPieces({
  color,
  variant = "panel",
  className,
}: {
  color: "W" | "B";
  variant?: "panel" | "inline";
  className?: string;
}) {
  const moveHistory = useChessStore((state) => state.moveHistory);
  const allCaptured = deriveCapturedPieces(moveHistory);
  const opponentColor = color === "W" ? "B" : "W";
  const captured = allCaptured[color];
  const advantage =
    materialOf(captured) - materialOf(allCaptured[opponentColor]);

  const groups = PIECE_ORDER.filter((type) => (captured[type] || 0) > 0).map(
    (type) => ({ type, count: captured[type] as number }),
  );

  const isInline = variant === "inline";

  return (
    <div
      className={`${styles.capturedPieces} ${isInline ? styles.inline : styles.panel}${className ? ` ${className}` : ""}`}
      data-opponent={opponentColor}
    >
      {groups.map(({ type, count }) => (
        <span
          key={type}
          className={styles.group}
          title={`${count} × ${PIECE_NAMES[type]}`}
        >
          {Array.from({ length: count }, (_, index) => (
            <img
              key={index}
              src={PIECE_ASSETS[`${opponentColor}${type}`]}
              alt={index === 0 ? `${count} ${PIECE_NAMES[type]}` : ""}
              className={styles.icon}
              draggable={false}
            />
          ))}
        </span>
      ))}
      {advantage > 0 && <span className={styles.advantage}>+{advantage}</span>}
    </div>
  );
}
