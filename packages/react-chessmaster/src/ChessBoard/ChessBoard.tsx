import styles from './ChessBoard.module.css';
import { useChessStore } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { MoveHistory } from '../MoveHistory/MoveHistory';
import { CapturedPieces } from '../CapturedPieces/CapturedPieces';
import { PlayerBadge } from '../PlayerBadge/PlayerBadge';
import { ChessErrorBoundary } from '../ErrorBoundary/ChessErrorBoundary';
import { ChessSettings } from '../ChessSettings/ChessSettings';
import { Board } from './Board';
import { useRef, useEffect, CSSProperties } from 'react';
import { SOUND_ASSETS } from '../assets/sounds';
import { resolveStorageKey } from '../store/persistence';
import type { ChessBoardProps } from '../store/types';

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
  onMove,
  onGameEnd,
  onReset,
}: ChessBoardProps) {
  const moveHistory = useChessStore((state) => state.moveHistory);
  const checkState = useChessStore((state) => state.checkState);
  const gameId = useChessStore((state) => state.gameId);
  const settings = useChessStore((state) => state.displaySettings);
  const setSettings = useChessStore((state) => state.setDisplaySettings);

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

    if (checkState.isCheckmate) {
      const winner = checkState.colorOfCheck === 'W' ? 'B' : 'W';
      onGameEnd({ winner, reason: 'checkmate' });
    } else {
      onGameEnd({ winner: null, reason: 'stalemate' });
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

  // With badges visible, captured pieces live inside each player's badge
  const capturedInBadges = playerBadges && capturedPieces;
  const capturedInPanel = capturedPieces && !playerBadges;
  const hasSidePanel = showHistory || capturedInPanel;

  const layoutClassName = [
    styles.layout,
    playerBadges && styles.withBadges,
    !playerBadges && showSettings && styles.withToolbar,
    showSettings && styles.withGear,
    hasSidePanel && styles.withSidePanel,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[styles.chessGame, colorScheme === 'light' && styles.light, className].filter(Boolean).join(' ')}
      style={themeVars}
    >
      <div className={styles.stage}>
        <div className={layoutClassName}>
          {playerBadges && (
            <PlayerBadge
              color="B"
              showCapturedPieces={capturedInBadges}
              className={styles.topBadge}
            />
          )}
          {showSettings && (
            <div className={styles.gear}>
              <ChessSettings settings={settings} onChange={setSettings} />
            </div>
          )}
          <div className={styles.boardArea}><Board /></div>
          {hasSidePanel && (
            <aside className={styles.sidePanel}>
              {capturedInPanel && <CapturedPieces color="B" />}
              {showHistory && <MoveHistory className={styles.history} />}
              {capturedInPanel && <CapturedPieces color="W" />}
            </aside>
          )}
          {playerBadges && (
            <PlayerBadge
              color="W"
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
  // Both only seed the store on mount; after that the settings menu owns the layout
  const { persist, showPlayerBadges, showCapturedPieces, showMoveHistory } = props;

  return (
    <ChessGameProvider
      storageKey={resolveStorageKey(persist)}
      initialDisplaySettings={{
        playerBadges: Boolean(showPlayerBadges),
        capturedPieces: Boolean(showCapturedPieces),
        moveHistory: Boolean(showMoveHistory),
      }}
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

