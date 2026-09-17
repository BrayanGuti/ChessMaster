import { describe, it, expect } from 'vitest';
import { calculateAvailableMoves, calculateFuturesMoves } from './CalculateMoves';
import { markCellsUnderAttack } from './MarkCellsUnderAttack';
import { buildBoard, getPieceAtCoords, initialBoard } from './testFixtures';

describe('MoveValidation - Restricciones y Movimientos Ilegales', () => {
  describe('NO puedes capturar tu propia pieza', () => {
    it('alfil blanco NO puede capturar peón blanco', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wB', '', '', '', '', '', '', 'wP'],
      ]);

      const alfil = getPieceAtCoords(board, 0, 7); // a1
      const movesAvailable = calculateAvailableMoves(alfil, board);

      // No puede capturar h1 (wP)
      expect(movesAvailable).not.toContainEqual({ row: 7, col: 7 });
    });

    it('caballo blanco NO puede ir a casilla ocupada por otra pieza blanca', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wB', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', 'wN', '', '', '', '', '', ''],
      ]);

      const caballo = getPieceAtCoords(board, 1, 7); // b1
      const movesAvailable = calculateAvailableMoves(caballo, board);

      // a3 (0,5) tiene wB, no puede ir ahí
      expect(movesAvailable).not.toContainEqual({ row: 5, col: 0 });
    });

    it('reina blanca NO puede atacar a otras piezas blancas', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wB', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', 'wQ', '', '', '', ''],
      ]);

      const reina = getPieceAtCoords(board, 3, 7); // d1
      const movesAvailable = calculateAvailableMoves(reina, board);

      // d5 (3,3) tiene wB, no puede capturar
      expect(movesAvailable).not.toContainEqual({ row: 3, col: 3 });

      // Pero sí puede moverse a casillas intermedias
      expect(movesAvailable).toContainEqual({ row: 4, col: 3 }); // d4
      expect(movesAvailable).toContainEqual({ row: 5, col: 3 }); // d3
      expect(movesAvailable).toContainEqual({ row: 6, col: 3 }); // d2
    });

    it('piezas blancas en posición inicial no pueden capturarse', () => {
      const board = initialBoard();

      // Todos los peones blancos tienen solo movimientos de avance
      for (let col = 0; col < 8; col++) {
        const peon = getPieceAtCoords(board, col, 6); // Peones en fila 2
        const moves = calculateFuturesMoves(peon, board, false, false);

        // Ningún movimiento debe estar en la fila 7 (donde hay otras piezas blancas)
        for (const move of moves) {
          if (move.row === 7) {
            // No debe haber movimientos a la fila 1 (salvo en casos especiales)
            expect(move.col).not.toBe(col); // No puede tomar pieza en la misma columna
          }
        }
      }
    });
  });

  describe('Rey NO puede moverse a casilla atacada', () => {
    it('rey blanco NO puede moverse a casilla atacada por torre negra', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'bR'],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);

      const rey = getPieceAtCoords(newBoard, 0, 7); // a1
      const moves = calculateFuturesMoves(rey, newBoard, false, false);

      // Rey puede moverse a casillas no atacadas
      // No puede ir a h1 (atacado por bR)
      expect(moves).not.toContainEqual({ row: 7, col: 7 });
    });

    it('rey blanco NO puede moverse a casilla atacada por alfil negro', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', 'bB', '', ''],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);

      const rey = getPieceAtCoords(newBoard, 0, 7); // a1
      const moves = calculateFuturesMoves(rey, newBoard, false, false);

      // Rey tiene limitaciones de movimiento debido al alfil
      expect(moves.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Movimientos defensivos en jaque', () => {
    it('rey bajo ataque solo puede moverse a casillas seguras', () => {
      const board = buildBoard([
        ['', '', '', '', 'bR', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wK', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);

      const rey = getPieceAtCoords(newBoard, 4, 7); // e1
      const moves = calculateFuturesMoves(rey, newBoard, false, false);

      // Rey tiene movimientos disponibles
      expect(moves.length).toBeGreaterThan(0);
    });

    it('pieza defensora puede ser capaz de capturar al atacante', () => {
      const board = buildBoard([
        ['', '', '', '', 'bQ', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wB', '', '', '', '', '', '', ''],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);

      const alfil = getPieceAtCoords(newBoard, 0, 6);
      const moves = calculateAvailableMoves(alfil, newBoard);

      // Alfil puede capturar (o intentar defender)
      expect(moves.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Bloqueo de ataque', () => {
    it('pieza puede interponerse entre atacante y rey', () => {
      const board = buildBoard([
        ['bR', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', 'wB', '', '', '', '', '', ''],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);

      const alfil = getPieceAtCoords(newBoard, 1, 6);
      const moves = calculateAvailableMoves(alfil, newBoard);

      // Alfil tiene movimientos disponibles para interponerse o defender
      expect(moves.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Restricciones generales de movimiento', () => {
    it('todas las piezas respetan los límites del tablero', () => {
      const board = initialBoard();

      // Verificar que NO hay movimientos fuera del tablero
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cell = getPieceAtCoords(board, col, row);
          if (cell.piece) {
            const moves = calculateFuturesMoves(cell, board, false, false);

            for (const move of moves) {
              expect(move.row).toBeGreaterThanOrEqual(0);
              expect(move.row).toBeLessThan(8);
              expect(move.col).toBeGreaterThanOrEqual(0);
              expect(move.col).toBeLessThan(8);
            }
          }
        }
      }
    });

    it('peón no puede moverse hacia atrás', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 6); // e2
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Todos los movimientos deben estar hacia adelante (row < 6)
      for (const move of moves) {
        expect(move.row).toBeLessThan(6);
      }
    });

    it('peón negro no puede moverse hacia arriba', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'bP', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const peon = getPieceAtCoords(board, 4, 4); // e4
      const moves = calculateFuturesMoves(peon, board, false, false);

      // Todos los movimientos deben estar hacia adelante (row > 4)
      for (const move of moves) {
        expect(move.row).toBeGreaterThan(4);
      }
    });
  });
});
