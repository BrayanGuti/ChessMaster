import { useEffect, useId, useRef } from 'react';
import styles from './GameOverModal.module.css';
import { useChessStore } from '../store/useChessStore';

const WINNER_LABEL: Record<'W' | 'B', string> = {
  W: 'White wins',
  B: 'Black wins',
};

// Drawn for this package (no third-party rights), like the settings icons
function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

/**
 * `closable` is only true with the settings bar shown (showSettings): its Show result button is
 * the only way back once closed, so without it the dialog stays put, exactly like before this
 * button existed.
 */
export function GameOverModal({ closable = false }: { closable?: boolean }) {
  const checkState = useChessStore((state) => state.checkState);
  const resultDismissed = useChessStore((state) => state.resultDismissed);
  const resetGame = useChessStore((state) => state.resetGame);
  const dismissResult = useChessStore((state) => state.dismissResult);
  const gameMode = useChessStore((state) => state.gameMode);
  const playerColor = useChessStore((state) => state.playerColor);
  const titleId = useId();

  const isGameOver = checkState.isCheckmate || checkState.isStalemate;
  const visible = isGameOver && !resultDismissed;

  // Returning null below does not unmount this component (Board always renders it), so a mount
  // effect would only ever fire once: focus Rematch on every hidden-to-visible transition instead,
  // which covers the dialog's first appearance, a rematch that ends in mate again, and reopening
  // it with the Show result button.
  const rematchRef = useRef<HTMLButtonElement>(null);
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) rematchRef.current?.focus();
    wasVisible.current = visible;
  }, [visible]);

  useEffect(() => {
    if (!closable || !visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissResult();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closable, visible, dismissResult]);

  if (!visible) return null;

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
    <div
      className={styles.overlay}
      onClick={closable ? (event) => { if (event.target === event.currentTarget) dismissResult(); } : undefined}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {closable && (
          <button type="button" className={styles.close} aria-label="Close" onClick={dismissResult}>
            <CloseIcon />
          </button>
        )}
        <h2 id={titleId} className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        {/* resetGame keeps the mode, color choice and level, so this is a rematch against the computer */}
        <button ref={rematchRef} className={styles.button} onClick={resetGame}>
          {vsComputer ? 'Rematch' : 'New game'}
        </button>
      </div>
    </div>
  );
}
