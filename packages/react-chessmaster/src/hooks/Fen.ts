import { ChessBoardCell, ChessBoardPositions, MoveRecord } from "../store/types"

/**
 * Forsyth–Edwards Notation of the current position, the format chess engines take as input.
 * - Castling rights come from the king and rook `hasMoved` flags on their starting squares.
 * - The en passant square is given after any two-square pawn advance (see getEnPassantTarget).
 * - The halfmove clock counts moves since the last pawn move or capture (fifty-move rule).
 */
export function toFEN(
  board: ChessBoardPositions,
  turn: 'W' | 'B',
  moveHistory: MoveRecord[],
  enPassant: ChessBoardCell['coordinates'] | null = null
): string {
  const placement = board
    .map(row => {
      let rank = ''
      let empty = 0
      for (const cell of row) {
        if (cell.piece === '') {
          empty++
          continue
        }
        if (empty > 0) rank += empty
        empty = 0
        const letter = cell.piece[1]
        rank += cell.piece[0] === 'W' ? letter : letter.toLowerCase()
      }
      return empty > 0 ? rank + empty : rank
    })
    .join('/')

  const canCastle = (row: number, rookCol: number, color: 'W' | 'B') => {
    const king = board[row][4]
    const rook = board[row][rookCol]
    return king.piece.startsWith(`${color}K`) && !king.hasMoved
      && rook.piece.startsWith(`${color}R`) && !rook.hasMoved
  }
  const castling = [
    canCastle(7, 7, 'W') ? 'K' : '',
    canCastle(7, 0, 'W') ? 'Q' : '',
    canCastle(0, 7, 'B') ? 'k' : '',
    canCastle(0, 0, 'B') ? 'q' : '',
  ].join('') || '-'

  let halfmoveClock = 0
  for (let i = moveHistory.length - 1; i >= 0; i--) {
    const move = moveHistory[i]
    if (move.piece[1] === 'P' || move.captured) break
    halfmoveClock++
  }

  const fullmoveNumber = Math.floor(moveHistory.length / 2) + 1

  const enPassantSquare = enPassant ? board[enPassant.row][enPassant.col].cellName : '-'

  return `${placement} ${turn === 'W' ? 'w' : 'b'} ${castling} ${enPassantSquare} ${halfmoveClock} ${fullmoveNumber}`
}
