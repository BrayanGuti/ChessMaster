# Third-party licenses

This package includes code, images and sounds from the following sources.

## js-chess-engine

The built-in computer opponent. It is bundled into the engine Web Worker
(`dist/jsChessEngine.worker-*.js`) and into the main-thread fallback (`dist/jsChessEngineCore-*.js`).
https://github.com/josefjadrny/js-chess-engine

```
MIT License

Copyright (c) 2020 Josef Jadrny

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Chess pieces

The twelve piece images (`src/assets/Pieces/`, inlined in `dist/index.js`), from
[chess_svg_piece_sets](https://github.com/kmar/chess_svg_piece_sets) by Martin Sedlák.
Dedicated to the public domain (CC0); optimized with SVGO and given a `viewBox`.

```
The person or persons who have associated work with this document (the "Dedicator" or "Certifier")
hereby either (a) certifies that, to the best of his knowledge, the work of authorship identified is
in the public domain of the country from which the work is published, or (b) hereby dedicates
whatever copyright the dedicators holds in the work of authorship identified below (the "Work") to
the public domain. [...] Dedicator recognizes that, once placed in the public domain, the Work may be
freely reproduced, distributed, transmitted, used, modified, built upon, or otherwise exploited by
anyone for any purpose, commercial or non-commercial, and in any way, including by methods that have
not yet been invented or conceived.
```

## Icons

Inlined as SVG in `ChessSettings` and `GamePanel`, and as an image in `PlayerBadge` (the chip), from [SVG Repo](https://www.svgrepo.com), under
the Creative Commons Attribution license (https://creativecommons.org/licenses/by/4.0/).
Changes: optimized with SVGO; the inline ones are recolored to `currentColor` so they follow the theme.

| Icon | Used for | Author | Collection | Source |
| --- | --- | --- | --- | --- |
| Settings | Board settings menu | Solar Icons | Solar Outline Icons | https://www.svgrepo.com/svg/523734/settings |
| Sun | Switch to light mode | Dazzle UI | Dazzle Line Icons | https://www.svgrepo.com/svg/532889/sun |
| Dark mode night moon | Switch to dark mode | nickylimyeanfen | Ink Interface Icons | https://www.svgrepo.com/svg/381213/dark-mode-night-moon |
| Random | "Random color" option | FortAwesome | Font Awesome Solid Icons | https://www.svgrepo.com/svg/352388/random |
| Chip AI | The computer's avatar | wishforge.games | Technology And Security Line Vectors | https://www.svgrepo.com/svg/235253/chip-ai |

The undo arrow and trophy ("Show result") icons in `ChessSettings`, and the close (✕) icon in
`GameOverModal`, are not in the table: they were drawn for this package, carry no third-party
rights, and are covered by the package's own MIT license.

## Sounds

The move, capture, castling, check and game-over sounds (`src/assets/Sound/`, inlined in
`dist/index.js`) were mixed and edited from these recordings on
[Pixabay](https://pixabay.com), used under the Pixabay Content License
(https://pixabay.com/service/license-summary/):

- "Chess pieces" (Pixabay ID 60890) by freesound_community
- "Dragslide 3" (Pixabay ID 101237) by freesound_community
- "Select button UI" (Pixabay ID 395763) by emilianodleon

freesound_community: https://pixabay.com/users/freesound_community-46691455/
