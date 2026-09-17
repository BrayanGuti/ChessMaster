import styles from './ChessBoard.module.css';
import { useChessStore } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { useRef, useEffect, CSSProperties } from 'react';
import { SOUND_ASSETS } from '../assets/sounds';
import type { ChessBoardProps } from '../store/types';

function ChessBoardContent({ theme, className }: ChessBoardProps) {
  const positions = useChessStore((state) => state.chessBoardpositions);
  const coronation = useChessStore((state) => state.coronation);

  const themeVars: CSSProperties = theme
    ? ({
        '--light-square': theme.lightSquare || '#f0d9b5',
        '--dark-square': theme.darkSquare || '#b58863',
        '--highlight': theme.highlight || '#baca44',
        '--accent': theme.accent || '#7daee0',
      } as CSSProperties)
    : {};

  return (
    <>
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
      </section>
      <PlaySound />
    </>
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

