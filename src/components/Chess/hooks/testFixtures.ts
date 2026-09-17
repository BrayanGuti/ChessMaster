import { ChessBoardCell, ChessBoardPositions } from '../store/types';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function buildBoard(piecesArray: (string | null)[][]): ChessBoardPositions {
  const board: ChessBoardPositions = [];

  for (let row = 0; row < 8; row++) {
    const boardRow: ChessBoardCell[] = [];
    for (let col = 0; col < 8; col++) {
      const piece = piecesArray[row]?.[col] || '';
      const cellName = `${FILES[col]}${RANKS[row]}` as any;

      const cell: ChessBoardCell = {
        piece: piece || '',
        YouCanMoveHere: false,
        isUnderAttackBy: [],
        hasMoved: false,
        cellName,
        coordinates: { col, row },
      };

      boardRow.push(cell);
    }
    board.push(boardRow);
  }

  return board;
}

export function setHasMoved(board: ChessBoardPositions, pieceName: string): ChessBoardPositions {
  return board.map((row) =>
    row.map((cell) =>
      cell.piece === pieceName ? { ...cell, hasMoved: true } : cell
    )
  );
}

export function getPieceAtCoords(board: ChessBoardPositions, col: number, row: number): ChessBoardCell {
  return board[row]?.[col];
}

export function getPieceAtCell(board: ChessBoardPositions, cellName: string): ChessBoardCell | undefined {
  const col = FILES.indexOf(cellName[0]);
  const row = RANKS.indexOf(cellName[1]);
  return col >= 0 && row >= 0 ? board[row][col] : undefined;
}

export function boardToSimpleArray(board: ChessBoardPositions): (string)[][] {
  return board.map((row) => row.map((cell) => cell.piece || ''));
}

export function initialBoard(): ChessBoardPositions {
  return buildBoard([
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
  ]);
}
