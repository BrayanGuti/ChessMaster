import styles from './CoronationPanel.module.css';
import { useChessStore } from '../store/useChessStore';
import { PIECE_ASSETS } from '../assets/pieces';

export function CoronationPanel({ cords }: { cords: { col: number; row: number } }) {
    const makeCoronation = useChessStore((state) => state.makeCoronation);
    const color = cords.row === 0 ? 'W' : 'B';

    const pieces = [
        { key: `${color}Q`, label: 'Queen' },
        { key: `${color}R`, label: 'Rook' },
        { key: `${color}B`, label: 'Bishop' },
        { key: `${color}N`, label: 'Knight' },
    ];

    // White promotes on the top row (panel grows down), black on the bottom row (panel grows up)
    const isTop = cords.row === 0;
    const orderedPieces = isTop ? pieces : [...pieces].reverse();

    return (
        <>
            <div className={styles.backdrop} aria-hidden="true" />
            <div
                className={`${styles.coronationPanel} ${isTop ? styles.fromTop : styles.fromBottom}`}
                style={{ top: isTop ? '0%' : '50%', left: `${cords.col * 12.5}%` }}
                role="dialog"
                aria-label="Choose a piece for promotion"
            >
                {orderedPieces.map((piece) => (
                    <button
                        type="button"
                        className={styles.option}
                        onClick={() => makeCoronation(piece.key)}
                        key={piece.key}
                        title={piece.label}
                    >
                        <img
                            className={styles.optionImg}
                            src={PIECE_ASSETS[piece.key as keyof typeof PIECE_ASSETS]}
                            alt={piece.label}
                            draggable={false}
                        />
                    </button>
                ))}
            </div>
        </>
    );
}
