import { useRef } from "react";

export function ServiesPage() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const playSound = () => {
        if (audioRef.current) {
            const randomSound = Math.random() < 0.5 ? 'move-1.mp3' : 'capture-1.mp3';
            audioRef.current.src = `/Sound/${randomSound}`;
            audioRef.current.play();
        }
    };

    return (
        <div>
            {/* Elemento de audio */}
            <audio ref={audioRef}>
                <source type="audio/mpeg" />
                {/* Alternativa para navegadores antiguos */}
                Your browser does not support the audio element.
            </audio>

            <img src={`/Pieces/BB.svg`} alt="move-2" className="chess-piece" />

            {/* Botón para reproducir sonido */}
            <button onClick={playSound}>Reproducir sonido</button>
        </div>
    );
};
