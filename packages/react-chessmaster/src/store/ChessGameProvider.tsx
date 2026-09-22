import { createContext, useEffect, useRef, useState, ReactNode } from 'react'
import { createChessStore, hydrateChessStore, resolveColorChoice } from './createChessStore'
import { ChessDisplaySettings, ChessStoreApi, GameConfig } from './types'
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect'

export const ChessStoreContext = createContext<ChessStoreApi | null>(null)

// How many mounted boards use each storage key, to warn about boards overwriting each other
const mountedStorageKeys = new Map<string, number>()

export function ChessGameProvider({
  children,
  storageKey = null,
  initialDisplaySettings,
  initialGameConfig,
}: {
  children: ReactNode
  /** Read once on mount; changing it later has no effect */
  storageKey?: string | null
  initialDisplaySettings?: ChessDisplaySettings
  initialGameConfig?: GameConfig
}) {
  const storeRef = useRef<ChessStoreApi | null>(null)

  if (!storeRef.current) {
    storeRef.current = createChessStore({ storageKey, initialDisplaySettings, initialGameConfig })
  }

  const keyRef = useRef(storageKey)

  // With persistence, the board renders only once the saved game is loaded: the server and the
  // first client render stay identical (no hydration mismatch), and since localStorage is
  // synchronous the empty render is never painted. Children mount with the restored state.
  const [ready, setReady] = useState(!keyRef.current)

  useIsomorphicLayoutEffect(() => {
    const store = storeRef.current
    if (!store) return
    if (keyRef.current) hydrateChessStore(store)

    // A 'random' color is drawn here, on the client: drawing it while rendering would give the
    // server and the browser different boards (one flipped, one not). A restored game in
    // progress keeps the color it was being played with.
    const { colorChoice, moveHistory } = store.getState()
    if (colorChoice === 'random' && moveHistory.length === 0) {
      store.setState({ playerColor: resolveColorChoice('random') })
    }

    if (keyRef.current) setReady(true)
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
