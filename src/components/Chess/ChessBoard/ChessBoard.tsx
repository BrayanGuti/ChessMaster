import styles from './ChessBoard.module.css';
import { useChessStore } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { MoveHistory } from '../MoveHistory/MoveHistory';
import { CapturedPieces } from '../CapturedPieces/CapturedPieces';
import { PlayerBadge } from '../PlayerBadge/PlayerBadge';
import { ChessErrorBoundary } from '../ErrorBoundary/ChessErrorBoundary';
import { ChessSettings } from '../ChessSettings/ChessSettings';
import { Board } from './Board';
import { useRef, useEffect, useState, CSSProperties } from 'react';
import { SOUND_ASSETS } from '../assets/sounds';
import type { ChessBoardProps, ChessDisplaySettings } from '../store/types';

function ChessBoardContent({
  theme,
  className,
  showMoveHistory,
  showCapturedPieces,
  showPlayerBadges,
  showSettings = true,
  onMove,
  onGameEnd,
}: ChessBoardProps) {
  const moveHistory = useChessStore((state) => state.moveHistory);
  const checkState = useChessStore((state) => state.checkState);

  // Props only seed the initial layout; the settings menu can change it at runtime
  const [settings, setSettings] = useState<ChessDisplaySettings>(() => ({
    playerBadges: Boolean(showPlayerBadges),
    capturedPieces: Boolean(showCapturedPieces),
    moveHistory: Boolean(showMoveHistory),
    sound: true,
  }));

  useEffect(() => {
    if (onMove && moveHistory.length > 0) {
      onMove(moveHistory[moveHistory.length - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveHistory]);

  useEffect(() => {
    if (!onGameEnd) return;

    if (checkState.isCheckmate) {
      const winner = checkState.colorOfCheck === 'W' ? 'B' : 'W';
      onGameEnd({ winner, reason: 'checkmate' });
    } else if (checkState.isStalemate) {
      onGameEnd({ winner: null, reason: 'stalemate' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkState.isCheckmate, checkState.isStalemate]);

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

  const { playerBadges, capturedPieces, moveHistory: showHistory, sound } = settings;

  // With badges visible, captured pieces live inside each player's badge
  const capturedInBadges = playerBadges && capturedPieces;
  const capturedInPanel = capturedPieces && !playerBadges;
  const hasSidePanel = showHistory || capturedInPanel;
  const hasTopBar = playerBadges || showSettings;

  const layoutClassName = [
    styles.layout,
    playerBadges && styles.withBadges,
    !playerBadges && showSettings && styles.withToolbar,
    hasSidePanel && styles.withSidePanel,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.chessGame}${className ? ` ${className}` : ''}`} style={themeVars}>
      <div className={styles.stage}>
        <div className={layoutClassName}>
          {hasTopBar && (
            <div className={styles.topBar}>
              {playerBadges && (
                <PlayerBadge color="B" showCapturedPieces={capturedInBadges} className={styles.badge} />
              )}
              {showSettings && <ChessSettings settings={settings} onChange={setSettings} />}
            </div>
          )}
          <div className={styles.row}>
            <div className={styles.boardArea}><Board /></div>
            {hasSidePanel && (
              <aside className={styles.sidePanel}>
                {capturedInPanel && <CapturedPieces color="B" />}
                {showHistory && <MoveHistory className={styles.history} />}
                {capturedInPanel && <CapturedPieces color="W" />}
              </aside>
            )}
          </div>
          {playerBadges && (
            <PlayerBadge color="W" showCapturedPieces={capturedInBadges} className={styles.badge} />
          )}
        </div>
      </div>
      <PlaySound muted={!sound} />
    </div>
  );
}

export function ChessBoard(props: ChessBoardProps = {}) {
  return (
    <ChessGameProvider>
      <ChessErrorBoundary>
        <ChessBoardContent {...props} />
      </ChessErrorBoundary>
    </ChessGameProvider>
  );
}

function PlaySound({ muted }: { muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundToPlay = useChessStore((state) => state.soundToPlay);
  const setSoundToPlay = useChessStore((state) => state.setSoundToPlay);

  useEffect(() => {
    if (soundToPlay && muted) {
      setSoundToPlay(null);
      return;
    }
    if (soundToPlay && audioRef.current && SOUND_ASSETS[soundToPlay]) {
      audioRef.current.src = SOUND_ASSETS[soundToPlay];
      audioRef.current.onended = () => setSoundToPlay(null);
      audioRef.current.play().catch(() => {
        // Autoplay prevented, reset sound
        setSoundToPlay(null);
      });
    }
  }, [soundToPlay, muted, setSoundToPlay]);

  return <audio ref={audioRef} />;
}

