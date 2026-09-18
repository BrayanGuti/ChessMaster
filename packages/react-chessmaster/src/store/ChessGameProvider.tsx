import { createContext, useEffect, useLayoutEffect, useRef, useState, ReactNode } from 'react'
import { createChessStore, hydrateChessStore } from './createChessStore'
import { ChessDisplaySettings, ChessStoreApi } from './types'

export const ChessStoreContext = createContext<ChessStoreApi | null>(null)

// useLayoutEffect warns during server rendering; on the server nothing runs anyway
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// How many mounted boards use each storage key, to warn about boards overwriting each other
const mountedStorageKeys = new Map<string, number>()

export function ChessGameProvider({
  children,
  storageKey = null,
  initialDisplaySettings,
}: {
  children: ReactNode
  /** Read once on mount; changing it later has no effect */
  storageKey?: string | null
  initialDisplaySettings?: ChessDisplaySettings
}) {
  const storeRef = useRef<ChessStoreApi | null>(null)

  if (!storeRef.current) {
    storeRef.current = createChessStore({ storageKey, initialDisplaySettings })
  }

  const keyRef = useRef(storageKey)

  // With persistence, the board renders only once the saved game is loaded: the server and the
  // first client render stay identical (no hydration mismatch), and since localStorage is
  // synchronous the empty render is never painted. Children mount with the restored state.
  const [ready, setReady] = useState(!keyRef.current)

  useIsomorphicLayoutEffect(() => {
    if (!storeRef.current || !keyRef.current) return
    hydrateChessStore(storeRef.current)
    setReady(true)
  }, [])

  useEffect(() => {
    const key = keyRef.current
    if (!key) return

    const count = (mountedStorageKeys.get(key) ?? 0) + 1
    mountedStorageKeys.set(key, count)
    if (count > 1) {
      console.warn(
        `[react-chessmaster] ${count} boards share the storage key "${key}" and will overwrite each other's saved game. ` +
          'Give each board its own string, e.g. persist="game-1".'
      )
    }

    return () => {
      const remaining = (mountedStorageKeys.get(key) ?? 1) - 1
      if (remaining > 0) mountedStorageKeys.set(key, remaining)
      else mountedStorageKeys.delete(key)
    }
  }, [])

  return (
    <ChessStoreContext.Provider value={storeRef.current}>
      {ready ? children : null}
    </ChessStoreContext.Provider>
  )
}
