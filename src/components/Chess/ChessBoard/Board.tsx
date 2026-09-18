import styles from './ChessBoard.module.css';
import { useRef } from 'react';
import { useChessStore } from '../store/useChessStore';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { GameOverModal } from '../GameOverModal/GameOverModal';
import { PIECE_ASSETS } from '../assets/pieces';
import { useBoardDrag } from './useBoardDrag';

export function Board() {
  const positions = useChessStore((state) => state.chessBoardpositions);
  const coronation = useChessStore((state) => state.coronation);
  const lastMove = useChessStore((state) => state.moveHistory[state.moveHistory.length - 1]);

  const boardRef = useRef<HTMLElement>(null);
  const { drag, hoverCell, ghostRef, handlers } = useBoardDrag(boardRef);

  return (
    <section
      ref={boardRef}
      className={`${styles.chessBoard}${drag ? ` ${styles.dragging}` : ''}`}
      {...handlers}
    >
      {positions.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <ChessCell
            key={`${rowIndex}-${colIndex}`}
            cellInformation={cell}
            isLastMove={cell.cellName === lastMove?.from || cell.cellName === lastMove?.to}
            isDragOrigin={drag?.origin.row === rowIndex && drag?.origin.col === colIndex}
          />
        ))
      )}

      {drag && hoverCell && (
        <div
          className={styles.dropTarget}
          style={{ top: `${hoverCell.row * 12.5}%`, left: `${hoverCell.col * 12.5}%` }}
          aria-hidden="true"
        />
      )}

      {drag && (
        <img
          ref={ghostRef}
          src={PIECE_ASSETS[drag.piece.substring(0, 2) as keyof typeof PIECE_ASSETS]}
          alt=""
          className={styles.dragGhost}
          draggable={false}
          aria-hidden="true"
        />
      )}

      {coronation.status && <CoronationPanel cords={coronation.coordinates} />}
      <GameOverModal />
    </section>
  );
}
