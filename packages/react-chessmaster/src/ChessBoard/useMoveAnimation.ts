import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useChessStore, useChessStoreApi } from '../store/useChessStore';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { capturedSquare, getMoveSlides, shouldAnimate, slideDuration } from './moveAnimation';
import type { MoveSnapshot, Slide } from './moveAnimation';

// Above the pieces at rest (they share z-index 1, so one that slides past a later square would
// go underneath), below the piece being dragged (50)
const SLIDING_Z_INDEX = 10;
// easeOutCubic: leaves fast and settles gently on the square
const EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The store already holds the finished move, so the piece is sitting on its destination when
 * this runs: play it back from where it came from. The distance is measured between the two
 * squares as they are on screen, so a flipped board or any board size works without maths.
 */
function playSlide(board: HTMLElement, slide: Slide) {
  const fromCell = board.querySelector(`[data-chess-cell="${slide.from}"]`);
  const toCell = board.querySelector(`[data-chess-cell="${slide.to}"]`);
  const piece = toCell?.querySelector('img');
  if (!fromCell || !toCell || !piece || typeof piece.animate !== 'function') return;

  const from = fromCell.getBoundingClientRect();
  const to = toCell.getBoundingClientRect();
  const start = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
  // Runs on the compositor: it keeps moving smoothly even if the engine is busy on the main thread
  piece.animate(
    [
      { transform: start, zIndex: SLIDING_Z_INDEX },
      { transform: 'translate(0, 0)', zIndex: SLIDING_Z_INDEX },
    ],
    { duration: slideDuration(slide), easing: EASING }
  );
}

/** The piece a move just captured, kept on screen until the one that takes it arrives */
export interface CapturedGhost {
  /** Piece id ("BPd7") and the square it stood on ("d5") */
  piece: string;
  square: string;
  /** Same as the slide, so the ghost is gone when the capturing piece lands */
  duration: number;
  /** Changes with every move, so a capture right after another restarts the fade */
  id: number;
}

/**
 * Slides pieces to their new square when a move is played: by click, by the computer, castling
 * (king and rook). A move is only animated when it was just played (see shouldAnimate), and never
 * for people who ask for reduced motion.
 *
 * A dropped piece must not slide: the player already carried it to the square. The drag hook
 * calls `skipNextMove` right before it plays the move.
 *
 * The captured piece is already gone from the board when the mover starts to slide, so it is
 * returned as a ghost to draw under the mover for the length of the slide.
 */
export function useMoveAnimation(boardRef: RefObject<HTMLElement>, enabled: boolean) {
  const store = useChessStoreApi();
  const moveHistory = useChessStore((state) => state.moveHistory);
  const gameId = useChessStore((state) => state.gameId);

  const previous = useRef<MoveSnapshot | null>(null);
  // Move count whose slide is skipped; a count rather than a flag so it can never go stale
  const skippedMoveCount = useRef<number | null>(null);

  const [capturedGhost, setCapturedGhost] = useState<CapturedGhost | null>(null);
  const ghostTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(ghostTimer.current), []);

  const skipNextMove = useCallback(() => {
    skippedMoveCount.current = store.getState().moveHistory.length + 1;
  }, [store]);

  useIsomorphicLayoutEffect(() => {
    const next: MoveSnapshot = {
      lastMove: moveHistory[moveHistory.length - 1],
      moveCount: moveHistory.length,
      gameId,
    };
    const before = previous.current;
    previous.current = next;

    // Whatever was on its way out is over as soon as the position changes again
    window.clearTimeout(ghostTimer.current);
    setCapturedGhost(null);

    if (!enabled || !next.lastMove || !shouldAnimate(before, next)) return;
    if (skippedMoveCount.current === next.moveCount) return;

    const board = boardRef.current;
    if (!board || prefersReducedMotion()) return;
    const slides = getMoveSlides(next.lastMove);
    slides.forEach((slide) => playSlide(board, slide));

    const square = capturedSquare(next.lastMove, moveHistory[moveHistory.length - 2]);
    if (next.lastMove.captured && square) {
      const duration = slideDuration(slides[0]);
      setCapturedGhost({ piece: next.lastMove.captured, square, duration, id: next.moveCount });
      ghostTimer.current = window.setTimeout(() => setCapturedGhost(null), duration);
    }
  }, [moveHistory, gameId, enabled, boardRef]);

  return { skipNextMove, capturedGhost };
}
