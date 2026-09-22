import { useChessStore } from '../store/useChessStore';
import type { Coords } from '../store/types';

/**
 * The board is seen from the human's side: flipped when they play black against the computer.
 * In two-player mode it always stays with white at the bottom.
 */
export function useBoardFlipped() {
  return useChessStore((state) => state.gameMode === 'computer' && state.playerColor === 'B');
}

/**
 * Converts between board coordinates (row 0 = rank 8) and on-screen position (row 0 = top).
 * Flipping mirrors both axes, so the same function converts in either direction.
 */
export function toDisplay({ row, col }: Coords, flipped: boolean): Coords {
  return flipped ? { row: 7 - row, col: 7 - col } : { row, col };
}
