import { create, StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { startGame } from '../hooks/StartGame'
import { markCellsUnderAttack } from '../hooks/MarkCellsUnderAttack'
import { applyGameEnd, hasAnyLegalMove } from '../hooks/CheckMate'
import { isCastling } from '../hooks/Castling'
import { getLegalMoves, getLegalMovesFrom, parseUci } from '../hooks/LegalMoves'
import { getEnPassantCapturedSquare, getEnPassantTarget } from '../hooks/EnPassant'
import { toFEN } from '../hooks/Fen'
import { ChessBoardState, ChessDisplaySettings, ChessStoreApi, ColorChoice, GameConfig, MoveRecord, CheckStatus, PieceColor } from './types'
import { PERSIST_VERSION, PersistedGame, isPersistedGame, migratePersistedGame, restoreGame, safeLocalStorage, toPersistedGame } from './persistence'

const INITIAL_CHECK_STATE: CheckStatus = {
  protectors: [],
  blockers: [],
  allDefenders: [],
  moves: [],
  isCheckmate: false,
  isStalemate: false,
  check: false,
  attackers: null,
  numberOfAttackersIsOne: false,
  colorOfCheck: null
}

const DEFAULT_DISPLAY_SETTINGS: ChessDisplaySettings = {
  playerBadges: false,
  capturedPieces: false,
  moveHistory: false,
  gamePanel: true
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  mode: 'local',
  colorChoice: 'W',
  level: 2
}

export interface ChessStoreOptions {
  /** localStorage key; when set, the game is saved on every change */
  storageKey?: string | null
  /** Panels shown on a fresh game (a saved game keeps its own) */
  initialDisplaySettings?: ChessDisplaySettings
  /** Mode, human color and level of the first game (a saved game keeps its own) */
  initialGameConfig?: GameConfig
}

type PersistableStore = ChessStoreApi & { persist?: { rehydrate: () => Promise<void> | void } }

export function resolveColorChoice(choice: ColorChoice): PieceColor {
  if (choice === 'random') return Math.random() < 0.5 ? 'W' : 'B'
  return choice
}

export function createChessStore({ storageKey, initialDisplaySettings, initialGameConfig }: ChessStoreOptions = {}): ChessStoreApi {
  const initializer = createGameState(
    initialDisplaySettings ?? DEFAULT_DISPLAY_SETTINGS,
    initialGameConfig ?? DEFAULT_GAME_CONFIG
  )
  if (!storageKey) return create<ChessBoardState>()(initializer)

  return create<ChessBoardState>()(
    persist(initializer, {
      name: storageKey,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => safeLocalStorage),
      // Loaded from ChessGameProvider after mount, so server and first client render match
      skipHydration: true,
      partialize: (state): PersistedGame => toPersistedGame(state),
      // Older formats are upgraded; anything unrecognized is discarded by merge()
      migrate: (persisted, version) => migratePersistedGame(persisted, version) as PersistedGame,
      merge: (persisted, current) =>
        isPersistedGame(persisted) ? { ...current, ...restoreGame(persisted) } : current
    })
  )
}

/** Loads the saved game into a store created with a storageKey; no-op otherwise. */
export function hydrateChessStore(store: ChessStoreApi) {
  void (store as PersistableStore).persist?.rehydrate()
}

/** A game at the starting position (everything a new game resets). */
function freshGame() {
  return {
    chessBoardpositions: startGame(),
    turn: 'W' as const,
    checkState: { ...INITIAL_CHECK_STATE },
    cellOfPieceSelected: null,
    coronation: { status: false, coordinates: { col: 0, row: 0 }, cellName: '' },
    soundToPlay: null,
    moveHistory: [],
    aiThinking: false
  }
}

function createGameState(initialDisplaySettings: ChessDisplaySettings, initialGameConfig: GameConfig): StateCreator<ChessBoardState> {
  return (set, get) => ({
      ...freshGame(),
      displaySettings: { ...initialDisplaySettings },
      gameId: 0,
      gameMode: initialGameConfig.mode,
      colorChoice: initialGameConfig.colorChoice,
      // Deterministic so server and client render the same board; ChessGameProvider draws 'random' after mount
      playerColor: initialGameConfig.colorChoice === 'random' ? 'W' : initialGameConfig.colorChoice,
      opponentLevel: initialGameConfig.level,
      setDisplaySettings: (update) => set(state => ({ displaySettings: update(state.displaySettings) })),

      setSoundToPlay: (sound) => set({ soundToPlay: sound }),

      setAiThinking: (thinking) => set({ aiThinking: thinking }),

      addMoveRecord: (record) => set(state => ({ moveHistory: [...state.moveHistory, record] })),

      // Keeps displaySettings and the game configuration: a new game should not change the player's choices
      resetGame: () => set(state => ({
          ...freshGame(),
          // A rematch re-rolls a 'random' color
          playerColor: resolveColorChoice(state.colorChoice),
          gameId: state.gameId + 1
      })),

      startGame: ({ mode, colorChoice, level }) => set(state => ({
          ...freshGame(),
          gameMode: mode,
          colorChoice,
          playerColor: resolveColorChoice(colorChoice),
          opponentLevel: level,
          gameId: state.gameId + 1
      })),

      legalMoves: () => {
          const { chessBoardpositions, turn, checkState, coronation, moveHistory } = get()
          if (coronation.status || checkState.isCheckmate || checkState.isStalemate) return []
          return getLegalMoves(chessBoardpositions, turn, getEnPassantTarget(moveHistory)).map(move => move.uci)
      },

      // Plays through the same path as a human move (movePiece), so castling, captures, history,
      // sounds and check detection behave identically; a promotion is completed right away.
      applyMove: (uci) => {
          const parsed = parseUci(uci)
          const { chessBoardpositions, turn } = get()
          if (!parsed || !get().legalMoves().includes(uci.trim().toLowerCase())) {
              // A promotion given without its piece ("e7e8") is accepted as a queen
              if (parsed && !parsed.promotion && get().legalMoves().includes(`${uci.trim().toLowerCase()}q`)) {
                  return get().applyMove(`${uci.trim().toLowerCase()}q`)
              }
              return false
          }

          const origin = chessBoardpositions[parsed.from.row][parsed.from.col]
          get().removeAvailableMoves()
          set({ cellOfPieceSelected: origin })
          get().showAvailableMoves([parsed.to])
          get().movePiece(parsed.to)

          if (get().coronation.status) {
              get().makeCoronation(turn + (parsed.promotion ?? 'q').toUpperCase())
          }
          return true
      },

      toFEN: () => {
          const { chessBoardpositions, turn, moveHistory } = get()
          return toFEN(chessBoardpositions, turn, moveHistory, getEnPassantTarget(moveHistory))
      },

      clickCell: (cellInformation) => {
          const { cellOfPieceSelected, coronation, checkState, gameMode, playerColor, turn } = get()

          // Against the computer, the human only plays their own color (applyMove plays the engine's moves)
          if(gameMode === 'computer' && turn !== playerColor) return
          if(coronation.status) return
          if(checkState.isCheckmate || checkState.isStalemate) return

          // In check the same rules apply: selectPieceToMove only offers moves that get out of it
          if(cellInformation.piece === '' && cellOfPieceSelected === null) return

          if(cellOfPieceSelected === null && cellInformation.piece[0] === get().turn){
              get().selectPieceToMove(cellInformation)
              return
          }
          if (cellInformation.piece === cellOfPieceSelected?.piece) {
              get().removeAvailableMoves()
              set({ cellOfPieceSelected: null })
              return
          }

          if(cellInformation.piece[0] === cellOfPieceSelected?.piece[0]){
              get().removeAvailableMoves()
              get().selectPieceToMove(cellInformation)
              return
          }

          get().movePiece(cellInformation.coordinates)
      },

      // Move hints come from the same legality rule the engine uses (getLegalMovesFrom), so a
      // human and the computer can always play exactly the same moves
      selectPieceToMove: (cellInformation) => {
          const { chessBoardpositions, moveHistory } = get()
          set({ cellOfPieceSelected: cellInformation})
          const moves = getLegalMovesFrom(chessBoardpositions, cellInformation, getEnPassantTarget(moveHistory))
          get().showAvailableMoves(moves.map(move => move.to))
      },

      makeCoronation: (piece: string) => {
          const { coronation } = get()
          const { chessBoardpositions } = get()
          const newChessBoardPositions = chessBoardpositions.map(row => {
              return row.map(cell => {
                  if(cell.coordinates.col === coronation.coordinates.col && cell.coordinates.row === coronation.coordinates.row){
                      return {
                          ...cell,
                          piece: piece + coronation.cellName
                      }
                  }
                  return cell
              })
          })
          set({ chessBoardpositions: newChessBoardPositions, coronation: { status: false, coordinates: { col: 0, row: 0 }, cellName:''} })
          get().removeAvailableMoves()
          // movePiece already switched the turn: the side to move now is the promoting side's opponent
          get().updateCellsUnderAttack(get().turn)
      },

      movePiece: (destinyCoords) => {
          const { cellOfPieceSelected, chessBoardpositions, moveHistory } = get()

          if (!cellOfPieceSelected) return

          const targetCell = chessBoardpositions[destinyCoords.row][destinyCoords.col]
          if (targetCell?.YouCanMoveHere) {
              // En passant: the captured pawn stands beside the capturing pawn, not on the target square
              const enPassantSquare = getEnPassantCapturedSquare(
                  chessBoardpositions, cellOfPieceSelected.coordinates, destinyCoords, getEnPassantTarget(moveHistory)
              )
              const capturedPiece = enPassantSquare
                  ? chessBoardpositions[enPassantSquare.row][enPassantSquare.col].piece
                  : targetCell.piece || null

              const boardWithCastling = isCastling(
                  cellOfPieceSelected.coordinates,
                  destinyCoords,
                  chessBoardpositions,
                  cellOfPieceSelected.piece[0]
              )

              const updatedBoard = boardWithCastling || chessBoardpositions
              get().isCoronation(destinyCoords)

              const newChessBoardPositions = updatedBoard.map(row =>
                  row.map(cell => {
                      if (cell.coordinates.row === destinyCoords.row && cell.coordinates.col === destinyCoords.col) {
                          return { ...cell, piece: cellOfPieceSelected.piece }
                      }
                      if (cell.coordinates.row === cellOfPieceSelected.coordinates.row && cell.coordinates.col === cellOfPieceSelected.coordinates.col) {
                          return { ...cell, piece: '', hasMoved: true }
                      }
                      if (enPassantSquare && cell.coordinates.row === enPassantSquare.row && cell.coordinates.col === enPassantSquare.col) {
                          return { ...cell, piece: '' }
                      }
                      return cell
                  })
              )

              const record: MoveRecord = {
                  piece: cellOfPieceSelected.piece,
                  from: cellOfPieceSelected.cellName,
                  to: targetCell.cellName,
                  captured: capturedPiece,
                  notation: '',
                  turnNumber: Math.floor(moveHistory.length / 2) + 1
              }
              const opponent = cellOfPieceSelected.piece[0] === 'W' ? 'B' : 'W'
              const { newBoard: nextBoard, checkState: nextCheckState } = markCellsUnderAttack(newChessBoardPositions)
              const gives = {
                  check: nextCheckState.check,
                  isCheckmate: nextCheckState.check && !hasAnyLegalMove(nextBoard, opponent, getEnPassantTarget([record]))
              }
              record.notation = buildNotation(cellOfPieceSelected.piece, targetCell.cellName, capturedPiece, gives)

              set({ chessBoardpositions: newChessBoardPositions, cellOfPieceSelected: null })
              get().addMoveRecord(record)
              get().removeAvailableMoves()
              get().updateCellsUnderAttack()
              get().changeTurn()
          }
      },

      changeTurn: () => {
          const { turn } = get()
          set({ turn: turn === 'W' ? 'B' : 'W' })
      },

      showAvailableMoves: (coordsOfAvailableMoves) => {
          const { chessBoardpositions } = get()

          const newChessBoardPositions = chessBoardpositions.map(row => {
              return row.map(cell => {
                  if(coordsOfAvailableMoves.some(coords => coords.col === cell.coordinates.col && coords.row === cell.coordinates.row)){
                      return {
                          ...cell,
                          YouCanMoveHere: true
                      }
                  }
                  return {
                      ...cell,
                      YouCanMoveHere: false
                  }
              })
          })
          set({ chessBoardpositions: newChessBoardPositions })
      },

      isCoronation: (destinyCoords) => {
          const { cellOfPieceSelected, turn } = get()
          const pieceSelected = cellOfPieceSelected?.piece[1]
          const coronationRow = (turn === 'W') ? 0 : 7

          if (pieceSelected === 'P' && destinyCoords.row === coronationRow) {
              const cellName = cellOfPieceSelected ? `${cellOfPieceSelected.piece[2] + cellOfPieceSelected.piece[3]}` : ''
              set({
                  coronation: {
                      status: true,
                      coordinates: destinyCoords,
                      cellName
                  }
              })
          }
      },

      removeAvailableMoves: () => {
          const { chessBoardpositions } = get()

          const newChessBoardPositions = chessBoardpositions.map(row => {
              return row.map(cell => {
                  return {
                      ...cell,
                      YouCanMoveHere: false
                  }
              })
          })
          set({ chessBoardpositions: newChessBoardPositions })
      },

      updateCellsUnderAttack: (sideToMove) => {
          const { newBoard, checkState } = markCellsUnderAttack(get().chessBoardpositions)
          const nextTurnColor = sideToMove ?? (get().turn === 'W' ? 'B' : 'W')
          applyGameEnd(newBoard, checkState, nextTurnColor, getEnPassantTarget(get().moveHistory), get().coronation.status)

          set({ chessBoardpositions: newBoard })
          set({ checkState })

          if(checkState.isCheckmate || checkState.isStalemate){
              get().setSoundToPlay('game-over')
              return
          }

          if(!checkState.check){
              get().setSoundToPlay(randomSound('move-1', 'move-2'))
              return
          }

          get().setSoundToPlay('check')
      }
  })
}

function randomSound(sound1: string, sound2: string) {
    return Math.random() < 0.5 ? sound1 : sound2
}

function buildNotation(
    piece: string,
    to: string,
    captured: string | null,
    checkState: { check: boolean; isCheckmate: boolean }
): string {
    const pieceType = piece[1]
    const originFile = piece[2]
    const prefix = pieceType !== 'P' ? pieceType : (captured ? originFile : '')
    const captureSymbol = captured ? 'x' : ''
    const suffix = checkState.isCheckmate ? '#' : checkState.check ? '+' : ''

    return `${prefix}${captureSymbol}${to}${suffix}`
}
