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

    /** 'local': two people on one device. 'computer': one person against the engine */
    gameMode: GameMode;

    /** The human's color in 'computer' mode ('random' is resolved when the game starts) */
    playerColor: PieceColor;

    /** What the player picked for their color, kept so a rematch can re-roll 'random' */
    colorChoice: ColorChoice;

    /** Engine strength in 'computer' mode */
    opponentLevel: OpponentLevel;

    /** The engine is computing its move (not persisted) */
    aiThinking: boolean;

    setDisplaySettings: (update: (previous: ChessDisplaySettings) => ChessDisplaySettings) => void;

    /** Starts a new game with this configuration; the previous game is discarded */
    startGame: (config: GameConfig) => void;

    setAiThinking: (thinking: boolean) => void;

    /** Legal moves of the side to move, in UCI notation ("e2e4", "e7e8q") */
    legalMoves: () => string[];

    /** Plays a move given in UCI notation for the side to move. Returns false if it is not legal */
    applyMove: (uci: string) => boolean;

    /** The current position in FEN, as chess engines expect it */
    toFEN: () => string;

    setSoundToPlay: (sound: string | null) => void;

    addMoveRecord: (record: MoveRecord) => void;

    selectPieceToMove: (cellInformation: ChessBoardCell) => void;

    clickCell: (cellInformation: ChessBoardCell) => void;

    movePiece: (selectedCoordinates: { col: number; row: number }) => void;

    showAvailableMoves: (coordsOfAvailableMoves: { col: number; row: number }[]) => void;

    removeAvailableMoves: () => void;

    /** Recomputes attacks and check/stalemate. `sideToMove` defaults to the opponent of `turn`
     *  (movePiece calls it before changeTurn) */
    updateCellsUnderAttack: (sideToMove?: PieceColor) => void;

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

export type PieceColor = 'W' | 'B';

export type GameMode = 'local' | 'computer';

export type ColorChoice = PieceColor | 'random';

export type OpponentLevel = 1 | 2 | 3 | 4 | 5;

export interface GameConfig {
  mode: GameMode;
  /** The human's color in 'computer' mode */
  colorChoice: ColorChoice;
  level: OpponentLevel;
}

export interface GameEndResult {
  winner: 'W' | 'B' | null;
  reason: 'checkmate' | 'stalemate' | null;
  mode: GameMode;
  /** The human's color in 'computer' mode; null in 'local' mode */
  playerColor: PieceColor | null;
}

export interface OpponentOptions {
  /** The computer's color. Default: 'B' */
  color?: ColorChoice;
  /** Strength from 1 (weakest) to 5. Default: 2 */
  level?: OpponentLevel;
  /**
   * Your own engine: receives the position in FEN and resolves a move in UCI notation
   * ("e2e4", "e7e8q"). Not used yet: the built-in engine plays every move for now.
   */
  getMove?: (fen: string) => Promise<string>;
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
  gamePanel: boolean;
}

export interface ChessBoardProps {
  theme?: ChessBoardTheme;
  /**
   * Colors of the panels, menu and dialogs around the board: 'dark' (default) for pages with a
   * dark background, 'light' for light ones. The board squares come from `theme`.
   */
  colorScheme?: 'dark' | 'light';
  showMoveHistory?: boolean;
  showCapturedPieces?: boolean;
  showPlayerBadges?: boolean;
  /** Shows the gear menu that lets the player toggle the panels above at runtime. Default: true */
  showSettings?: boolean;
  /**
   * The "Game" panel to pick the mode, color and level and start a new game. Default: true.
   * `false` removes it completely (it cannot be turned back on from the settings menu).
   */
  showGamePanel?: boolean;
  /** Game modes the player can choose from. Default: both. With one mode the selector is hidden */
  modes?: GameMode[];
  /** Mode of the first game. Default: the first entry of `modes` */
  defaultMode?: GameMode;
  /** Initial settings of the computer opponent (the player can change them in the Game panel) */
  opponent?: OpponentOptions;
  /**
   * Saves the game (and the panel layout) in localStorage so it survives reloads.
   * `true` uses the key "react-chessmaster:default"; a string uses "react-chessmaster:<string>",
   * so each board on a page needs its own string. Read once, when the board mounts.
   */
  persist?: boolean | string;
  onGameEnd?: (result: GameEndResult) => void;
  onMove?: (move: MoveRecord) => void;
  /** Called when the player starts a new game (settings menu, game over panel or error screen) */
  onReset?: () => void;
  className?: string;
}
