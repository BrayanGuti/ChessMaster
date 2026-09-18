/// <reference lib="webworker" />
import { computeBestMove } from './jsChessEngineCore'
import type { OpponentLevel } from '../store/types'

export interface EngineWorkerRequest {
  id: number
  fen: string
  level: OpponentLevel
}

export type EngineWorkerResponse =
  | { id: number; move: string }
  | { id: number; error: string }

// Runs the search off the main thread, so the page stays responsive while the computer thinks
self.onmessage = (event: MessageEvent<EngineWorkerRequest>) => {
  const { id, fen, level } = event.data
  try {
    self.postMessage({ id, move: computeBestMove(fen, level) } satisfies EngineWorkerResponse)
  } catch (error) {
    self.postMessage({ id, error: String(error) } satisfies EngineWorkerResponse)
  }
}
