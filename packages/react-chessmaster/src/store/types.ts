import { StoreApi } from 'zustand'

export interface ChessBoardCell {
    piece: string
    YouCanMoveHere: boolean
    isUnderAttackBy: ChessBoardCell[]
    hasMoved: boolean
    cellName: 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' |
              'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
              'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
              'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
              'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
              'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
              'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
              'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1'

    coordinates: { col: number, row: number }
}

export type CheckStatus = {
  protectors: Array<{attacker: ChessBoardCell, cellToAttack: ChessBoardCell[]}>,
  blockers: Array<{blocker: ChessBoardCell, cellToDefend: ChessBoardCell[]}>,
  allDefenders: Array<{protector: ChessBoardCell, cellToProtect: ChessBoardCell[]}>,
  moves: Array<{ row: number, col: number }>,
  isCheckmate: boolean,
  isStalemate: boolean,
  check: boolean,
  attackers: {path: ChessBoardCell[], attackerCell: ChessBoardCell} | null,
  numberOfAttackersIsOne: boolean,
  colorOfCheck: string | null
}

export interface ChessBoardState {
    chessBoardpositions: ChessBoardPositions;
    cellOfPieceSelected: ChessBoardCell | null;
    checkState: CheckStatus;
    coronation: {
        status: boolean;
        coordinates: { col: number; row: number };
        cellName: string;
    }
    turn: 'W' | 'B';

    soundToPlay: string | null;

    moveHistory: MoveRecord[];

    /** Panels shown around the board; toggled from the settings menu */
    displaySettings: ChessDisplaySettings;

    /** Increments on every resetGame(), so the UI can tell a new game started */
    gameId: number;

    setDisplaySettings: (update: (previous: ChessDisplaySettings) => ChessDisplaySettings) => void;

    setSoundToPlay: (sound: string | null) => void;

    addMoveRecord: (record: MoveRecord) => void;

    selectPieceToMove: (cellInformation: ChessBoardCell) => void;

    clickCell: (cellInformation: ChessBoardCell) => void;

    movePiece: (selectedCoordinates: { col: number; row: number }) => void;

    showAvailableMoves: (coordsOfAvailableMoves: { col: number; row: number }[]) => void;

    removeAvailableMoves: () => void;

    updateCellsUnderAttack: () => void;

    isCoronation: (destinyCoords: { col: number; row: number }) => void;

    makeCoronation: (piece: string) => void;

    changeTurn: () => void;

    resetGame: () => void;

    handleCellClickWhenCheck: (cell: ChessBoardCell, cellOfPieceSelected: ChessBoardCell | null) => void;

    selectPieceToDefendCheck: (defenders: {protector: ChessBoardCell, cellToProtect: ChessBoardCell[]}) => void;

    isProtectingCheck: (coords: {col: number; row: number;}[], cell: ChessBoardCell) => {col: number; row: number;}[];
}

export type ChessBoardPositions = Array<Array<ChessBoardCell>>

export type ChessStoreApi = StoreApi<ChessBoardState>

export interface GameEndResult {
  winner: 'W' | 'B' | null;
  reason: 'checkmate' | 'stalemate' | null;
}

export interface MoveRecord {
  piece: string;
  from: string;
  to: string;
  captured: string | null;
  notation: string;
  turnNumber: number;
}

export interface ChessBoardTheme {
  lightSquare?: string;
  darkSquare?: string;
  /** Selected square and last move tint */
  highlight?: string;
  /** UI accent: active player, switches, last move in the history */
  accent?: string;
  /** King in check glow */
  check?: string;
  /** Legal move dots and capture rings */
  moveHint?: string;
}

export interface ChessDisplaySettings {
  playerBadges: boolean;
  capturedPieces: boolean;
  moveHistory: boolean;
}

export interface ChessBoardProps {
  theme?: ChessBoardTheme;
  showMoveHistory?: boolean;
  showCapturedPieces?: boolean;
  showPlayerBadges?: boolean;
  /** Shows the gear menu that lets the player toggle the panels above at runtime. Default: true */
  showSettings?: boolean;
  /**
   * Saves the game (and the panel layout) in localStorage so it survives reloads.
   * `true` uses the key "react-chess:default"; a string uses "react-chess:<string>",
   * so each board on a page needs its own string. Read once, when the board mounts.
   */
  persist?: boolean | string;
  onGameEnd?: (result: GameEndResult) => void;
  onMove?: (move: MoveRecord) => void;
  /** Called when the player starts a new game (settings menu, game over panel or error screen) */
  onReset?: () => void;
  className?: string;
}
