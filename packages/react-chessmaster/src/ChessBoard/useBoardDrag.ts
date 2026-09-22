import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useChessStoreApi } from '../store/useChessStore';
import type { Coords } from '../store/types';
import { toDisplay } from './orientation';

// Distance (px) the pointer must travel before a press becomes a drag
const DRAG_THRESHOLD = 4;

interface DragSession {
  pointerId: number;
  origin: Coords;
  startX: number;
  startY: number;
  /** The piece was already selected before this press: a plain click deselects it */
  wasSelected: boolean;
  isDragging: boolean;
}

export interface DragState {
  piece: string;
  origin: Coords;
}

/**
 * Click-or-drag interaction for the board, in the style of chess.com:
 * - Press on your own piece selects it and shows its moves.
 * - Dragging past a small threshold lifts the piece, which follows the pointer.
 * - Releasing on a legal square moves; anywhere else snaps back and keeps the selection.
 * - A plain click keeps the classic click-to-select / click-to-move behaviour.
 *
 * `onDropMove` is called right before a dropped piece is moved.
 *
 * Uses Pointer Events (mouse, touch and pen) with delegation on the board element,
 * and moves the ghost piece through its style so dragging never re-renders React.
 */
export function useBoardDrag(boardRef: RefObject<HTMLElement>, flipped = false, onDropMove?: () => void) {
  const store = useChessStoreApi();
  const sessionRef = useRef<DragSession | null>(null);
  const ghostElementRef = useRef<HTMLElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverCell, setHoverCell] = useState<Coords | null>(null);

  // Board coordinates (not screen position) of the square under the pointer
  const cellFromPoint = useCallback(
    (clientX: number, clientY: number): Coords | null => {
      const board = boardRef.current;
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      return toDisplay({ col, row }, flipped);
    },
    [boardRef, flipped]
  );

  const positionGhost = useCallback(() => {
    const board = boardRef.current;
    const ghost = ghostElementRef.current;
    if (!board || !ghost) return;
    const rect = board.getBoundingClientRect();
    const { x, y } = pointerRef.current;
    // Scale last, inside the same transform: the standalone `scale` property would also scale the translation
    ghost.style.transform = `translate(${x - rect.left}px, ${y - rect.top}px) translate(-50%, -50%) scale(var(--ghost-scale, 1))`;
  }, [boardRef]);

  // Callback ref: the ghost mounts after the drag starts, so it is placed as soon as it exists
  const ghostRef = useCallback(
    (element: HTMLElement | null) => {
      ghostElementRef.current = element;
      positionGhost();
    },
    [positionGhost]
  );

  const endSession = useCallback(() => {
    const session = sessionRef.current;
    const board = boardRef.current;
    if (session && board?.hasPointerCapture(session.pointerId)) {
      board.releasePointerCapture(session.pointerId);
    }
    sessionRef.current = null;
    setDrag(null);
    setHoverCell(null);
  }, [boardRef]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0 || sessionRef.current) return;
      // Only squares start interactions; overlays (promotion, game over) handle their own clicks
      if (!(event.target as HTMLElement).closest('[data-chess-cell]')) return;

      const coords = cellFromPoint(event.clientX, event.clientY);
      if (!coords) return;

      const state = store.getState();
      const cell = state.chessBoardpositions[coords.row][coords.col];
      const wasSelected =
        state.cellOfPieceSelected !== null &&
        state.cellOfPieceSelected.cellName === cell.cellName;

      // Pressing the selected piece again must not deselect it yet: it may be a drag
      if (!wasSelected) state.clickCell(cell);

      const selected = store.getState().cellOfPieceSelected;
      if (!selected || selected.cellName !== cell.cellName) return;

      event.preventDefault();
      try {
        // Keeps receiving moves even when the pointer leaves the board
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer already released (or synthetic): the drag still works while over the board
      }
      sessionRef.current = {
        pointerId: event.pointerId,
        origin: coords,
        startX: event.clientX,
        startY: event.clientY,
        wasSelected,
        isDragging: false,
      };
    },
    [cellFromPoint, store]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;

      if (!session.isDragging) {
        const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
        if (distance < DRAG_THRESHOLD) return;

        session.isDragging = true;
        const { chessBoardpositions } = store.getState();
        setDrag({
          piece: chessBoardpositions[session.origin.row][session.origin.col].piece,
          origin: session.origin,
        });
      }

      pointerRef.current = { x: event.clientX, y: event.clientY };
      positionGhost();

      const coords = cellFromPoint(event.clientX, event.clientY);
      setHoverCell((previous) =>
        previous?.col === coords?.col && previous?.row === coords?.row ? previous : coords
      );
    },
    [cellFromPoint, positionGhost, store]
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;

      const state = store.getState();

      if (!session.isDragging) {
        // Plain click on the piece that was already selected: toggle it off
        if (session.wasSelected) {
          state.clickCell(state.chessBoardpositions[session.origin.row][session.origin.col]);
        }
        endSession();
        return;
      }

      const target = cellFromPoint(event.clientX, event.clientY);
      endSession();

      if (!target) return;
      const targetCell = state.chessBoardpositions[target.row][target.col];
      if (targetCell.YouCanMoveHere) {
        // The piece is already where the player carried it: it must not slide in from its origin
        onDropMove?.();
        state.movePiece(target);
      }
    },
    [cellFromPoint, endSession, onDropMove, store]
  );

  return {
    drag,
    hoverCell,
    ghostRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: endSession,
      onLostPointerCapture: endSession,
    },
  };
}
