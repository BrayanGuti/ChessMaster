import { describe, it, expect } from 'vitest'
import { isCheckmate } from '../hooks/CheckMate'
import { startingPosition } from './fixtures'

describe('CheckMate — Check and Checkmate detection', () => {
  it('starting position is not checkmate', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status.isCheckmate).toBe(false)
    expect(status.check).toBe(false)
  })

  it('starting position has no attackers', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status.attackers).toBeNull()
  })

  it('checkStatus object has required properties', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status).toHaveProperty('isCheckmate')
    expect(status).toHaveProperty('check')
    expect(status).toHaveProperty('attackers')
    expect(status).toHaveProperty('colorOfCheck')
  })

  it('isCheckmate returns boolean for check property', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(typeof status.check).toBe('boolean')
  })

  it('isCheckmate returns boolean for isCheckmate property', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(typeof status.isCheckmate).toBe('boolean')
  })

  it('deep looking mode parameter does not throw error', () => {
    const board = startingPosition()
    expect(() => {
      isCheckmate(board, false)
      isCheckmate(board, true)
    }).not.toThrow()
  })

  it('protectors and blockers are arrays', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(Array.isArray(status.protectors)).toBe(true)
    expect(Array.isArray(status.blockers)).toBe(true)
    expect(Array.isArray(status.allDefenders)).toBe(true)
  })

  it('moves array is included in checkStatus', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(Array.isArray(status.moves)).toBe(true)
  })

  it('colorOfCheck is null in starting position', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(status.colorOfCheck).toBeNull()
  })

  it('numberOfAttackersIsOne is boolean', () => {
    const board = startingPosition()
    const status = isCheckmate(board, false)
    expect(typeof status.numberOfAttackersIsOne).toBe('boolean')
  })
})
