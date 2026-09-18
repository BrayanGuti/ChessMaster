import styles from './ChessBoard.module.css';
import { useChessStore } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { MoveHistory } from '../MoveHistory/MoveHistory';
import { CapturedPieces } from '../CapturedPieces/CapturedPieces';
import { PlayerBadge } from '../PlayerBadge/PlayerBadge';
import { GameOverModal } from '../GameOverModal/GameOverModal';
import { ChessErrorBoundary } from '../ErrorBoundary/ChessErrorBoundary';
import { ChessSettings } from '../ChessSettings/ChessSettings';
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
  const positions = useChessStore((state) => state.chessBoardpositions);
  const coronation = useChessStore((state) => state.coronation);
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

  const themeVars: CSSProperties = theme
    ? ({
        '--light-square': theme.lightSquare || '#f0d9b5',
        '--dark-square': theme.darkSquare || '#b58863',
        '--highlight': theme.highlight || '#baca44',
        '--accent': theme.accent || '#7daee0',
      } as CSSProperties)
    : {};

  const board = (
    <section className={styles.chessBoard}>
      {positions.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <ChessCell
            key={`${rowIndex}-${colIndex}`}
            cellInformation={cell}
          />
        ))
      )}
      {coronation.status && <CoronationPanel cords={coronation.coordinates} />}
      <GameOverModal />
    </section>
  );

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
            <div className={styles.boardArea}>{board}</div>
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

