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
- The package is ready to publish (`publishConfig.access: public`, MIT `LICENSE`, npm-facing `README.md`). Brayan publishes it himself (`npm publish -w packages/react-chessmaster`); Claude never runs `npm publish`. Bump `version` in `packages/react-chessmaster/package.json` (and `package-lock.json`) before each release, and tag it `v<version>` once published.
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
├── HomePage/               # The one route ('/'); sections stack top to bottom
│   ├── Header/             # Nav bar (Code Base, Creator, Credits, Get started)
│   ├── HeroSection/        # Above the fold: title, "Play Now" link, the horse render
│   ├── GameSection/        # The live <ChessBoard>, feature list and quick facts
│   ├── GetStartedSection/  # Install steps, prop cheatsheet, "bring your engine" guides
│   ├── CreatorSection/     # About the author, contact links
│   ├── CreditsSection/     # Third-party credits (mirrors THIRD_PARTY_LICENSES.md)
│   ├── Footer/             # Bottom links
│   └── scrollToSection.ts  # Smooth-scrolls to a section id, used by the nav links
└── Error404Page/           # 404 error handling (errorElement on the router)
```

### Chess Game System
```
packages/react-chessmaster/src/
├── index.ts           # Public API (ChessBoard + public types). Import the component only from here.
├── ChessBoard/        # Public <ChessBoard> (layout, panels, sounds) + Board.tsx (8x8 grid) + drag logic
│                      #   orientation.ts: board flip (useBoardFlipped, toDisplay board<->screen coords)
│                      #   moveAnimation.ts / useMoveAnimation.ts: slide pieces to their square (see Move animation below)
├── ChessCell/         # Individual cell component with click handlers
├── ChessPiece/        # Piece SVG renderer with position styling
├── CoronationPanel/   # Modal for pawn promotion (choosing Queen/Rook/Bishop/Knight)
├── ChessSettings/     # Settings bar: light/dark switch + undo + Show result (after game over) + gear menu to toggle panels
├── GamePanel/         # "Game" panel: mode (vs Computer / 2 players, computer by default), human color, level, New game/Play
├── engine/            # ChessEngine interface; jsChessEngine (built-in, Web Worker); useComputerOpponent plays the computer's turns
├── PlayerBadge/ CapturedPieces/ MoveHistory/ GameOverModal/ ErrorBoundary/
├── assets/            # Pieces, sounds and avatars, imported as ES modules (pieces.ts, sounds.ts, avatars.ts)
├── __tests__/         # Vitest tests for the chess logic (also `fixtures.ts`, incl. the `randomEngine` test double)
├── hooks/             # Mostly not React hooks (see below); the two that are hint it in their name
│   ├── StartGame.ts           # Initialize board with starting positions
│   ├── CalculateMoves.ts      # Determine legal moves for a piece (accounts for piece type)
│   ├── Castling.ts            # Handle castling move validation and execution
│   ├── BoardAfterMove.ts      # A board copy with one move played; shared by movePiece and the legality check
│   ├── CheckMate.ts           # hasAnyLegalMove, applyGameEnd (the mate/stalemate verdict), wouldLeaveKingInCheck
│   ├── ChessCellCharacteristics.ts  # useChessCellCharacteristics: a real hook — cell color/corner/selection for ChessCell
│   ├── MarkCellsUnderAttack.ts      # Attacked cells & which king (if any) is in check — not mate/stalemate, see below
│   ├── LegalMoves.ts          # getLegalMoves (UCI) by simulating each move with wouldLeaveKingInCheck; parseUci
│   ├── EnPassant.ts           # en passant square from the last move; square of the pawn it captures
│   ├── useIsomorphicLayoutEffect.ts # useLayoutEffect, or useEffect on the server (SSR-safe); a real hook too
│   └── Fen.ts                 # toFEN (castling from hasMoved; en passant square from the last move)
└── store/
    ├── types.ts               # All types, including the public ChessBoardProps
    ├── createStore.ts         # Minimal external store (getState/setState/subscribe)
    ├── createChessStore.ts    # Chess store factory (one store per board instance) + opt-in saving
    ├── persistence.ts         # localStorage read/write, version migration, and restoring a position (reload and undo)
    ├── deriveCapturedPieces.ts # Captured pieces and material advantage, derived from moveHistory
    ├── undo.ts                # getUndoIndex/canUndoMove: how far undoMove goes back, shared with the button's disabled state
    ├── ChessGameProvider.tsx  # Context provider that creates the store for each <ChessBoard>
    └── useChessStore.ts       # Selector hook used by the components
```

The package must stay self-contained and lightweight: it must not import anything from outside `packages/react-chessmaster` (no site CSS, no `apps/web/public/`), and it has no runtime dependencies besides `react` (peer); keep it that way unless there is a strong reason. js-chess-engine (MIT, the built-in computer opponent) is a devDependency bundled into the build; its notice is in `THIRD_PARTY_LICENSES.md`, shipped in the package. `apps/web` declares js-chess-engine too, because it compiles the package source and Vercel installs only its own dependencies. Never add a GPL engine (e.g. Stockfish) to the package: it would force the whole package to be GPL. No icon or UI libraries (e.g. `lucide-react`): icons are inline SVGs, assets live in `src/assets/`.

### Game State Management (Store)

Each `<ChessBoard>` gets its own store from `createChessStore()` via `ChessGameProvider`, so several boards can coexist. Key state fields:

- **chessBoardpositions**: 8×8 array of cells with piece positions, coordinates, and move markers
- **turn**: Current player ('W' for white, 'B' for black)
- **checkState**: `{ check, colorOfCheck, isCheckmate, isStalemate }` — only `check`/`colorOfCheck` come from `markCellsUnderAttack`; the mate/stalemate verdict is `applyGameEnd`'s (see Check, Checkmate & Stalemate below)
- **cellOfPieceSelected**: Currently selected piece (for UI highlighting available moves)
- **coronation**: State for pawn promotion modal (whether active, coordinates, which pawn)
- **soundToPlay**: Audio trigger for move/check/capture sounds
- **moveHistory**: every move played (`MoveRecord[]`); feeds `onMove`, the move-list panel, captured pieces, undo and the move animation
- **displaySettings**: which panels are visible (`playerBadges`, `capturedPieces`, `moveHistory`, `gamePanel`), toggled from the gear menu
- **gameId**: increments on every `resetGame()`/`startGame()`, so the UI (and `onReset`) can tell a new game started
- **gameMode** ('local' | 'computer'), **playerColor** (the human's color), **colorChoice** ('W' | 'B' | 'random', kept for rematches), **opponentLevel** (1–5), **aiThinking**
- **undoStack**: the position before each move played, one entry per ply (see Undo below)
- **resultDismissed**: the game-over dialog was closed to see the final board (see Game over dialog below)

Key methods: `clickCell()`, `selectPieceToMove()`, `movePiece()`, `makeCoronation()`, `updateCellsUnderAttack(sideToMove?)`, `changeTurn()`, `startGame(config)`, `resetGame()` (rematch: keeps the configuration), `undoMove()`, `dismissResult()`, `showResult()`, `legalMoves()`, `applyMove(uci)`, `toFEN()`

### Undo
`movePiece` pushes `toPositionSnapshot(state)` onto `undoStack` before it changes anything, and `undoMove()` pops it and feeds it through `restorePosition()` — the same rebuild a reload uses. It restores rather than reverses the move because `MoveRecord` keeps no `hasMoved` flags, and castling rights are read from them (`Fen.ts`): a reversal would silently lose them. `store/undo.ts`'s `getUndoIndex` decides how far back to go, and both `undoMove()` and the button's `canUndo` (`canUndoMove`) read it, so they can never disagree: in 'computer' mode it goes back to the last entry where it was the human's turn — their own move can be the last ply, and if only the computer has moved (human plays black, computer opened) there is nothing to take back yet; in 'local' mode, one ply; either way, nothing while `aiThinking`. It applies everything in **one** `set()`: every `set` notifies, and `useComputerOpponent` reacts to any state where it is the engine's turn. It never bumps `gameId` (that would fire `onReset`), but it does clear `resultDismissed`, so undoing a mate away leaves the dialog ready to reopen for the next one. The stack is persisted, so a saved game can still be taken back after a reload.

### Move animation
`ChessBoard/moveAnimation.ts` is the pure logic: `getMoveSlides` (the mover, plus the rook when castling — the move record has no castling flag, so a king crossing two files is the only tell), `slideDuration` (150–300 ms by distance, always shorter than the computer's `MIN_THINKING_MS`), `capturedSquare` (where a captured piece stood; not the destination square for en passant) and `shouldAnimate` (true only for a move just played: not the first look at a loaded/restored board, not undo, not a new game, not a promotion completing — `makeCoronation` adds no move). `ChessBoard/useMoveAnimation.ts` runs it from a layout effect (`useIsomorphicLayoutEffect`) and animates with the Web Animations API directly on the DOM: no React state, no extra render, and it keeps running on the compositor even where the engine falls back to the main thread. The store already has a captured piece removed by the time the slide starts, so it is shown as a ghost on its square until the mover arrives. `useBoardDrag`'s `onDropMove` callback tells the hook to skip the very next slide: a piece the player dragged is already where it needs to be. Both `prefers-reduced-motion` and the public `animateMoves` prop (default `true`) can turn it off.

### Game over dialog
`GameOverModal` reads `checkState` and `resultDismissed` itself and returns `null` when hidden — which does **not** unmount it, since `Board` always renders `<GameOverModal>`. Its focus management (Rematch on open, the trophy button on close) therefore watches its own hidden↔visible transition rather than a mount effect, which would only ever fire once. `dismissResult()`/`showResult()` toggle `resultDismissed`; it is reset by `resetGame`, `startGame` and `restorePosition` (undo and reload), and never persisted, so reloading a finished, dismissed game shows the dialog again. Closing it (✕, Escape, or a click on the backdrop) and the "Show result" button that brings it back both need `showSettings`: without a settings bar there is no way back in, so the dialog behaves exactly as it always has.

### Game Modes (vs Computer)
- `clickCell` ignores input on the computer's turn; the drag path starts with `clickCell`, so it is covered too. The engine plays through `applyMove`, which reuses `movePiece` and completes promotions immediately.
- The board is flipped when the human plays black against the computer (`ChessBoard/orientation.ts`); `Board`, `useBoardDrag`, `ChessCell` corners, `CoronationPanel` and the badge order all go through it.
- `useComputerOpponent` runs on the computer's turn (also right after mount, so a game reloaded on its turn continues), waits at least `MIN_THINKING_MS`, and drops the answer if the game changed meanwhile. Engines implement `ChessEngine` in `engine/engine.ts`: the built-in `jsChessEngine`, or the host's `opponent.getMove(fen)` (an illegal answer or a rejected promise falls back to a random legal move with a console warning). `randomEngine` only exists for tests, so it lives in `__tests__/fixtures.ts`.
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
- `MarkCellsUnderAttack.ts` marks attacked cells (`isUnderAttackBy`) and reports after every move (`updateCellsUnderAttack()`) which king, if any, is in check — it does not decide mate or stalemate
- `applyGameEnd` (in `CheckMate.ts`) does: no legal move for the side to move means checkmate if in check, stalemate otherwise. It is the only rule that also knows about en passant (sometimes the only way out of a check), which is why it is a separate step rather than something `markCellsUnderAttack` could answer on its own. With a promotion pending it waits for `makeCoronation`

### Piece Notation
Pieces are encoded as 4-character strings: `[Color][Type][File][Rank]`, where file and rank are the
square the piece **started this game on** — moving it never changes its string; only `makeCoronation`
(promotion) and castling's rook get a new one, for their new square
- Color: 'W' (white) or 'B' (black)
- Type: 'P' (pawn), 'N' (knight), 'B' (bishop), 'R' (rook), 'Q' (queen), 'K' (king)
- File & Rank of the starting square: e.g., 'e4', 'h8'
- Example: "WPe2" is a white pawn that started on e2 — it keeps that id after playing e2-e4, and only stops being "WPe2" if it promotes

### Assets
- **SVG pieces** in `packages/react-chessmaster/src/assets/Pieces/` (named like WP.svg, BK.svg for piece notation): public domain, from kmar/chess_svg_piece_sets, optimized with SVGO and given `viewBox="0 0 64 64"` (without it they get clipped instead of scaled)
- **Sound effects** in `packages/react-chessmaster/src/assets/Sound/`: `move-1`/`move-2` (random), `capture` (also en passant), `castling`, `check`, `game-over`, chosen in that priority by `updateCellsUnderAttack` (game over > check > capture > castling > move). Edited by Brayan from Pixabay recordings
- **Icons** (gear, sun, moon, random) are inline SVGs with `currentColor`, CC BY from SVG Repo. The undo arrow, the trophy ("Show result") and the game-over dialog's close icon were drawn for this package: they have no third-party rights, and THIRD_PARTY_LICENSES.md says so rather than listing them
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
- **Build**: `npm run build` (root) runs the package's `tsc --noEmit`, then `apps/web`'s `tsc -b && vite build`; there is no root `tsconfig.json`, so a bare `tsc` at the repo root does nothing
