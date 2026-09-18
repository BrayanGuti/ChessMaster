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

/** Direct access to the store instance, for event handlers that need fresh state via getState() */
export function useChessStoreApi() {
  const store = useContext(ChessStoreContext)
  if (!store) {
    throw new Error('useChessStoreApi must be used within ChessGameProvider')
  }
  return store
}
