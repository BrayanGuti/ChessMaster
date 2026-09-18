import { ai } from 'js-chess-engine'
import type { OpponentLevel } from '../store/types'

/**
 * Move variety per level, in centipawns: the engine picks at random among the moves scoring within
 * this margin of its best one. Lower levels vary more (friendlier, less predictable); level 5
 * always plays its best move. Kept small at the top: in the opening most moves score within a few
 * centipawns, so 15 already let level 4 play 2.Na3.
 */
const RANDOMNESS: Record<OpponentLevel, number> = { 1: 80, 2: 50, 3: 20, 4: 5, 5: 0 }

/**
 * Best move for the side to move in `fen`, in UCI notation ("e2e4").
 * js-chess-engine (MIT) levels 1–5 map one to one to ours. It always promotes to a queen and
 * answers without the promotion piece ("e7e8"), which applyMove reads as a queen.
 */
export function computeBestMove(fen: string, level: OpponentLevel): string {
  const { move } = ai(fen, { level, play: false, randomness: RANDOMNESS[level] })
  const [from, to] = Object.entries(move)[0] ?? []
  if (!from || !to) throw new Error(`js-chess-engine returned no move for ${fen}`)
  return `${from}${to}`.toLowerCase()
}
