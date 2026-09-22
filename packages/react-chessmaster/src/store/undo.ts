import type { ChessBoardState } from './types'

/**
 * Index in `undoStack` of the position an undo goes back to, or null when there is nothing to
 * take back. Both undoMove and the undo button read this, so the button is enabled exactly when
 * a click would do something.
 *
 * - Local: the last move, one ply.
 * - Against the computer: the last position where it is the player's turn. Stopping on the
 *   computer's turn would just let it play again, so its reply is taken back too. It is derived
 *   from the turn rather than always taking back two: the player's own move can be the last ply
 *   (it mated, or the computer has not answered yet). When the player has black and the computer
 *   opened, the only entry is the computer's turn: there is nothing of the player's to take back.
 * - While the engine is thinking its answer is still coming, and taking back a move the player
 *   cannot see yet is confusing.
 */
export function getUndoIndex(
  state: Pick<ChessBoardState, 'undoStack' | 'gameMode' | 'playerColor' | 'aiThinking'>
): number | null {
  const { undoStack, gameMode, playerColor, aiThinking } = state
  if (aiThinking) return null

  if (gameMode !== 'computer') return undoStack.length > 0 ? undoStack.length - 1 : null

  for (let index = undoStack.length - 1; index >= 0; index--) {
    if (undoStack[index].turn === playerColor) return index
  }
  return null
}

export function canUndoMove(state: Parameters<typeof getUndoIndex>[0]): boolean {
  return getUndoIndex(state) !== null
}
