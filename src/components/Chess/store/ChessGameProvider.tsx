import React, { createContext, useRef, ReactNode } from 'react'
import { createChessStore } from './createChessStore'
import { ChessStoreApi } from './types'

export const ChessStoreContext = createContext<ChessStoreApi | null>(null)

export function ChessGameProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ChessStoreApi | null>(null)

  if (!storeRef.current) {
    storeRef.current = createChessStore()
  }

  return (
    <ChessStoreContext.Provider value={storeRef.current}>
      {children}
    </ChessStoreContext.Provider>
  )
}
