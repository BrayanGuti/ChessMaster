import styles from './ChessBoard.module.css';
import { useChessStore } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { MoveHistory } from '../MoveHistory/MoveHistory';
import { CapturedPieces } from '../CapturedPieces/CapturedPieces';
import { PlayerBadge } from '../PlayerBadge/PlayerBadge';
import { GameOverModal } from '../GameOverModal/GameOverModal';
import { useRef, useEffect, CSSProperties } from 'react';
import { SOUND_ASSETS } from '../assets/sounds';
import type { ChessBoardProps } from '../store/types';

function ChessBoardContent({
  theme,
  className,
  showMoveHistory,
  showCapturedPieces,
  showPlayerBadges,
  onMove,
  onGameEnd,
}: ChessBoardProps) {
  const positions = useChessStore((state) => state.chessBoardpositions);
  const coronation = useChessStore((state) => state.coronation);
  const moveHistory = useChessStore((state) => state.moveHistory);
  const checkState = useChessStore((state) => state.checkState);

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
    <section
      className={`${styles.chessBoard}${className ? ` ${className}` : ''}`}
      style={themeVars}
    >
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

  if (!showMoveHistory && !showCapturedPieces && !showPlayerBadges) {
    return (
      <>
        {board}
        <PlaySound />
      </>
    );
  }

  return (
    <div className={styles.chessBoardWrapper}>
      {showPlayerBadges && <PlayerBadge color="B" />}
      <div className={styles.chessBoardRow}>
        {board}
        {(showMoveHistory || showCapturedPieces) && (
          <aside className={styles.sidePanel}>
            {showCapturedPieces && <CapturedPieces color="B" />}
            {showMoveHistory && <MoveHistory />}
            {showCapturedPieces && <CapturedPieces color="W" />}
          </aside>
        )}
      </div>
      {showPlayerBadges && <PlayerBadge color="W" />}
      <PlaySound />
    </div>
  );
}

export function ChessBoard(props: ChessBoardProps = {}) {
  return (
    <ChessGameProvider>
      <ChessBoardContent {...props} />
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

