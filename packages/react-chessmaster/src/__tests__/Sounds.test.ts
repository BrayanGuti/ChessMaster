import { describe, it, expect } from 'vitest'
import { createChessStore } from '../store/createChessStore'

/** Plays the moves (UCI) and returns the sound queued by the last one. */
function soundAfter(...moves: string[]) {
  const store = createChessStore()
  for (const move of moves) {
    if (!store.getState().applyMove(move)) throw new Error(`Illegal move ${move}`)
  }
  return store.getState().soundToPlay
}

describe('move sounds', () => {
  it('plays a plain move sound', () => {
    expect(['move-1', 'move-2']).toContain(soundAfter('e2e4'))
  })

  it('plays the capture sound', () => {
    expect(soundAfter('e2e4', 'd7d5', 'e4d5')).toBe('capture')
  })

  it('plays the capture sound for en passant', () => {
    expect(soundAfter('e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6')).toBe('capture')
  })

  it('plays the castling sound', () => {
    expect(soundAfter('e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'e1g1')).toBe('castling')
  })

  it('check takes precedence over a capture', () => {
    expect(soundAfter('e2e4', 'f7f6', 'd1h5')).toBe('check')
    expect(soundAfter('e2e4', 'e7e5', 'd1h5', 'b8c6', 'h5e5')).toBe('check')
  })

  it('plays the game-over sound on checkmate', () => {
    expect(soundAfter('f2f3', 'e7e5', 'g2g4', 'd8h4')).toBe('game-over')
  })
})
