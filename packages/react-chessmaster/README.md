<div align="center">

# ♟️ react-chessmaster

**A complete chess board for React. Drop it in, play a friend or the computer.**

<img src="https://raw.githubusercontent.com/BrayanGuti/ChessMaster/master/docs/media/vs-computer.gif" alt="Playing against the computer" width="640" />

[![npm](https://img.shields.io/npm/v/@brayanguti/react-chessmaster?style=for-the-badge&color=000000&labelColor=000000)](https://www.npmjs.com/package/@brayanguti/react-chessmaster)
[![License: MIT](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge)](https://github.com/BrayanGuti/ChessMaster/blob/master/LICENSE)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-000000?style=for-the-badge&logo=react)](https://react.dev/)

**[▶️ Live demo](https://chess-master-phi.vercel.app/)**

</div>

---

## Features

- **Every rule** — castling, en passant, promotion, check, checkmate and stalemate.
- **Two modes** — two players on one screen, or **vs Computer** with 5 levels, running in a Web Worker so the page never freezes.
- **Click or drag** — mouse, touch and pen; the board flips when you play black against the computer.
- **Take a move back** — an undo button in the settings bar; against the computer it takes back its reply too.
- **Smooth move animation** — pieces slide to their square, including castling's rook; on by default, off for reduced-motion visitors.
- **Closable result** — the checkmate/stalemate dialog can be closed to see the final board, and brought back with one click.
- **Themeable** — square colors, accent, and a `light` / `dark` scheme for any page background.
- **Saved games** — optional `localStorage` persistence, one save per board.
- **Just works** — CSS, pieces and sounds included; SSR-safe, ready for Next.js Server Components.

## Install

```bash
npm install @brayanguti/react-chessmaster
```

Requires React 18 or 19. No stylesheet to import, nothing to configure.

## Quick start

```tsx
import { ChessBoard } from '@brayanguti/react-chessmaster'

export default function App() {
  return (
    <div style={{ width: 720, height: 560 }}>
      <ChessBoard showMoveHistory showPlayerBadges />
    </div>
  )
}
```

The board fills its container and stays square; the panels around it adapt to the space
(side by side when wide, stacked when narrow). Give the container a size, or just a width.

## Play the computer

```tsx
<ChessBoard
  defaultMode="computer"
  opponent={{ color: 'B', level: 3 }}   // the computer plays black, level 1–5
/>
```

Players can switch mode, color and level from the built-in **Game** panel. Restrict what they can
pick with `modes`:

```tsx
<ChessBoard modes={['computer']} />   // only against the computer
<ChessBoard modes={['local']} />      // only two players
```

**Bring your own engine** — `getMove` receives the position in FEN and returns a move in UCI
notation (`"e2e4"`, `"e7e8q"`):

```tsx
<ChessBoard
  defaultMode="computer"
  opponent={{
    getMove: async (fen) => (await fetch(`/api/best-move?fen=${encodeURIComponent(fen)}`)).text(),
  }}
/>
```

## Themes

<img src="https://raw.githubusercontent.com/BrayanGuti/ChessMaster/master/docs/media/themes.png" alt="Dark and light color schemes with custom square colors" width="720" />

```tsx
<ChessBoard
  colorScheme="light"                    // panels for light pages, green squares ('dark' by default)
  theme={{ accent: '#b58863' }}
/>
```

`theme` accepts `lightSquare`, `darkSquare`, `highlight`, `accent`, `check` and `moveHint`.

Players can switch between dark and light with the sun/moon button next to the gear. The switch
only recolors the board and the panels: the game never paints a background of its own, so the page
behind it is yours to style.

## Move animation

Pieces slide to their new square — including the rook when castling — in a fifth of a second or
so; a piece the player drags there themselves just lands, since they already carried it. It is
skipped for a new game, a reload, an undo, and for visitors who prefer reduced motion. Turn it off
with `animateMoves={false}`.

## Taking a move back

The settings bar has an undo button between the light/dark switch and the gear (`showUndo`, which
needs `showSettings`). It takes back the last move you made — including castling, en passant and
promotions — and against the computer it also takes back its reply, so the board comes back on
your turn. There is nothing to undo until you have actually moved (playing black, that means after
the computer's opening and your own reply), and the button is greyed out then, and while the
engine is thinking. With `persist`, moves played before a reload can still be taken back. Remove
the button with `showUndo={false}`.

## Game over

Checkmate and stalemate open a dialog over the board with the result and a Rematch / New game
button. It can be closed — with its ✕, Escape, or a click outside it — to see the final position,
and a trophy button appears in the settings bar to bring it back. Both need `showSettings`: without
it, the dialog behaves as it always has, with no way to dismiss it.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `showMoveHistory` | `boolean` | `false` | Move list panel |
| `showCapturedPieces` | `boolean` | `false` | Captured pieces and material |
| `showPlayerBadges` | `boolean` | `false` | Player avatars and names above and below the board |
| `showGamePanel` | `boolean` | `true` | Mode / color / level / new game panel. `false` removes it |
| `showSettings` | `boolean` | `true` | Settings bar: light/dark switch, undo button, gear menu, and the trophy button that reopens a closed result dialog |
| `showUndo` | `boolean` | `true` | Undo button in the settings bar. Needs `showSettings`. `false` removes it |
| `animateMoves` | `boolean` | `true` | Slide pieces to their square when a move is played. `false` makes them jump, like before this existed |
| `modes` | `('local' \| 'computer')[]` | both | Game modes the player can choose |
| `defaultMode` | `'local' \| 'computer'` | `'computer'` if allowed | Mode of the first game |
| `opponent` | `{ color?, level?, getMove? }` | `{ color: 'B', level: 2 }` | Computer's color (`'W' \| 'B' \| 'random'`), level `1–5`, custom engine |
| `colorScheme` | `'dark' \| 'light'` | `'dark'` | Initial scheme for dark or light pages; light has green squares (the player can switch it) |
| `theme` | `ChessBoardTheme` | — | Board and accent colors |
| `persist` | `boolean \| string` | — | Save the game in `localStorage`. A string is the save's key, so each board keeps its own game |
| `onMove` | `(move: MoveRecord) => void` | — | After every move |
| `onGameEnd` | `(result: GameEndResult) => void` | — | Checkmate or stalemate: `{ winner, reason, mode, playerColor }` |
| `onReset` | `() => void` | — | A new game was started |
| `className` | `string` | — | Class on the root element |

`show*`, `defaultMode` and `opponent` set the **first** game; after that the player's choices
(from the Game panel and the gear menu) take over, and are saved with `persist`.

## TypeScript

The package ships its own types. Everything public is exported next to the component:

```tsx
import { ChessBoard } from '@brayanguti/react-chessmaster'
import type { ChessBoardProps, GameEndResult, MoveRecord } from '@brayanguti/react-chessmaster'

const onMove = (move: MoveRecord) => console.log(move.notation)
const onGameEnd = (result: GameEndResult) => console.log(result.winner, result.reason)
```

| Type | What it is |
| --- | --- |
| `ChessBoardProps` | Props of `<ChessBoard>` |
| `ChessBoardTheme` | The `theme` object: `lightSquare`, `darkSquare`, `highlight`, `accent`, `check`, `moveHint` |
| `OpponentOptions` | The `opponent` prop: `{ color?, level?, getMove? }` |
| `OpponentLevel` | `1 \| 2 \| 3 \| 4 \| 5` |
| `ColorChoice` | `'W' \| 'B' \| 'random'` |
| `PieceColor` | `'W' \| 'B'` |
| `GameMode` | `'local' \| 'computer'` |
| `MoveRecord` | What `onMove` receives: `piece`, `from`, `to`, `captured`, `notation`, `turnNumber` |
| `GameEndResult` | What `onGameEnd` receives: `{ winner, reason, mode, playerColor }` |

## Next.js

Works in the App Router out of the box, even from a Server Component: the bundle is marked
`"use client"` and renders the same on the server and the client.

## License

[MIT](https://github.com/BrayanGuti/ChessMaster/blob/master/LICENSE) © Brayan Gutierrez.
Includes [js-chess-engine](https://github.com/josefjadrny/js-chess-engine) (MIT), public-domain
pieces by Martin Sedlák, CC BY icons from SVG Repo and sounds edited from Pixabay; see
`THIRD_PARTY_LICENSES.md` for authors and licenses.
