import './ChessBoard.css';
import { useChessManager } from '../store/useChessManager';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { useRef, useEffect } from "react"

export function ChessBoard() {
  const positions = useChessManager((state) => state.chessBoardpositions);
  const coronation = useChessManager((state) => state.coronation);

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



function PlaySound() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundToPlay = useChessManager((state) => state.soundToPlay);
  const setSoundToPlay = useChessManager((state) => state.setSoundToPlay);

  useEffect(() => {
    if (soundToPlay && audioRef.current) {
      
      audioRef.current.src = `/Sound/${soundToPlay}.mp3`;
      console.log("Reproduciendo sonido:", soundToPlay);
      audioRef.current.play()
      setTimeout(() => {
        setSoundToPlay(null);
      }, 2000);
    }
  }, [soundToPlay, setSoundToPlay]);

  return <audio ref={audioRef} />;
}

