import type { ChessEngine } from './engine'
import type { OpponentLevel } from '../store/types'
import type { EngineWorkerRequest, EngineWorkerResponse } from './jsChessEngine.worker'

type Pending = { resolve: (move: string) => void; reject: (error: Error) => void }

// One worker shared by every board on the page, created on the first request
let workerPromise: Promise<Worker | null> | null = null
let nextId = 0
const pending = new Map<number, Pending>()

function failPending(reason: string) {
  pending.forEach(({ reject }) => reject(new Error(reason)))
  pending.clear()
}

/**
 * The worker is inlined (`?worker&inline`): its code travels inside the package and starts from a
 * Blob URL, so it works with any bundler or dev server without resolving a file path. It lives in
 * a lazily imported chunk, so pages that never play the computer never download it.
 */
function getWorker(): Promise<Worker | null> {
  if (typeof Worker === 'undefined') return Promise.resolve(null)
  workerPromise ??= import('./jsChessEngine.worker?worker&inline')
    .then(({ default: EngineWorker }) => {
      const worker = new EngineWorker()
      worker.onmessage = (event: MessageEvent<EngineWorkerResponse>) => {
        const request = pending.get(event.data.id)
        if (!request) return
        pending.delete(event.data.id)
        if ('move' in event.data) request.resolve(event.data.move)
        else request.reject(new Error(event.data.error))
      }
      worker.onerror = (event) => {
        // The worker cannot run here (e.g. a Content Security Policy without `worker-src blob:`):
        // fail what is pending and use the main thread from now on
        event.preventDefault()
        worker.terminate()
        workerPromise = Promise.resolve(null)
        failPending('The engine worker failed')
      }
      return worker
    })
    .catch(() => null)
  return workerPromise
}

/** Same search on the main thread (it freezes the page while it runs, so only as a fallback). */
async function computeOnMainThread(fen: string, level: OpponentLevel): Promise<string> {
  const { computeBestMove } = await import('./jsChessEngineCore')
  return computeBestMove(fen, level)
}

/**
 * The built-in engine: js-chess-engine (MIT), running in a Web Worker so the UI never freezes,
 * even at level 5. Falls back to the main thread where workers are unavailable (tests, strict CSP).
 */
export const jsChessEngine: ChessEngine = async ({ fen, level }) => {
  const worker = await getWorker()
  if (!worker) return computeOnMainThread(fen, level)

  return new Promise<string>((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    worker.postMessage({ id, fen, level } satisfies EngineWorkerRequest)
  }).catch(() => computeOnMainThread(fen, level))
}
