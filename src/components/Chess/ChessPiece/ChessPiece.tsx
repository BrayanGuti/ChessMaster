import styles from './ChessPiece.module.css';
import { PIECE_ASSETS } from '../assets/pieces';

export function ChessPiece({ piece }: { piece: ChessBoardCell['piece'] }) {
    if (piece === '') {
        return null;
    }

    const pieceName = piece.substring(0, 2);
    const pieceUrl = PIECE_ASSETS[pieceName as keyof typeof PIECE_ASSETS];

    return (
        <img
            src={pieceUrl}
            alt={pieceName}
            className={styles.chessPiece}
            draggable={false}
        />
    );
}