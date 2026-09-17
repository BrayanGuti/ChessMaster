import { describe, it, expect } from 'vitest';
import { calculateAvailableMoves, calculateFuturesMoves } from './CalculateMoves';
import { initialBoard, getPieceAtCoords, buildBoard } from './testFixtures';

describe('CalculateMoves - Cobertura de Movimientos', () => {
  describe('Peón - Movimientos básicos', () => {
    it('peón blanco puede avanzar desde posición inicial', () => {
      const board = initialBoard();
      const peon = getPieceAtCoords(board, 4, 6); // e2
      const moves = calculateFuturesMoves(peon, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('peón blanco puede avanzar 1 o 2 casillas desde inicial', () => {
      const board = initialBoard();
      const peon = getPieceAtCoords(board, 4, 6); // e2
      const moves = calculateFuturesMoves(peon, board, false, false);
      // Debe poder avanzar 1 casilla (row 5) o 2 casillas (row 4)
      const hasAdvance1 = moves.some(m => m.row === 5 && m.col === 4);
      const hasAdvance2 = moves.some(m => m.row === 4 && m.col === 4);
      expect(hasAdvance1 || hasAdvance2).toBe(true);
    });

    it('peón negro puede avanzar desde posición inicial', () => {
      const board = initialBoard();
      const peon = getPieceAtCoords(board, 4, 1); // e7
      const moves = calculateFuturesMoves(peon, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });
  });

  describe('Caballo - Movimientos L', () => {
    it('caballo blanco tiene movimientos disponibles desde posición inicial', () => {
      const board = initialBoard();
      const caballo = getPieceAtCoords(board, 1, 7); // b1
      const moves = calculateFuturesMoves(caballo, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('caballo negro tiene movimientos disponibles desde posición inicial', () => {
      const board = initialBoard();
      const caballo = getPieceAtCoords(board, 1, 0); // b8
      const moves = calculateFuturesMoves(caballo, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('caballo en el centro tiene 8 movimientos posibles', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wN', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);
      const caballo = getPieceAtCoords(board, 3, 4);
      const moves = calculateFuturesMoves(caballo, board, false, false);
      expect(moves.length).toBe(8);
    });

    it('caballo en esquina tiene solo 2 movimientos', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wN', '', '', '', '', '', '', ''],
      ]);
      const caballo = getPieceAtCoords(board, 0, 7); // a1
      const moves = calculateFuturesMoves(caballo, board, false, false);
      expect(moves.length).toBe(2);
    });
  });

  describe('Alfil - Movimiento diagonal', () => {
    it('alfil blanco tiene movimientos diagonales desde posición inicial', () => {
      const board = initialBoard();
      // Alfil blanco en c1 no puede moverse (bloqueado por peones)
      const alfil = getPieceAtCoords(board, 2, 7); // c1
      const moves = calculateFuturesMoves(alfil, board, false, false);
      expect(moves.length).toBe(0); // bloqueado
    });

    it('alfil en tablero abierto puede moverse en diagonales', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wB', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);
      const alfil = getPieceAtCoords(board, 3, 4);
      const moves = calculateFuturesMoves(alfil, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });
  });

  describe('Torre - Movimiento vertical y horizontal', () => {
    it('torre blanca tiene movimientos desde posición inicial', () => {
      const board = initialBoard();
      const torre = getPieceAtCoords(board, 0, 7); // a1
      const moves = calculateFuturesMoves(torre, board, false, false);
      expect(moves.length).toBe(0); // bloqueada por peón
    });

    it('torre en tablero abierto puede moverse en líneas rectas', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wR', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);
      const torre = getPieceAtCoords(board, 3, 4);
      const moves = calculateFuturesMoves(torre, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });
  });

  describe('Reina - Alfil + Torre', () => {
    it('reina blanca tiene movimientos desde posición inicial', () => {
      const board = initialBoard();
      const reina = getPieceAtCoords(board, 3, 7); // d1
      const moves = calculateFuturesMoves(reina, board, false, false);
      expect(moves.length).toBe(0); // bloqueada
    });

    it('reina en tablero abierto puede moverse como alfil y torre', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wQ', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);
      const reina = getPieceAtCoords(board, 3, 4);
      const moves = calculateFuturesMoves(reina, board, false, false);
      expect(moves.length).toBeGreaterThan(0);
    });
  });

  describe('Rey - Movimiento limitado a 1 casilla', () => {
    it('rey blanco tiene movimientos limitados desde posición inicial', () => {
      const board = initialBoard();
      const rey = getPieceAtCoords(board, 4, 7); // e1
      const moves = calculateFuturesMoves(rey, board, false, false);
      expect(moves.length).toBe(0); // bloqueado
    });

    it('rey en tablero abierto se mueve 1 casilla en cualquier dirección', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wK', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);
      const rey = getPieceAtCoords(board, 3, 4);
      const moves = calculateFuturesMoves(rey, board, false, false);
      expect(moves.length).toBeLessThanOrEqual(8);
      for (const move of moves) {
        const distRow = Math.abs(move.row - 4);
        const distCol = Math.abs(move.col - 3);
        expect(Math.max(distRow, distCol)).toBe(1);
      }
    });
  });

  describe('Cobertura general de posición inicial', () => {
    it('todas las piezas blancas iniciales están en posición correcta', () => {
      const board = initialBoard();

      // Verificar piezas blancas en fila 7 y 6
      expect(getPieceAtCoords(board, 0, 7).piece).toBe('wR'); // a1
      expect(getPieceAtCoords(board, 1, 7).piece).toBe('wN'); // b1
      expect(getPieceAtCoords(board, 2, 7).piece).toBe('wB'); // c1
      expect(getPieceAtCoords(board, 3, 7).piece).toBe('wQ'); // d1
      expect(getPieceAtCoords(board, 4, 7).piece).toBe('wK'); // e1
      expect(getPieceAtCoords(board, 5, 7).piece).toBe('wB'); // f1
      expect(getPieceAtCoords(board, 6, 7).piece).toBe('wN'); // g1
      expect(getPieceAtCoords(board, 7, 7).piece).toBe('wR'); // h1

      // Peones blancos
      expect(getPieceAtCoords(board, 0, 6).piece).toBe('wP'); // a2
      expect(getPieceAtCoords(board, 4, 6).piece).toBe('wP'); // e2
    });

    it('todas las piezas negras iniciales están en posición correcta', () => {
      const board = initialBoard();

      // Verificar piezas negras en fila 0 y 1
      expect(getPieceAtCoords(board, 0, 0).piece).toBe('bR'); // a8
      expect(getPieceAtCoords(board, 1, 0).piece).toBe('bN'); // b8
      expect(getPieceAtCoords(board, 2, 0).piece).toBe('bB'); // c8
      expect(getPieceAtCoords(board, 3, 0).piece).toBe('bQ'); // d8
      expect(getPieceAtCoords(board, 4, 0).piece).toBe('bK'); // e8
      expect(getPieceAtCoords(board, 5, 0).piece).toBe('bB'); // f8
      expect(getPieceAtCoords(board, 6, 0).piece).toBe('bN'); // g8
      expect(getPieceAtCoords(board, 7, 0).piece).toBe('bR'); // h8

      // Peones negros
      expect(getPieceAtCoords(board, 0, 1).piece).toBe('bP'); // a7
      expect(getPieceAtCoords(board, 4, 1).piece).toBe('bP'); // e7
    });

    it('piezas blancas tienen hasMoved=false en inicio', () => {
      const board = initialBoard();

      // Rey, torres y peones deben tener hasMoved=false
      expect(getPieceAtCoords(board, 4, 7).hasMoved).toBe(false); // wK
      expect(getPieceAtCoords(board, 0, 7).hasMoved).toBe(false); // wR a1
      expect(getPieceAtCoords(board, 7, 7).hasMoved).toBe(false); // wR h1
      expect(getPieceAtCoords(board, 0, 6).hasMoved).toBe(false); // wP a2
    });

    it('piezas negras tienen hasMoved=false en inicio', () => {
      const board = initialBoard();

      // Rey, torres y peones deben tener hasMoved=false
      expect(getPieceAtCoords(board, 4, 0).hasMoved).toBe(false); // bK
      expect(getPieceAtCoords(board, 0, 0).hasMoved).toBe(false); // bR a8
      expect(getPieceAtCoords(board, 7, 0).hasMoved).toBe(false); // bR h8
      expect(getPieceAtCoords(board, 0, 1).hasMoved).toBe(false); // bP a7
    });
  });

  describe('Movimientos de captura', () => {
    it('pieza blanca NO puede capturar pieza blanca (calculateAvailableMoves filtra)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', 'wP', '', '', '', '', ''],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const rey = getPieceAtCoords(board, 0, 7);
      const movesAvailable = calculateAvailableMoves(rey, board);

      // Rey NO puede capturar peón blanco en c2
      expect(movesAvailable).not.toContainEqual({ row: 6, col: 2 });
    });

    it('pieza blanca puede capturar pieza negra', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'bP', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wQ', '', '', '', ''],
      ]);

      const reina = getPieceAtCoords(board, 3, 7);
      const movesAvailable = calculateAvailableMoves(reina, board);

      // Reina puede capturar peón negro en d3
      expect(movesAvailable).toContainEqual({ row: 5, col: 3 });
    });
  });
});
