import { describe, it, expect } from 'vitest';
import { calculateFuturesMoves } from './CalculateMoves';
import { buildBoard, getPieceAtCoords } from './testFixtures';

describe('Movimientos Especiales - Promoción y Captura', () => {
  describe('Promoción de Peón', () => {
    it('peón blanco en e7 puede llegar a e8 (fila de promoción)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 1); // e7
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Peón puede llegar a e8 (promoción)
      expect(moves).toContainEqual({ row: 0, col: 4 });
    });

    it('peón negro en e2 puede llegar a e1 (fila de promoción para negras)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'bP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 6); // e2
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Peón negro puede avanzar a e1 (promoción)
      expect(moves).toContainEqual({ row: 7, col: 4 });
    });

    it('peón blanco en e6 puede avanzar hacia e8 (no es e8 aún)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 2); // e6
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Peón puede avanzar (incluido a e8)
      expect(moves.length).toBeGreaterThan(0);
    });

    it('peón blanco en e7 (casilla antes de promoción) puede solo ir a e8', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 1); // e7
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Solo puede avanzar a e8
      expect(moves.length).toBe(1);
      expect(moves[0]).toEqual({ row: 0, col: 4 }); // e8
    });
  });

  describe('Captura y Movimientos Especiales', () => {
    it('peón blanco puede capturar diagonalmente enemigos cerca de promoción', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'bP', 'wP', 'bP', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 1); // e7
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Peón puede capturar en d8 o f8
      const canCaptureLeft = moves.some(m => m.row === 0 && m.col === 3);
      const canCaptureRight = moves.some(m => m.row === 0 && m.col === 5);

      expect(canCaptureLeft || canCaptureRight).toBe(true);
    });

    it('peón blanco no puede avanzar si hay pieza enfrente (incluso cerca de promoción)', () => {
      const board = buildBoard([
        ['', '', '', '', 'bR', '', '', ''],
        ['', '', '', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 1); // e7
      const moves = calculateFuturesMoves(peon, board, false, false);

      // No puede avanzar a e8 porque hay torre negra
      const canAdvance = moves.some(m => m.row === 0 && m.col === 4);
      expect(canAdvance).toBe(false);
    });
  });

  describe('Captura al Paso (En Passant)', () => {
    it('peón blanco en e5 atacaría peón en d4 si fuera enemigo', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', 'bP', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peonBlanco = getPieceAtCoords(board, 4, 3); // e5
      const moves = calculateFuturesMoves(peonBlanco, board, false, false);

      // Peón blanco puede atacar d4 (diagonal)
      expect(moves).toContainEqual({ row: 4, col: 2 }); // d4
    });

    it('peón negro en d4 puede atacar e3 (diagonal)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', 'bP', 'wP', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peonNegro = getPieceAtCoords(board, 2, 3); // d4
      const moves = calculateFuturesMoves(peonNegro, board, false, false);

      // Peón negro puede atacar e3 (diagonal)
      expect(moves).toContainEqual({ row: 4, col: 3 }); // e3
    });
  });

  describe('Casos edge', () => {
    it('peón no puede avanzar 2 casillas si el camino está obstruido', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'bP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peonBlanco = getPieceAtCoords(board, 4, 6); // e2
      const moves = calculateFuturesMoves(peonBlanco, board, false, false);

      // Peón puede solo avanzar 1 casilla (hay bP en e4)
      const canAdvance2 = moves.some(m => m.row === 4 && m.col === 4); // e4
      const canAdvance1 = moves.some(m => m.row === 5 && m.col === 4); // e3

      expect(canAdvance1).toBe(true);
      expect(canAdvance2).toBe(false); // Blocked by bP
    });

    it('múltiples peones pueden alcanzar fila de promoción', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['wP', '', '', '', '', '', '', 'wP'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon1 = getPieceAtCoords(board, 0, 1); // a7
      const peon2 = getPieceAtCoords(board, 7, 1); // h7

      const moves1 = calculateFuturesMoves(peon1, board, false, false);
      const moves2 = calculateFuturesMoves(peon2, board, false, false);

      // Ambos pueden alcanzar fila de promoción
      expect(moves1).toContainEqual({ row: 0, col: 0 }); // a8
      expect(moves2).toContainEqual({ row: 0, col: 7 }); // h8
    });
  });
});
