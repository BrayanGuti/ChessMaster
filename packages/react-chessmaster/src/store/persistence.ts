import type { StateStorage } from 'zustand/middleware'
import { createBoard } from '../hooks/StartGame'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { hasAnyLegalMove } from '../hooks/CheckMate'
import type { ChessBoardState, ChessDisplaySettings, ColorChoice, GameMode, MoveRecord, OpponentLevel, PieceColor } from './types'

export const STORAGE_PREFIX = 'react-chessmaster:'

/**
 * Bump when PersistedGame changes shape and teach migratePersistedGame the previous version.
 * v1: board, turn, history, promotion and layout. v2: + game mode, colors, level and Game panel.
 */
export const PERSIST_VERSION = 2

/** Maps the public `persist` prop to a localStorage key, or null when persistence is off. */
export function resolveStorageKey(persist: boolean | string | undefined): string | null {
  if (persist === true) return `${STORAGE_PREFIX}default`
  if (typeof persist === 'string' && persist.trim() !== '') return `${STORAGE_PREFIX}${persist.trim()}`
  return null
}

/**
 * localStorage that never throws: SSR (no window), private mode, blocked storage or a full
 * quota must never break a move. Unparseable values are removed and reported as missing.
 * (A parseable but invalid game is rejected by isPersistedGame and overwritten on the next move.)
 */
export const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name)
      if (raw === null) return null
      try {
        JSON.parse(raw)
      } catch {
        window.localStorage.removeItem(name)
        return null
      }
      return raw
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      // Storage unavailable or full: keep playing without saving
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Storage unavailable
    }
  },
}

/**
 * Minimal snapshot of a game. Everything else (attacked cells, check state, legal moves)
 * is derived from it on restore, which keeps the saved value small and free of the
 * cell-to-cell references in `isUnderAttackBy`.
 */
export interface PersistedGame {
  pieces: string[][]
  moved: boolean[][]
  turn: 'W' | 'B'
  moveHistory: MoveRecord[]
  coronation: ChessBoardState['coronation']
  displaySettings: ChessDisplaySettings
  gameMode: GameMode
  playerColor: PieceColor
  colorChoice: ColorChoice
  opponentLevel: OpponentLevel
}

export function toPersistedGame(state: ChessBoardState): PersistedGame {
  return {
    pieces: state.chessBoardpositions.map(row => row.map(cell => cell.piece)),
    moved: state.chessBoardpositions.map(row => row.map(cell => cell.hasMoved)),
    turn: state.turn,
    moveHistory: state.moveHistory,
    coronation: state.coronation,
    displaySettings: state.displaySettings,
    gameMode: state.gameMode,
    playerColor: state.playerColor,
    colorChoice: state.colorChoice,
    opponentLevel: state.opponentLevel,
  }
}

/**
 * Upgrades a save written by an older version to the current shape. The result is still
 * validated by isPersistedGame, so an unknown version simply yields something invalid.
 */
export function migratePersistedGame(persisted: unknown, version: number): unknown {
  if (version === 1 && isObject(persisted)) {
    // v1 games were always two players on one device, with no Game panel setting
    const displaySettings = isObject(persisted.displaySettings)
      ? { ...persisted.displaySettings, gamePanel: true }
      : persisted.displaySettings
    return { ...persisted, displaySettings, gameMode: 'local', playerColor: 'W', colorChoice: 'W', opponentLevel: 2 }
  }
  return persisted
}

const PIECE_PATTERN = /^([WB][PNBRQK][a-h][1-8])?$/

function isGrid<T>(value: unknown, isCell: (cell: unknown) => cell is T): value is T[][] {
  return Array.isArray(value)
    && value.length === 8
    && value.every(row => Array.isArray(row) && row.length === 8 && row.every(isCell))
}

const isPiece = (cell: unknown): cell is string => typeof cell === 'string' && PIECE_PATTERN.test(cell)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function isMoveRecord(value: unknown): value is MoveRecord {
  return isObject(value)
    && typeof value.piece === 'string'
    && typeof value.from === 'string'
    && typeof value.to === 'string'
    && (value.captured === null || typeof value.captured === 'string')
    && typeof value.notation === 'string'
    && typeof value.turnNumber === 'number'
}

/** Rejects anything that could not have been written by toPersistedGame (edited or corrupted storage). */
export function isPersistedGame(value: unknown): value is PersistedGame {
  if (!isObject(value)) return false
  const { pieces, moved, turn, moveHistory, coronation, displaySettings, gameMode, playerColor, colorChoice, opponentLevel } = value

  if (!isGrid(pieces, isPiece) || !isGrid(moved, isBoolean)) return false
  if (turn !== 'W' && turn !== 'B') return false
  if (!Array.isArray(moveHistory) || !moveHistory.every(isMoveRecord)) return false

  if (!isObject(coronation) || !isBoolean(coronation.status) || typeof coronation.cellName !== 'string') return false
  const coordinates = coronation.coordinates
  if (!isObject(coordinates) || typeof coordinates.col !== 'number' || typeof coordinates.row !== 'number') return false

  if (!isObject(displaySettings)) return false
  if (!isBoolean(displaySettings.playerBadges) || !isBoolean(displaySettings.capturedPieces) || !isBoolean(displaySettings.moveHistory) || !isBoolean(displaySettings.gamePanel)) return false

  if (gameMode !== 'local' && gameMode !== 'computer') return false
  if (playerColor !== 'W' && playerColor !== 'B') return false
  if (colorChoice !== 'W' && colorChoice !== 'B' && colorChoice !== 'random') return false
  if (![1, 2, 3, 4, 5].includes(opponentLevel as number)) return false

  // The move and check logic assumes exactly one king per side
  const flat = pieces.flat()
  const kings = (color: string) => flat.filter(piece => piece.startsWith(`${color}K`)).length
  return kings('W') === 1 && kings('B') === 1
}

/** Rebuilds the full store state from a snapshot, recomputing everything derived. */
export function restoreGame(saved: PersistedGame): Partial<ChessBoardState> {
  const board = createBoard(
    saved.pieces.map((row, rowIndex) =>
      row.map((piece, colIndex) => ({ piece, hasMoved: saved.moved[rowIndex][colIndex] }))
    )
  )
  const { newBoard, checkState } = markCellsUnderAttack(board)

  // Unlike updateCellsUnderAttack (which runs before changeTurn), `turn` here is already the
  // side to move. A pending promotion is recomputed by makeCoronation, so it is skipped.
  if (!saved.coronation.status && !checkState.check && !checkState.isCheckmate && !hasAnyLegalMove(newBoard, saved.turn)) {
    checkState.isStalemate = true
  }

  return {
    chessBoardpositions: newBoard,
    checkState,
    turn: saved.turn,
    moveHistory: saved.moveHistory,
    coronation: saved.coronation,
    displaySettings: saved.displaySettings,
    gameMode: saved.gameMode,
    playerColor: saved.playerColor,
    colorChoice: saved.colorChoice,
    opponentLevel: saved.opponentLevel,
    cellOfPieceSelected: null,
    soundToPlay: null,
    aiThinking: false,
  }
}
