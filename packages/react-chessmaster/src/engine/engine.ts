import type { OpponentLevel } from '../store/types'

export interface EngineRequest {
  /** Current position in FEN */
  fen: string
  /** Legal moves of the side to move, in UCI notation; the engine must answer one of them */
  legalMoves: string[]
  level: OpponentLevel
}

/** Resolves the move to play, in UCI notation ("e2e4", "e7e8q"). */
export type ChessEngine = (request: EngineRequest) => Promise<string>

/**
 * PROVISIONAL engine (phase 4.5a): plays a random legal move, ignoring the level.
 * It exists to exercise the whole "vs Computer" flow; phase 4.5b replaces it with a real engine.
 */
export const randomEngine: ChessEngine = async ({ legalMoves }) => {
  if (legalMoves.length === 0) throw new Error('No legal moves to choose from')
  return legalMoves[Math.floor(Math.random() * legalMoves.length)]
}
