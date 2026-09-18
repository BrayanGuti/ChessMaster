import { MoveRecord } from './types'

export type CapturablePieceType = 'P' | 'N' | 'B' | 'R' | 'Q'

export interface CapturedPieces {
  W: Partial<Record<CapturablePieceType, number>>
  B: Partial<Record<CapturablePieceType, number>>
}

export function deriveCapturedPieces(moveHistory: MoveRecord[]): CapturedPieces {
  const captured: CapturedPieces = { W: {}, B: {} }

  moveHistory.forEach(record => {
    if (!record.captured) return

    const capturedColor = record.captured[0] as 'W' | 'B'
    const capturedType = record.captured[1] as CapturablePieceType
    const capturedBy = capturedColor === 'W' ? 'B' : 'W'

    captured[capturedBy][capturedType] = (captured[capturedBy][capturedType] || 0) + 1
  })

  return captured
}
