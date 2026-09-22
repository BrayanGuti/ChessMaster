import styles from './ChessBoard.module.css';
import { useRef } from 'react';
import { useChessStore } from '../store/useChessStore';
import { ChessCell } from '../ChessCell/ChessCell';
import { CoronationPanel } from '../CoronationPanel/CoronationPanel';
import { GameOverModal } from '../GameOverModal/GameOverModal';
import { PIECE_ASSETS } from '../assets/pieces';
import { useBoardDrag } from './useBoardDrag';
import { useMoveAnimation } from './useMoveAnimation';
import { squareToCoords } from './moveAnimation';
import { toDisplay, useBoardFlipped } from './orientation';

const INDEXES = [0, 1, 2, 3, 4, 5, 6, 7];

export function Board({ animateMoves = true, resultClosable = false }: { animateMoves?: boolean; resultClosable?: boolean }) {
  const positions = useChessStore((state) => state.chessBoardpositions);
  const coronation = useChessStore((state) => state.coronation);
  const lastMove = useChessStore((state) => state.moveHistory[state.moveHistory.length - 1]);
  const flipped = useBoardFlipped();

  const boardRef = useRef<HTMLElement>(null);
  const { skipNextMove, capturedGhost } = useMoveAnimation(boardRef, animateMoves);
  const { drag, hoverCell, ghostRef, handlers } = useBoardDrag(boardRef, flipped, skipNextMove);
  const hoverDisplay = hoverCell && toDisplay(hoverCell, flipped);
  const ghostDisplay = capturedGhost && toDisplay(squareToCoords(capturedGhost.square), flipped);

  return (
    <section
      ref={boardRef}
      className={`${styles.chessBoard}${drag ? ` ${styles.dragging}` : ''}`}
      {...handlers}
    >
      {/* Cells are laid out in visual order: from white's side, or from black's when flipped */}
      {INDEXES.map((displayRow) =>
        INDEXES.map((displayCol) => {
          const { row, col } = toDisplay({ row: displayRow, col: displayCol }, flipped);
          const cell = positions[row][col];
          return (
            <ChessCell
              key={cell.cellName}
              cellInformation={cell}
              flipped={flipped}
              isLastMove={cell.cellName === lastMove?.from || cell.cellName === lastMove?.to}
              isDragOrigin={drag?.origin.row === row && drag?.origin.col === col}
            />
          );
        })
      )}

      {capturedGhost && ghostDisplay && (
        <div
          key={capturedGhost.id}
          className={styles.capturedGhost}
          style={{
            top: `${ghostDisplay.row * 12.5}%`,
            left: `${ghostDisplay.col * 12.5}%`,
            animationDuration: `${capturedGhost.duration}ms`,
          }}
          aria-hidden="true"
        >
          <img
            src={PIECE_ASSETS[capturedGhost.piece.substring(0, 2) as keyof typeof PIECE_ASSETS]}
            alt=""
            draggable={false}
          />
        </div>
      )}

      {drag && hoverDisplay && (
        <div
          className={styles.dropTarget}
          style={{ top: `${hoverDisplay.row * 12.5}%`, left: `${hoverDisplay.col * 12.5}%` }}
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

      {coronation.status && <CoronationPanel cords={coronation.coordinates} flipped={flipped} />}
      <GameOverModal closable={resultClosable} />
    </section>
  );
}
