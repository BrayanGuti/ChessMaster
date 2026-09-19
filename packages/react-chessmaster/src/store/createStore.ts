/**
 * A minimal external store, read from React with useSyncExternalStore (useChessStore.ts).
 * It replaces zustand so the package has no runtime dependencies besides React.
 */

export type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void

export type StateCreator<T> = (set: SetState<T>, get: () => T) => T

export interface StoreApi<T> {
  getState: () => T
  setState: SetState<T>
  /** Calls the listener after every change; returns the unsubscribe function */
  subscribe: (listener: () => void) => () => void
}

export function createStore<T extends object>(initializer: StateCreator<T>): StoreApi<T> {
  const listeners = new Set<() => void>()
  let state: T

  const getState = () => state

  // Shallow merge, like React's class setState: every update produces a new state object
  const setState: SetState<T> = (partial) => {
    const update = typeof partial === 'function' ? partial(state) : partial
    state = { ...state, ...update }
    listeners.forEach(listener => listener())
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  state = initializer(setState, getState)
  return { getState, setState, subscribe }
}
