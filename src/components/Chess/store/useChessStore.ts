import { useContext } from 'react'
import { useStore } from 'zustand'
import { ChessStoreContext } from './ChessGameProvider'
import { ChessBoardState } from './types'

export function useChessStore<T>(
  selector: (state: ChessBoardState) => T
): T {
  const store = useContext(ChessStoreContext)
  if (!store) {
    throw new Error('useChessStore must be used within ChessGameProvider')
  }
  return useStore(store, selector)
}
