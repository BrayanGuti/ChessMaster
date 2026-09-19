import { useContext, useSyncExternalStore } from 'react'
import { ChessStoreContext } from './ChessGameProvider'
import { ChessBoardState } from './types'

/**
 * Subscribes the component to a slice of the board state. The selector must return a primitive
 * or a reference already in the state (never a new object or array built on each call): the
 * component re-renders whenever the result changes by identity, so a fresh object each time
 * would re-render forever.
 */
export function useChessStore<T>(
  selector: (state: ChessBoardState) => T
): T {
  const store = useContext(ChessStoreContext)
  if (!store) {
    throw new Error('useChessStore must be used within ChessGameProvider')
  }
  const getSnapshot = () => selector(store.getState())
  // The same snapshot on the server, so server rendering (e.g. Next.js) works
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}

/** Direct access to the store instance, for event handlers that need fresh state via getState() */
export function useChessStoreApi() {
  const store = useContext(ChessStoreContext)
  if (!store) {
    throw new Error('useChessStoreApi must be used within ChessGameProvider')
  }
  return store
}
