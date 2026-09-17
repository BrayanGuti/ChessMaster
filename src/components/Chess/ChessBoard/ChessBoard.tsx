import './ChessBoard.css';
import { useChessStore } from '../store/useChessStore';
import { ChessGameProvider } from '../store/ChessGameProvider';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { useRef, useEffect } from "react"

function ChessBoardContent() {
  const positions = useChessStore((state) => state.chessBoardpositions);
  const coronation = useChessStore((state) => state.coronation);

  return (
    <>
      <section className="chess-board">
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

export function ChessBoard() {
  return (
    <ChessGameProvider>
      <ChessBoardContent />
    </ChessGameProvider>
  );
}

function PlaySound() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundToPlay = useChessStore((state) => state.soundToPlay);
  const setSoundToPlay = useChessStore((state) => state.setSoundToPlay);

  useEffect(() => {
    if (soundToPlay && audioRef.current) {
      audioRef.current.src = `/Sound/${soundToPlay}.mp3`;
      audioRef.current.play()
      setTimeout(() => {
        setSoundToPlay(null);
      }, 2000);
    }
  }, [soundToPlay, setSoundToPlay]);

  return <audio ref={audioRef} />;
}

