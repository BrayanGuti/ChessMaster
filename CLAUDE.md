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
- Package build (`npm run build:package`): Vite library mode in `packages/react-chessmaster/vite.config.ts` → `dist/index.js` (ESM, starts with `"use client"` and imports `./style.css`), `dist/style.css`, and `dist/index.d.ts` (vite-plugin-dts, rolled up to the public API). only react is external: js-chess-engine is bundled (and minified) into the two lazy chunks that use it, the inlined worker and the main-thread fallback, so the package has no runtime dependencies; only the entry chunk gets the banner; images and sounds are inlined as data URIs. CSS module classes are named `rcm_<local>_<hash>`.
- The package is ready to publish (`0.1.0`, `publishConfig.access: public`, MIT `LICENSE`, npm-facing `README.md`). Brayan publishes it himself (`npm publish -w packages/react-chessmaster`); Claude never runs `npm publish`. Bump `version` before each release.
- `docs/media/` holds the README screenshots and GIFs. The root README links them relatively; the package README uses absolute `raw.githubusercontent.com/.../master/docs/media/...` URLs, because npmjs.com does not resolve relative image paths (so they appear once pushed to `master`).
- Each workspace declares every tool its own scripts use (e.g. `typescript` and `vite` in both). Vercel builds with Root Directory `apps/web` and installs only that workspace's dependencies, so anything declared only in the root `package.json` (which holds just ESLint) does not exist there.

## Project Overview

**ChessMaster** is a chess game built with React + TypeScript + Vite, with a small built-in store read through React's `useSyncExternalStore`: two players on one device, or one player against the computer. It implements the full rules: castling, en passant, promotion, check, checkmate and stalemate (not the fifty-move rule or threefold repetition).

**Tech Stack:**
- React 18 with TypeScript
- Vite (fast build tool)
- Own minimal store (`store/createStore.ts`) + `useSyncExternalStore`; no state library
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
├── ChessSettings/     # Settings bar: light/dark switch + undo + gear menu to toggle panels at runtime
├── GamePanel/         # "Game" panel: mode (vs Computer / 2 players, computer by default), human color, level, New game/Play
├── engine/            # ChessEngine interface; jsChessEngine (built-in, Web Worker); useComputerOpponent plays the computer's turns
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
│   ├── EnPassant.ts           # en passant square from the last move; square of the pawn it captures
│   └── Fen.ts                 # toFEN (castling from hasMoved; en passant square from the last move)
└── store/
    ├── types.ts               # All types, including the public ChessBoardProps
    ├── createStore.ts         # Minimal external store (getState/setState/subscribe)
    ├── createChessStore.ts    # Chess store factory (one store per board instance) + opt-in saving
    ├── ChessGameProvider.tsx  # Context provider that creates the store for each <ChessBoard>
    └── useChessStore.ts       # Selector hook used by the components
```

The package must stay self-contained and lightweight: it must not import anything from outside `packages/react-chessmaster` (no site CSS, no `apps/web/public/`), and it has no runtime dependencies besides `react` (peer); keep it that way unless there is a strong reason. js-chess-engine (MIT, the built-in computer opponent) is a devDependency bundled into the build; its notice is in `THIRD_PARTY_LICENSES.md`, shipped in the package. `apps/web` declares js-chess-engine too, because it compiles the package source and Vercel installs only its own dependencies. Never add a GPL engine (e.g. Stockfish) to the package: it would force the whole package to be GPL. No icon or UI libraries (e.g. `lucide-react`): icons are inline SVGs, assets live in `src/assets/`.

### Game State Management (Store)

Each `<ChessBoard>` gets its own store from `createChessStore()` via `ChessGameProvider`, so several boards can coexist. Key state fields:

- **chessBoardpositions**: 8×8 array of cells with piece positions, coordinates, and move markers
- **turn**: Current player ('W' for white, 'B' for black)
- **checkState**: Object tracking check/checkmate status, attackers, defenders, blocking moves
- **cellOfPieceSelected**: Currently selected piece (for UI highlighting available moves)
- **coronation**: State for pawn promotion modal (whether active, coordinates, which pawn)
- **soundToPlay**: Audio trigger for move/check/capture sounds
- **gameMode** ('local' | 'computer'), **playerColor** (the human's color), **colorChoice** ('W' | 'B' | 'random', kept for rematches), **opponentLevel** (1–5), **aiThinking**
- **undoStack**: the position before each move played, one entry per ply (see Undo below)

Key methods: `clickCell()`, `selectPieceToMove()`, `movePiece()`, `makeCoronation()`, `updateCellsUnderAttack(sideToMove?)`, `changeTurn()`, `startGame(config)`, `resetGame()` (rematch: keeps the configuration), `undoMove()`, `legalMoves()`, `applyMove(uci)`, `toFEN()`

### Undo
`movePiece` pushes `toPositionSnapshot(state)` onto `undoStack` before it changes anything, and `undoMove()` pops it and feeds it through `restorePosition()` — the same rebuild a reload uses. It restores rather than reverses the move because `MoveRecord` keeps no `hasMoved` flags, and castling rights are read from them (`Fen.ts`): a reversal would silently lose them. In 'computer' mode it keeps popping until it is the human's turn again, so the engine does not simply replay; it is derived from the turn, not a fixed two plies, because the human's own move can be the last one. It applies everything in **one** `set()`: every `set` notifies, and `useComputerOpponent` reacts to any state where it is the engine's turn. It never bumps `gameId` (that would fire `onReset`). The stack is persisted, so a saved game can still be taken back after a reload.

### Game Modes (vs Computer)
- `clickCell` ignores input on the computer's turn; the drag path starts with `clickCell`, so it is covered too. The engine plays through `applyMove`, which reuses `movePiece` and completes promotions immediately.
- The board is flipped when the human plays black against the computer (`ChessBoard/orientation.ts`); `Board`, `useBoardDrag`, `ChessCell` corners, `CoronationPanel` and the badge order all go through it.
- `useComputerOpponent` runs on the computer's turn (also right after mount, so a game reloaded on its turn continues), waits at least `MIN_THINKING_MS`, and drops the answer if the game changed meanwhile. Engines implement `ChessEngine` in `engine/engine.ts`: the built-in `jsChessEngine`, or the host's `opponent.getMove(fen)` (an illegal answer or a rejected promise falls back to a random legal move with a console warning). `randomEngine` only exists for tests.
- `jsChessEngine` runs js-chess-engine in a Web Worker imported as `?worker&inline` from a dynamic `import()`: the worker code is a base64 string in a lazy chunk and starts from a Blob URL, so it works in any host bundler (Vite, webpack/Next) with no file paths to resolve, and pages that never play the computer never download it. Where workers are unavailable (jsdom tests, a CSP without `worker-src blob:`), it falls back to the main thread. Levels 1–5 map one to one to js-chess-engine's; `RANDOMNESS` in `jsChessEngineCore.ts` sets the move variety per level.
- A 'random' color is drawn in `ChessGameProvider`'s mount effect, not while rendering, so server and client render the same board.

## Key Implementation Details

### Move Calculation (one legality rule for humans and the engine)
- `CalculateMoves.ts` computes candidate moves for a piece (pseudo-legal: king safety not checked yet)
- `LegalMoves.ts` keeps a candidate only if `wouldLeaveKingInCheck` (in `CheckMate.ts`) says the mover's own king is safe after playing it on a copy of the board. `selectPieceToMove` (human move hints), `legalMoves()`/`applyMove()` (engine) and `hasAnyLegalMove` all go through it, so the UI and the computer can play exactly the same moves
- `wouldLeaveKingInCheck` looks at the mover's own king explicitly (a move may also check the other king)
- Available moves are marked in board state with `YouCanMoveHere: true`

### En passant
- `hooks/EnPassant.ts`: the en passant square is derived from the last `MoveRecord` (a pawn that just advanced two squares), so it needs no extra state and survives saved games
- `movePiece` removes the captured pawn (beside the capturing pawn, not on the target square); `toFEN` reports the square

### Check, Checkmate & Stalemate
- `MarkCellsUnderAttack.ts` marks attacked cells (`isUnderAttackBy`) and reports check after every move (`updateCellsUnderAttack()`)
- Mate and stalemate are decided by `applyGameEnd` (in `CheckMate.ts`): no legal move for the side to move means checkmate if in check, stalemate otherwise. It overrides `isCheckmate`'s own heuristic verdict (protectors/blockers), which does not know about en passant. With a promotion pending it waits for `makeCoronation`

### Piece Notation
Pieces are encoded as 4-character strings: `[Color][Type][File][Rank]`
- Color: 'W' (white) or 'B' (black)
- Type: 'P' (pawn), 'N' (knight), 'B' (bishop), 'R' (rook), 'Q' (queen), 'K' (king)
- File & Rank: e.g., 'e4', 'h8'
- Example: "WPe2" = white pawn at e2

### Assets
- **SVG pieces** in `packages/react-chessmaster/src/assets/Pieces/` (named like WP.svg, BK.svg for piece notation): public domain, from kmar/chess_svg_piece_sets, optimized with SVGO and given `viewBox="0 0 64 64"` (without it they get clipped instead of scaled)
- **Sound effects** in `packages/react-chessmaster/src/assets/Sound/`: `move-1`/`move-2` (random), `capture` (also en passant), `castling`, `check`, `game-over`, chosen in that priority by `updateCellsUnderAttack` (game over > check > capture > castling > move). Edited by Brayan from Pixabay recordings
- **Icons** (gear, sun, moon, random) are inline SVGs with `currentColor`, CC BY from SVG Repo. The undo arrow was drawn for this package: it has no third-party rights, and THIRD_PARTY_LICENSES.md says so rather than listing it
- **Avatars** (`PlayerBadge`): white knight (`WN`) and black bishop (`BB`) piece images for the players, `Avatars/ai-chip.svg` (CC BY) for the computer in any color; always on the light square frame so they read on any page background
- Every third-party asset or code must be credited in `packages/react-chessmaster/THIRD_PARTY_LICENSES.md` (shipped in the package). Only free licenses that do not force copyleft on the package (CC0, MIT, BSD, CC BY; never GPL or CC BY-SA)

## Git Commit Policy

- Claude must **never** create git commits on its own, under any circumstance. Only the user (Brayan) creates commits.
- After finishing a feature or a meaningful chunk of work, if Claude judges it prudent, it should proactively tell the user that this looks like a good moment to commit.
- When suggesting a commit, Claude must propose a commit message the user can use.
  - For small/trivial changes, the suggested commit message alone is enough — no extra description is needed.
  - For larger or more complex changes, Claude should also include a brief description of what changed and why, alongside the commit message.

## UI Changes Must Be Verified Responsive

After any non-trivial UI change, Claude must **look at the result** before calling it done — not just check that it compiles and the tests pass. Run `npm run dev` and screenshot the page with headless Chromium at, at least, one width per class:

| Class | Widths to check |
| --- | --- |
| Phones | 360×740, 390×844 |
| Tablets | 768×1024 (portrait), 1024×768 (landscape) |
| Laptops | 1366×768, 1440×900 |
| Desktops | 1920×1080, 2560×1440 |

Check **both schemes** (the light/dark switch in the settings bar, not the OS preference: the board follows the `colorScheme` prop and that button, never `prefers-color-scheme`), and check the states a screenshot of a fresh page does not show — disabled controls, panels that only appear mid-game, long names that could overflow.

What to look for: nothing overlapping, nothing clipped or overflowing horizontally, tap targets still reachable, and text still legible on both backgrounds. The board's own layout is driven by **container queries** (`chess-root`, `chess-stage`), not viewport media queries, so it reflows by the size of its container: a change can be fine on the site and broken in a narrow host, and the single-column reflow happens at `chess-stage` ≤ 640px. Attach a representative set of screenshots to the PR.

## Development Notes

- **ESLint rules** focus on React hooks (dependency arrays) and React Refresh for hot module reloading
- **TypeScript strict mode** is enabled; all pieces of state have defined types in `store/types.ts`
- **CSS structure**: Chess components use CSS Modules (`*.module.css`); all theme tokens (`--light-square`, `--accent`, `--text`, `--panel`, `--popover`, `--hover`, `--track`, ...) are defined on `.chessGame` in `ChessBoard.module.css` with dark-scheme values, and `.light` redefines them for light pages (plus green squares). The prop `colorScheme` is only the initial scheme: the sun/moon button in `ChessSettings` switches it. The game never paints a background of its own (always transparent): only the tokens for the board, panels and avatars change. Never hardcode UI colors in component CSS: use a token, or the component becomes unreadable on one of the two backgrounds. Anything that content scrolls under (the move history's sticky header) needs an opaque token (`--header-solid`), not the translucent `--popover`. Site pages use global styles in `apps/web/src/index.css`
- **Tests**: `npm test` (Vitest) covers the chess logic in `packages/react-chessmaster/src/__tests__/`; verify UI changes manually in the dev server
- **Persistence (opt-in)**: the `persist` prop saves each board to localStorage under `react-chessmaster:<key>` (see `store/persistence.ts`). Only a minimal snapshot is stored (pieces, hasMoved, turn, history, promotion, layout, game mode/colors/level, undo stack); everything derived is rebuilt with `markCellsUnderAttack` on restore. When that snapshot changes shape, bump `PERSIST_VERSION` (now 3) and teach `migratePersistedGame` to upgrade the previous version — its branches are cumulative (`version <= 1`, then `version <= 2`), so an old save is walked up one version at a time
- **Build**: `npm run build` runs `tsc -b` — a plain `tsc` checks nothing because the root tsconfig only has project references

## CI and GitHub configuration

- `.github/workflows/ci.yml` (workflow `CI`) runs on every `pull_request` and every push to `master`, with **no `paths:` filters**. One job, **`Lint, test and build`**: `npm ci`, `npm run lint`, `npm test -- --run`, `npm run build`, `npm run build:package` (`build` does not build the package library, so it needs its own step). It runs on Node 24 because js-chess-engine declares `engines.node >=24` and jsdom 30 needs `^22.22.2 || ^24.15.0 || >=26`
- **Never rename that job, split it or add `paths:` filters**: the name `Lint, test and build` is the required status check of the `protect-master` ruleset (GitHub → Settings → Rules). If the name changes, or the job stops running on some PR, the ruleset waits for a check that never reports and the PR can never be merged. To rename it, change the ruleset first
- `.github/dependabot.yml`: weekly updates for npm and github-actions, one entry per ecosystem at `/` (the lockfile is in the root and covers both workspaces), with minor/patch grouped apart from majors. `apps/web` and the package declare the same tools (`react`, `js-chess-engine`, `typescript`, `vite`, ...): in every Dependabot PR check that both `package.json` moved to the same version, and never merge a change that bumps only one
- `.github/PULL_REQUEST_TEMPLATE.md` is the PR description (same sections as `CONTRIBUTING.md`); `SECURITY.md` in the root points to GitHub's private vulnerability reporting
- The ruleset, Dependabot alerts, secret scanning and private vulnerability reporting are switched on by hand in GitHub Settings: nothing in the repo enables them
