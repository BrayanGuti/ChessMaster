import { useEffect, useMemo, useRef } from 'react'
import { useChessStore, useChessStoreApi } from '../store/useChessStore'
import type { ChessEngine } from './engine'
import { jsChessEngine } from './jsChessEngine'

/** Minimum time the computer "thinks", so its reply never lands instantly after the player's move */
export const MIN_THINKING_MS = 500

/**
 * Plays the computer's moves in 'computer' mode. Runs whenever it becomes the engine's turn,
 * including right after mount, so a game reloaded on the engine's turn continues by itself.
 * If the game changes while the engine is thinking (new game, unmount), the answer is dropped.
 *
 * `getMove` (the `opponent.getMove` prop) replaces the built-in engine with the host's own.
 */
export function useComputerOpponent(getMove?: (fen: string) => Promise<string>) {
  // The latest getMove without restarting the search when the host passes a new inline function
  const getMoveRef = useRef(getMove)
  getMoveRef.current = getMove
  const hasCustomEngine = Boolean(getMove)
  const engine = useMemo<ChessEngine>(
    () => (hasCustomEngine ? ({ fen }) => getMoveRef.current!(fen) : jsChessEngine),
    [hasCustomEngine]
  )

  const store = useChessStoreApi()
  const gameMode = useChessStore((state) => state.gameMode)
  const playerColor = useChessStore((state) => state.playerColor)
  const turn = useChessStore((state) => state.turn)
  const gameId = useChessStore((state) => state.gameId)
  const moveCount = useChessStore((state) => state.moveHistory.length)
  const promotionPending = useChessStore((state) => state.coronation.status)
  const isGameOver = useChessStore((state) => state.checkState.isCheckmate || state.checkState.isStalemate)

  useEffect(() => {
    if (gameMode !== 'computer' || turn === playerColor || isGameOver || promotionPending) return

    let cancelled = false
    const { toFEN, legalMoves, opponentLevel, setAiThinking } = store.getState()
    const moves = legalMoves()
    if (moves.length === 0) return

    setAiThinking(true)
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, MIN_THINKING_MS))

    Promise.all([engine({ fen: toFEN(), legalMoves: moves, level: opponentLevel }), minimumDelay])
      .then(([move]) => move)
      .catch((error) => {
        console.warn('[react-chessmaster] The engine failed; playing a random legal move instead.', error)
        return moves[Math.floor(Math.random() * moves.length)]
      })
      .then((move) => {
        if (cancelled) return
        const state = store.getState()
        // The game moved on while thinking (new game, restored position...)
        if (state.gameId !== gameId || state.turn !== turn || state.moveHistory.length !== moveCount) return
        if (!state.applyMove(move)) {
          console.warn(`[react-chessmaster] The engine answered an illegal move (${move}); playing a random legal move instead.`)
          state.applyMove(moves[Math.floor(Math.random() * moves.length)])
        }
      })
      .finally(() => {
        if (!cancelled) store.getState().setAiThinking(false)
      })

    return () => {
      cancelled = true
      store.getState().setAiThinking(false)
    }
  }, [store, engine, gameMode, playerColor, turn, gameId, moveCount, promotionPending, isGameOver])
}
