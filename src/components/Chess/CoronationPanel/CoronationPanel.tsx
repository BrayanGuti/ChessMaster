import styles from './CoronationPanel.module.css';
import { useChessStore } from '../store/useChessStore';
import { PIECE_ASSETS } from '../assets/pieces';

export function CoronationPanel({ cords }: { cords: { col: number; row: number } }) {
    const makeCoronation = useChessStore((state) => state.makeCoronation);
    const color = cords.row === 0 ? 'W' : 'B';

    const handleCoronationSelection = (piece: string) => {
        makeCoronation(piece);
    };

    const pieces = [
        { key: `${color}Q`, label: 'Queen' },
        { key: `${color}R`, label: 'Rook' },
        { key: `${color}B`, label: 'Bishop' },
        { key: `${color}N`, label: 'Knight' },
    ];

    const top = cords.row === 0 ? '0%' : '50%';
    const left = `${cords.col * 12.5}%`;

    return (
        <div className={styles.coronationPanel} style={{ top, left }}>
            {pieces.map((piece) => (
                <div
                    className={styles.coronationPanelDiv}
                    onClick={() => handleCoronationSelection(piece.key)}
                    key={piece.key}
                >
                    <img
                        className={styles.coronationPanelImg}
                        src={PIECE_ASSETS[piece.key as keyof typeof PIECE_ASSETS]}
                        alt={piece.label}
                    />
                </div>
            ))}
        </div>
    );
}
