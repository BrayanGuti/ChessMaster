import styles from './ChessBoard.module.css';
import { useChessStore, useChessStoreApi } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { MoveHistory } from '../MoveHistory/MoveHistory';
import { CapturedPieces } from '../CapturedPieces/CapturedPieces';
import { PlayerBadge } from '../PlayerBadge/PlayerBadge';
import { ChessErrorBoundary } from '../ErrorBoundary/ChessErrorBoundary';
import { ChessSettings } from '../ChessSettings/ChessSettings';
import { GamePanel } from '../GamePanel/GamePanel';
import { Board } from './Board';
import { useBoardFlipped } from './orientation';
import { useComputerOpponent } from '../engine/useComputerOpponent';
import { useRef, useEffect, useState, CSSProperties } from 'react';
import { SOUND_ASSETS } from '../assets/sounds';
import { resolveStorageKey } from '../store/persistence';
import type { ChessBoardProps, ColorChoice, GameConfig, GameMode } from '../store/types';

// Also the order of the Game panel's mode switch; the first one is the default mode
const ALL_MODES: GameMode[] = ['computer', 'local'];

/** Valid, de-duplicated `modes` prop, in ALL_MODES order; both modes when missing or empty. */
function resolveModes(modes: GameMode[] | undefined): GameMode[] {
  const valid = ALL_MODES.filter((mode) => modes?.includes(mode));
  return valid.length > 0 ? valid : ALL_MODES;
}

/** The first game's configuration from the props. `opponent.color` is the computer's color. */
function resolveInitialGame({ modes, defaultMode, opponent }: ChessBoardProps): GameConfig {
  const allowed = resolveModes(modes);
  const computerColor: ColorChoice = opponent?.color ?? 'B';
  return {
    mode: defaultMode && allowed.includes(defaultMode) ? defaultMode : allowed[0],
    colorChoice: computerColor === 'random' ? 'random' : computerColor === 'W' ? 'B' : 'W',
    level: opponent?.level ?? 2,
  };
}

/*
 * The callbacks below compare against the value seen on the previous run and skip the first
 * one: a game restored from localStorage already has moves (or is already over), and that
 * must not be reported as if it had just happened.
 */
function ChessBoardContent({
  theme,
  colorScheme = 'dark',
  className,
  showSettings = true,
  showGamePanel = true,
  modes,
  opponent,
  onMove,
  onGameEnd,
  onReset,
}: ChessBoardProps) {
  const moveHistory = useChessStore((state) => state.moveHistory);
  const checkState = useChessStore((state) => state.checkState);
  const gameId = useChessStore((state) => state.gameId);
  const settings = useChessStore((state) => state.displaySettings);
  const setSettings = useChessStore((state) => state.setDisplaySettings);
  const gameMode = useChessStore((state) => state.gameMode);
  const playerColor = useChessStore((state) => state.playerColor);
  const flipped = useBoardFlipped();
  const store = useChessStoreApi();
  const allowedModes = resolveModes(modes);

  // The prop is the initial scheme; the player can switch it from the settings bar
  const [scheme, setScheme] = useState(colorScheme);
  useEffect(() => setScheme(colorScheme), [colorScheme]);

  useComputerOpponent(opponent?.getMove);

  // A saved game may use a mode the developer no longer allows: start over in an allowed one
  const modeAllowed = allowedModes.includes(gameMode);
  useEffect(() => {
    if (modeAllowed) return;
    const { colorChoice, opponentLevel, startGame } = store.getState();
    startGame({ mode: allowedModes[0], colorChoice, level: opponentLevel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeAllowed]);

  const previousMoveCount = useRef<number | null>(null);
  useEffect(() => {
    const previous = previousMoveCount.current;
    previousMoveCount.current = moveHistory.length;
    if (previous !== null && onMove && moveHistory.length > previous) {
      onMove(moveHistory[moveHistory.length - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveHistory]);

  const wasGameOver = useRef<boolean | null>(null);
  useEffect(() => {
    const isGameOver = checkState.isCheckmate || checkState.isStalemate;
    const previous = wasGameOver.current;
    wasGameOver.current = isGameOver;
    if (previous !== false || !isGameOver || !onGameEnd) return;

    const context = { mode: gameMode, playerColor: gameMode === 'computer' ? playerColor : null };
    if (checkState.isCheckmate) {
      const winner = checkState.colorOfCheck === 'W' ? 'B' : 'W';
      onGameEnd({ winner, reason: 'checkmate', ...context });
    } else {
      onGameEnd({ winner: null, reason: 'stalemate', ...context });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkState.isCheckmate, checkState.isStalemate]);

  const previousGameId = useRef(gameId);
  useEffect(() => {
    if (gameId === previousGameId.current) return;
    previousGameId.current = gameId;
    onReset?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Only the provided tokens are overridden; the rest keep the defaults from ChessBoard.module.css
  const themeVars = Object.fromEntries(
    Object.entries({
      '--light-square': theme?.lightSquare,
      '--dark-square': theme?.darkSquare,
      '--highlight': theme?.highlight,
      '--accent': theme?.accent,
      '--check': theme?.check,
      '--move-hint': theme?.moveHint,
    }).filter(([, value]) => value)
  ) as CSSProperties;

  const { playerBadges, capturedPieces, moveHistory: showHistory } = settings;
  const showGame = showGamePanel && settings.gamePanel;

  // The player whose side of the board is at the top of the screen
  const topColor = flipped ? 'W' : 'B';
  const bottomColor = flipped ? 'B' : 'W';

  // With badges visible, captured pieces live inside each player's badge
  const capturedInBadges = playerBadges && capturedPieces;
  const capturedInPanel = capturedPieces && !playerBadges;
  const hasSidePanel = showHistory || capturedInPanel || showGame;

  const layoutClassName = [
    styles.layout,
    playerBadges && styles.withBadges,
    !playerBadges && showSettings && styles.withToolbar,
    showSettings && styles.withGear,
    hasSidePanel && styles.withSidePanel,
    (showHistory || capturedInPanel) && styles.withHistory,
    showGame && styles.withGamePanel,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[
        styles.chessGame,
        scheme === 'light' && styles.light,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={themeVars}
    >
      <div className={styles.stage}>
        <div className={layoutClassName}>
          {playerBadges && (
            <PlayerBadge
              key={topColor}
              color={topColor}
              showCapturedPieces={capturedInBadges}
              className={styles.topBadge}
            />
          )}
          {showSettings && (
            <div className={styles.gear}>
              <ChessSettings
                settings={settings}
                onChange={setSettings}
                allowGamePanel={showGamePanel}
                colorScheme={scheme}
                onColorSchemeChange={setScheme}
              />
            </div>
          )}
          <div className={styles.boardArea}><Board /></div>
          {hasSidePanel && (
            <aside className={styles.sidePanel}>
              {capturedInPanel && <CapturedPieces color={topColor} />}
              {showHistory && <MoveHistory className={styles.history} />}
              {capturedInPanel && <CapturedPieces color={bottomColor} />}
              {showGame && <GamePanel modes={allowedModes} className={styles.game} />}
            </aside>
          )}
          {playerBadges && (
            <PlayerBadge
              key={bottomColor}
              color={bottomColor}
              showCapturedPieces={capturedInBadges}
              className={styles.bottomBadge}
            />
          )}
        </div>
      </div>
      <PlaySound />
    </div>
  );
}

export function ChessBoard(props: ChessBoardProps = {}) {
  // All of these only seed the store on mount; after that the player's choices rule
  const { persist, showPlayerBadges, showCapturedPieces, showMoveHistory } = props;

  return (
    <ChessGameProvider
      storageKey={resolveStorageKey(persist)}
      initialDisplaySettings={{
        playerBadges: Boolean(showPlayerBadges),
        capturedPieces: Boolean(showCapturedPieces),
        moveHistory: Boolean(showMoveHistory),
        gamePanel: true,
      }}
      initialGameConfig={resolveInitialGame(props)}
    >
      <ChessErrorBoundary>
        <ChessBoardContent {...props} />
      </ChessErrorBoundary>
    </ChessGameProvider>
  );
}

function PlaySound() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundToPlay = useChessStore((state) => state.soundToPlay);
  const setSoundToPlay = useChessStore((state) => state.setSoundToPlay);

  useEffect(() => {
    if (soundToPlay && audioRef.current && SOUND_ASSETS[soundToPlay]) {
      audioRef.current.src = SOUND_ASSETS[soundToPlay];
      audioRef.current.onended = () => setSoundToPlay(null);
      audioRef.current.play().catch(() => {
        // Autoplay prevented, reset sound
        setSoundToPlay(null);
      });
    }
  }, [soundToPlay, setSoundToPlay]);

  return <audio ref={audioRef} />;
}
