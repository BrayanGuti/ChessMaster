# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
npm run dev       # Start dev server (Vite) on http://localhost:5173
npm run build     # Compile TypeScript and build for production
npm run lint      # Run ESLint on all TypeScript/TSX files
npm run preview   # Preview the production build locally
npm run deploy    # Deploy to GitHub Pages (requires npm run build first)
```

## Project Overview

**ChessMaster** is a local two-player chess game built with React + TypeScript + Vite, using Zustand for state management. The app implements full chess rules including special moves (castling, en passant, promotion) and game states (check, checkmate).

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
src/pages/
├── HomePage/          # Main chess game interface
│   ├── Header/        # Top banner with title/info
│   ├── Main/          # Contains ChessBoard component
│   └── Footer/        # Bottom section with credits
├── ServicesPage/      # Secondary page (placeholder)
└── Error404Page/      # 404 error handling
```

### Chess Game System
```
src/components/Chess/
├── index.ts           # Public API (ChessBoard + public types). Import the component only from here.
├── ChessBoard/        # Public <ChessBoard> (layout, panels, sounds) + Board.tsx (8x8 grid) + drag logic
├── ChessCell/         # Individual cell component with click handlers
├── ChessPiece/        # Piece SVG renderer with position styling
├── CoronationPanel/   # Modal for pawn promotion (choosing Queen/Rook/Bishop/Knight)
├── ChessSettings/     # Gear menu to toggle panels at runtime
├── PlayerBadge/ CapturedPieces/ MoveHistory/ GameOverModal/ ErrorBoundary/
├── assets/            # Pieces, sounds and avatars, imported as ES modules (pieces.ts, sounds.ts, avatars.ts)
├── __tests__/         # Vitest tests for the chess logic
├── hooks/             # Core chess logic (NOT React hooks, utility functions)
│   ├── StartGame.ts           # Initialize board with starting positions
│   ├── CalculateMoves.ts      # Determine legal moves for a piece (accounts for piece type)
│   ├── Castling.ts            # Handle castling move validation and execution
│   ├── CheckMate.ts           # Detect checkmate conditions
│   ├── ChessCellCharacteristics.ts  # Identify cell properties (color, coordinates)
│   └── MarkCellsUnderAttack.ts      # Calculate attacked cells & check state
└── store/
    ├── types.ts               # All types, including the public ChessBoardProps
    ├── createChessStore.ts    # Zustand store factory (one store per board instance)
    ├── ChessGameProvider.tsx  # Context provider that creates the store for each <ChessBoard>
    └── useChessStore.ts       # Selector hook used by the components
```

The Chess folder is meant to become a standalone npm package: it must not import anything from outside `src/components/Chess` (no site CSS, no `public/`, no site-only dependencies like `lucide-react`).

### Game State Management (Zustand Store)

Each `<ChessBoard>` gets its own store from `createChessStore()` via `ChessGameProvider`, so several boards can coexist. Key state fields:

- **chessBoardpositions**: 8×8 array of cells with piece positions, coordinates, and move markers
- **turn**: Current player ('W' for white, 'B' for black)
- **checkState**: Object tracking check/checkmate status, attackers, defenders, blocking moves
- **cellOfPieceSelected**: Currently selected piece (for UI highlighting available moves)
- **coronation**: State for pawn promotion modal (whether active, coordinates, which pawn)
- **soundToPlay**: Audio trigger for move/check/capture sounds

Key methods: `clickCell()`, `selectPieceToMove()`, `movePiece()`, `makeCoronation()`, `updateCellsUnderAttack()`, `changeTurn()`

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
- **SVG pieces** in `src/components/Chess/assets/Pieces/` (named like WP.svg, BK.svg for piece notation)
- **Sound effects** in `src/components/Chess/assets/Sound/` (move, capture, castling, check, game-over variations)
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
- **CSS structure**: Chess components use CSS Modules (`*.module.css`); all theme tokens (`--light-square`, `--accent`, `--text`, ...) are defined on `.chessGame` in `ChessBoard.module.css`. Site pages use global styles in `src/index.css`
- **Tests**: `npm test` (Vitest) covers the chess logic in `src/components/Chess/__tests__/`; verify UI changes manually in the dev server
- **No persistence**: Game state is not saved to localStorage; reloading resets the board
- Comments in store note future features: persist middleware and confetti animations
