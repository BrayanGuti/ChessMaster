# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

All commands run from the repo root (npm workspaces):

```bash
npm install       # Installs everything and links packages/react-chessmaster into apps/web
npm run dev       # Site dev server (Vite) on http://localhost:5173
npm run build     # Type-checks the package, then type-checks and builds the site
npm run lint      # ESLint on the whole monorepo
npm test          # Vitest for the package (watch mode; `npm test -- --run` for a single run)
npm run preview   # Preview the site's production build
npm run deploy    # Deploy the site to GitHub Pages
```

## Monorepo Layout

```
packages/react-chessmaster/   # The npm package @brayanguti/react-chessmaster (the Chess component)
apps/web/                     # The ChessMaster website: demo + docs, consumes the package
```

- `apps/web` imports the component as `@brayanguti/react-chessmaster`; npm workspaces symlink it. The package's `exports` has a custom `source` condition pointing at `src/index.ts`, enabled only in `apps/web` (`resolve.conditions` in its vite.config.ts and `customConditions` in tsconfig.app.json). So the site always uses the package source with HMR and never needs `dist/`; npm users get `dist/`.
- Package build (`npm run build:package`): Vite library mode in `packages/react-chessmaster/vite.config.ts` → `dist/index.js` (ESM, starts with `"use client"` and imports `./style.css`), `dist/style.css`, and `dist/index.d.ts` (vite-plugin-dts, rolled up to the public API). react and zustand are external; images and sounds are inlined as data URIs. CSS module classes are named `rcm_<local>_<hash>`.
- The package is `"private": true` until it is ready to publish, to prevent accidental `npm publish`.
- Each workspace declares every tool its own scripts use (e.g. `typescript` and `vite` in both). Vercel builds with Root Directory `apps/web` and installs only that workspace's dependencies, so anything declared only in the root `package.json` (which holds just ESLint) does not exist there.

## Project Overview

**ChessMaster** is a chess game built with React + TypeScript + Vite, using Zustand for state management: two players on one device, or one player against the computer. It implements castling, promotion, check, checkmate and stalemate. **En passant is NOT implemented yet** (the two `SpecialMoves` tests named after it only check that pawns exist); it is the first step of phase 4.5b.

**Tech Stack:**
- React 18 with TypeScript
- Vite (fast build tool)
- Zustand (lightweight state management)
- React Router DOM (page routing)
- ESLint + TypeScript ESLint (code quality)
- Deployed on GitHub Pages and Vercel

## Architecture

### Page Structure
```
apps/web/src/pages/
├── HomePage/          # Main chess game interface
│   ├── Header/        # Top banner with title/info
│   ├── Main/          # Contains ChessBoard component
│   └── Footer/        # Bottom section with credits
├── ServicesPage/      # Secondary page (placeholder)
└── Error404Page/      # 404 error handling
```

### Chess Game System
```
packages/react-chessmaster/src/
├── index.ts           # Public API (ChessBoard + public types). Import the component only from here.
├── ChessBoard/        # Public <ChessBoard> (layout, panels, sounds) + Board.tsx (8x8 grid) + drag logic
│                      #   orientation.ts: board flip (useBoardFlipped, toDisplay board<->screen coords)
├── ChessCell/         # Individual cell component with click handlers
├── ChessPiece/        # Piece SVG renderer with position styling
├── CoronationPanel/   # Modal for pawn promotion (choosing Queen/Rook/Bishop/Knight)
├── ChessSettings/     # Gear menu to toggle panels at runtime
├── GamePanel/         # "Game" panel: mode (2 players / vs Computer), human color, level, New game/Play
├── engine/            # ChessEngine interface + provisional randomEngine; useComputerOpponent plays the computer's turns
├── PlayerBadge/ CapturedPieces/ MoveHistory/ GameOverModal/ ErrorBoundary/
├── assets/            # Pieces, sounds and avatars, imported as ES modules (pieces.ts, sounds.ts, avatars.ts)
├── __tests__/         # Vitest tests for the chess logic
├── hooks/             # Core chess logic (NOT React hooks, utility functions)
│   ├── StartGame.ts           # Initialize board with starting positions
│   ├── CalculateMoves.ts      # Determine legal moves for a piece (accounts for piece type)
│   ├── Castling.ts            # Handle castling move validation and execution
│   ├── CheckMate.ts           # Detect checkmate conditions
│   ├── ChessCellCharacteristics.ts  # Identify cell properties (color, coordinates)
│   ├── MarkCellsUnderAttack.ts      # Calculate attacked cells & check state
│   ├── LegalMoves.ts          # getLegalMoves (UCI) by simulating each move with wouldLeaveKingInCheck; parseUci
│   └── Fen.ts                 # toFEN (castling from hasMoved; en passant always "-")
└── store/
    ├── types.ts               # All types, including the public ChessBoardProps
    ├── createChessStore.ts    # Zustand store factory (one store per board instance)
    ├── ChessGameProvider.tsx  # Context provider that creates the store for each <ChessBoard>
    └── useChessStore.ts       # Selector hook used by the components
```

The package must stay self-contained and lightweight: it must not import anything from outside `packages/react-chessmaster` (no site CSS, no `apps/web/public/`), and its only runtime dependencies are `react` (peer) and `zustand`. No icon or UI libraries (e.g. `lucide-react`): icons are inline SVGs, assets live in `src/assets/`.

### Game State Management (Zustand Store)

Each `<ChessBoard>` gets its own store from `createChessStore()` via `ChessGameProvider`, so several boards can coexist. Key state fields:

- **chessBoardpositions**: 8×8 array of cells with piece positions, coordinates, and move markers
- **turn**: Current player ('W' for white, 'B' for black)
- **checkState**: Object tracking check/checkmate status, attackers, defenders, blocking moves
- **cellOfPieceSelected**: Currently selected piece (for UI highlighting available moves)
- **coronation**: State for pawn promotion modal (whether active, coordinates, which pawn)
- **soundToPlay**: Audio trigger for move/check/capture sounds
- **gameMode** ('local' | 'computer'), **playerColor** (the human's color), **colorChoice** ('W' | 'B' | 'random', kept for rematches), **opponentLevel** (1–5), **aiThinking**

Key methods: `clickCell()`, `selectPieceToMove()`, `movePiece()`, `makeCoronation()`, `updateCellsUnderAttack(sideToMove?)`, `changeTurn()`, `startGame(config)`, `resetGame()` (rematch: keeps the configuration), `legalMoves()`, `applyMove(uci)`, `toFEN()`

### Game Modes (vs Computer)
- `clickCell` ignores input on the computer's turn; the drag path starts with `clickCell`, so it is covered too. The engine plays through `applyMove`, which reuses `movePiece` and completes promotions immediately.
- The board is flipped when the human plays black against the computer (`ChessBoard/orientation.ts`); `Board`, `useBoardDrag`, `ChessCell` corners, `CoronationPanel` and the badge order all go through it.
- `useComputerOpponent` runs on the computer's turn (also right after mount, so a game reloaded on its turn continues), waits at least `MIN_THINKING_MS`, and drops the answer if the game changed meanwhile. Engines implement `ChessEngine` in `engine/engine.ts`; `randomEngine` is PROVISIONAL (phase 4.5b replaces it).
- A 'random' color is drawn in `ChessGameProvider`'s mount effect, not while rendering, so server and client render the same board.

## Key Implementation Details

### Move Calculation
- `CalculateMoves.ts` computes all possible moves for a piece without checking if they expose the king to check
- The store's `isProtectingCheck()` filters moves to only legal ones (those that don't leave king in check)
- Available moves are marked in board state with `YouCanMoveHere: true`

### Check & Checkmate Detection
- `MarkCellsUnderAttack.ts` scans the board to find all attacked cells and evaluate king safety
- Runs after every move (`updateCellsUnderAttack()`)
- Stores attacker info (piece, path of attack) to constrain moves when in check

### Piece Notation
Pieces are encoded as 4-character strings: `[Color][Type][File][Rank]`
- Color: 'W' (white) or 'B' (black)
- Type: 'P' (pawn), 'N' (knight), 'B' (bishop), 'R' (rook), 'Q' (queen), 'K' (king)
- File & Rank: e.g., 'e4', 'h8'
- Example: "WPe2" = white pawn at e2

### Assets
- **SVG pieces** in `packages/react-chessmaster/src/assets/Pieces/` (named like WP.svg, BK.svg for piece notation)
- **Sound effects** in `packages/react-chessmaster/src/assets/Sound/` (move, capture, castling, check, game-over variations)
- Pieces are licensed/sourced separately and styled via CSS positioning

## Git Commit Policy

- Claude must **never** create git commits on its own, under any circumstance. Only the user (Brayan) creates commits.
- After finishing a feature or a meaningful chunk of work, if Claude judges it prudent, it should proactively tell the user that this looks like a good moment to commit.
- When suggesting a commit, Claude must propose a commit message the user can use.
  - For small/trivial changes, the suggested commit message alone is enough — no extra description is needed.
  - For larger or more complex changes, Claude should also include a brief description of what changed and why, alongside the commit message.

## Development Notes

- **ESLint rules** focus on React hooks (dependency arrays) and React Refresh for hot module reloading
- **TypeScript strict mode** is enabled; all pieces of state have defined types in `store/types.ts`
- **CSS structure**: Chess components use CSS Modules (`*.module.css`); all theme tokens (`--light-square`, `--accent`, `--text`, `--panel`, `--popover`, `--hover`, `--track`, ...) are defined on `.chessGame` in `ChessBoard.module.css` with dark-scheme values, and `.light` (prop `colorScheme="light"`) redefines them for light pages. Never hardcode UI colors in component CSS: use a token, or the component becomes unreadable on one of the two backgrounds. Site pages use global styles in `apps/web/src/index.css`
- **Tests**: `npm test` (Vitest) covers the chess logic in `packages/react-chessmaster/src/__tests__/`; verify UI changes manually in the dev server
- **Persistence (opt-in)**: the `persist` prop saves each board to localStorage under `react-chessmaster:<key>` (see `store/persistence.ts`). Only a minimal snapshot is stored (pieces, hasMoved, turn, history, promotion, layout, game mode/colors/level); everything derived is rebuilt with `markCellsUnderAttack` on restore. When that snapshot changes shape, bump `PERSIST_VERSION` (now 2) and teach `migratePersistedGame` to upgrade the previous version
- **Build**: `npm run build` runs `tsc -b` — a plain `tsc` checks nothing because the root tsconfig only has project references
