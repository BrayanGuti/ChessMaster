import styles from './CoronationPanel.module.css';
import { useChessStore } from '../store/useChessStore';
import { PIECE_ASSETS } from '../assets/pieces';
import { toDisplay } from '../ChessBoard/orientation';

export function CoronationPanel({ cords, flipped = false }: { cords: { col: number; row: number }; flipped?: boolean }) {
    const makeCoronation = useChessStore((state) => state.makeCoronation);
    // The promoting pawn already stands on the last rank
    const color = useChessStore((state) => state.chessBoardpositions[cords.row][cords.col].piece[0]) === 'B' ? 'B' : 'W';
    const display = toDisplay(cords, flipped);

    const pieces = [
        { key: `${color}Q`, label: 'Queen' },
        { key: `${color}R`, label: 'Rook' },
        { key: `${color}B`, label: 'Bishop' },
        { key: `${color}N`, label: 'Knight' },
    ];

    // Promotion on the top edge of the screen: the panel grows down; on the bottom edge it grows up
    const isTop = display.row === 0;
    const orderedPieces = isTop ? pieces : [...pieces].reverse();

    return (
        <>
            <div className={styles.backdrop} aria-hidden="true" />
            <div
                className={`${styles.coronationPanel} ${isTop ? styles.fromTop : styles.fromBottom}`}
                style={{ top: isTop ? '0%' : '50%', left: `${display.col * 12.5}%` }}
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
