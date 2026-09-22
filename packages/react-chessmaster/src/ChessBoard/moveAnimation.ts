import type { Coords, MoveRecord } from '../store/types';

/** A piece that travels from one square to another, by square name ("e2") */
export interface Slide {
  from: string;
  to: string;
}

/** What the board looked like the last time it was checked, to tell a new move from anything else */
export interface MoveSnapshot {
  lastMove: MoveRecord | undefined;
  moveCount: number;
  gameId: number;
}

const MIN_DURATION_MS = 150;
const MAX_DURATION_MS = 300;

const fileOf = (square: string) => square.charCodeAt(0) - 97;
const rankOf = (square: string) => Number(square[1]);

/**
 * The pieces that visibly travel for a move: the one that moved and, when castling, the rook
 * too. The record carries no castling flag: a king that crosses two files can only be castling.
 */
export function getMoveSlides(record: MoveRecord): Slide[] {
  const slides: Slide[] = [{ from: record.from, to: record.to }];

  const isCastling = record.piece[1] === 'K' && Math.abs(fileOf(record.to) - fileOf(record.from)) === 2;
  if (isCastling) {
    const kingside = fileOf(record.to) > fileOf(record.from);
    const rank = record.from[1];
    slides.push({ from: `${kingside ? 'h' : 'a'}${rank}`, to: `${kingside ? 'f' : 'd'}${rank}` });
  }

  return slides;
}

/**
 * How long a slide takes: longer for longer trips (a rook across the board should not look as
 * hurried as a pawn step) but never sluggish. The computer answers no sooner than 500 ms after
 * the player's move, so even the longest slide is over before it starts.
 */
export function slideDuration({ from, to }: Slide): number {
  const distance = Math.hypot(fileOf(to) - fileOf(from), rankOf(to) - rankOf(from));
  return Math.round(Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, 120 + 25 * distance)));
}

/**
 * The square the captured piece stood on, or null when the move captured nothing. It is where
 * that piece last moved to: on the target square, except for en passant, where the pawn that
 * just advanced two squares stands beside the capturing one (`previous` is the move before).
 */
export function capturedSquare(record: MoveRecord, previous: MoveRecord | undefined): string | null {
  if (!record.captured) return null;
  return previous && previous.piece === record.captured ? previous.to : record.to;
}

/** Board coordinates of a square name: row 0 is rank 8 and col 0 is file a. */
export function squareToCoords(square: string): Coords {
  return { col: fileOf(square), row: 8 - rankOf(square) };
}

/**
 * A slide is shown only for a move that was just played: not for the position a page loads with,
 * not when moves are taken back (the history shrinks), not for a new game, and not for finishing
 * a promotion (it adds no move). `null` is the first time the board is looked at.
 */
export function shouldAnimate(previous: MoveSnapshot | null, next: MoveSnapshot): boolean {
  return (
    previous !== null &&
    next.lastMove !== undefined &&
    next.gameId === previous.gameId &&
    next.moveCount === previous.moveCount + 1 &&
    next.lastMove !== previous.lastMove
  );
}
