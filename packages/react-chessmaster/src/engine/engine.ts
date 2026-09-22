import type { OpponentLevel } from '../store/types'

export interface EngineRequest {
  /** Current position in FEN */
  fen: string
  /** Legal moves of the side to move, in UCI notation; the engine must answer one of them */
  legalMoves: string[]
  level: OpponentLevel
}

/**
 * Resolves the move to play, in UCI notation ("e2e4", "e7e8q").
 * Implementations: jsChessEngine (built-in, see jsChessEngine.ts) and the host's
 * `opponent.getMove` (wrapped in useComputerOpponent).
 */
export type ChessEngine = (request: EngineRequest) => Promise<string>
