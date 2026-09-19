import styles from './GamePanel.module.css';
import { useEffect, useId, useState } from 'react';
import { useChessStore } from '../store/useChessStore';
import { PIECE_ASSETS } from '../assets/pieces';
import type { ColorChoice, GameConfig, GameMode, OpponentLevel } from '../store/types';

const MODE_LABELS: Record<GameMode, string> = {
  local: '2 players',
  computer: 'vs Computer',
};

const LEVELS: OpponentLevel[] = [1, 2, 3, 4, 5];

const COLOR_OPTIONS: Array<{ value: ColorChoice; label: string }> = [
  { value: 'W', label: 'Play as white' },
  { value: 'B', label: 'Play as black' },
  { value: 'random', label: 'Random color' },
];

/** "Random" by FortAwesome (Font Awesome Free, CC BY), for the "random color" option; see THIRD_PARTY_LICENSES.md */
function RandomColorIcon() {
  return (
    <svg viewBox="0 0 512 512" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M504.97 359.03a24 24 0 0 1 0 33.94l-80 79.98c-15 15.01-40.97 4.5-40.97-16.97V416h-58.78a12 12 0 0 1-8.78-3.81l-70.55-75.6 53.33-57.14L352 336h32v-39.98c0-21.44 25.94-32 40.97-16.97zM12 176h84l52.78 56.55 53.33-57.14-70.55-75.6a12 12 0 0 0-8.78-3.81H12a12 12 0 0 0-12 12v56a12 12 0 0 0 12 12m372 0v39.98c0 21.46 25.96 31.98 40.97 16.98l80-79.99a24 24 0 0 0 0-33.94l-80-79.98C409.94 24.02 384 34.58 384 56.02V96h-58.78a12 12 0 0 0-8.78 3.81L96 336H12a12 12 0 0 0-12 12v56a12 12 0 0 0 12 12h110.79a12 12 0 0 0 8.77-3.81L352 176z" />
    </svg>
  );
}

/**
 * The "Game" panel: pick the mode ("vs Computer" / "2 players"), the human's color and the
 * computer's level, then start. Choices are staged until the main button is pressed; if a game
 * is in progress that button asks for a second click, so a game is never lost by accident.
 */
export function GamePanel({ modes, className }: { modes: GameMode[]; className?: string }) {
  const gameMode = useChessStore((state) => state.gameMode);
  const colorChoice = useChessStore((state) => state.colorChoice);
  const opponentLevel = useChessStore((state) => state.opponentLevel);
  const gameId = useChessStore((state) => state.gameId);
  const hasMoves = useChessStore((state) => state.moveHistory.length > 0);
  const isGameOver = useChessStore((state) => state.checkState.isCheckmate || state.checkState.isStalemate);
  const turn = useChessStore((state) => state.turn);
  const playerColor = useChessStore((state) => state.playerColor);
  const aiThinking = useChessStore((state) => state.aiThinking);
  const promotionPending = useChessStore((state) => state.coronation.status);
  const startGame = useChessStore((state) => state.startGame);

  const [staged, setStaged] = useState<GameConfig>({ mode: gameMode, colorChoice, level: opponentLevel });
  const [confirming, setConfirming] = useState(false);
  const colorLabelId = useId();
  const levelLabelId = useId();

  // A new game (from here, the game over panel or a restored save) resets the staged choices
  useEffect(() => {
    setStaged({ mode: gameMode, colorChoice, level: opponentLevel });
    setConfirming(false);
  }, [gameMode, colorChoice, opponentLevel, gameId]);

  const inProgress = hasMoves && !isGameOver;
  const stage = (update: Partial<GameConfig>) => {
    setStaged((previous) => ({ ...previous, ...update }));
    setConfirming(false);
  };

  const handleStart = () => {
    if (inProgress && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    startGame(staged);
  };

  const vsComputer = staged.mode === 'computer';
  const startLabel = confirming ? 'Click again to confirm' : vsComputer ? 'Play' : 'New game';
  const hasPendingChanges =
    staged.mode !== gameMode ||
    (vsComputer && (staged.colorChoice !== colorChoice || staged.level !== opponentLevel));

  let status = '';
  if (isGameOver) status = 'Game over';
  // The turn already passed to the other side while the promoting player picks a piece
  else if (promotionPending) status = 'Choose a piece';
  else if (gameMode === 'computer') status = aiThinking || turn !== playerColor ? 'Computer is thinking…' : 'Your move';
  else status = turn === 'W' ? 'White to move' : 'Black to move';

  return (
    // data-game-mode lets the board layout make room for the color and level rows (see ChessBoard.module.css)
    <section
      className={[styles.gamePanel, className].filter(Boolean).join(' ')}
      aria-label="Game"
      data-game-mode={staged.mode}
    >
      <header className={styles.header}>
        <span className={styles.title}>Game</span>
        <span className={styles.status} role="status">{status}</span>
      </header>

      {modes.length > 1 && (
        <div className={styles.segmented} role="radiogroup" aria-label="Game mode">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={staged.mode === mode}
              className={styles.segment}
              onClick={() => stage({ mode })}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      )}

      {vsComputer && (
        <>
          <div className={styles.row}>
            <span className={styles.rowLabel} id={colorLabelId}>Color</span>
            <div className={styles.options} role="radiogroup" aria-labelledby={colorLabelId}>
              {COLOR_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={staged.colorChoice === value}
                  aria-label={label}
                  title={label}
                  className={`${styles.chip} ${styles.colorChip}`}
                  onClick={() => stage({ colorChoice: value })}
                >
                  {value === 'random' ? (
                    <RandomColorIcon />
                  ) : (
                    <img src={PIECE_ASSETS[`${value}K`]} alt="" className={styles.king} draggable={false} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel} id={levelLabelId}>Level</span>
            <div className={styles.options} role="radiogroup" aria-labelledby={levelLabelId}>
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={staged.level === level}
                  aria-label={`Level ${level}`}
                  className={styles.chip}
                  onClick={() => stage({ level })}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {inProgress && hasPendingChanges && !confirming && (
        <p className={styles.hint}>Starts a new game with these settings</p>
      )}

      <button
        type="button"
        className={`${styles.start}${confirming ? ` ${styles.confirming}` : ''}`}
        onClick={handleStart}
      >
        {startLabel}
      </button>
    </section>
  );
}
