import { describe, it, expect } from 'vitest';
import { isCastling } from './Castling';
import { initialBoard, getPieceAtCoords, buildBoard } from './testFixtures';

describe('Castling - Enroque', () => {
  describe('Enroque desde posición inicial', () => {
    it('enroque corto blanco retorna tablero modificado (no null)', () => {
      const board = initialBoard();
      const kingCoords = { col: 4, row: 7 }; // e1
      const destinyCoords = { col: 6, row: 7 }; // g1

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      // En posición inicial, hay piezas entre rey y torre, así que no es enroque válido
      expect(result).toBeNull();
    });

    it('enroque largo blanco retorna tablero modificado (no null)', () => {
      const board = initialBoard();
      const kingCoords = { col: 4, row: 7 }; // e1
      const destinyCoords = { col: 2, row: 7 }; // c1

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      // En posición inicial, hay piezas entre rey y torre, así que no es enroque válido
      expect(result).toBeNull();
    });

    it('enroque negro corto retorna null en posición inicial (bloqueado)', () => {
      const board = initialBoard();
      const kingCoords = { col: 4, row: 0 }; // e8
      const destinyCoords = { col: 6, row: 0 }; // g8

      const result = isCastling(kingCoords, destinyCoords, board, 'B');
      expect(result).toBeNull();
    });
  });

  describe('Enroque en posición especial (sin obstáculos)', () => {
    it('enroque corto blanco es válido sin piezas intermedias', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', '', 'wR'],
      ]);

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 6, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).not.toBeNull();

      if (result) {
        // Torre debe estar en f1
        expect(result[7][5].piece).toBe('wR');
        expect(result[7][5].hasMoved).toBe(true);
        // Original a1 debe estar vacío
        expect(result[7][7].piece).toBe('wR');
      }
    });

    it('enroque corto negro es válido sin piezas intermedias', () => {
      const board = buildBoard([
        ['bR', '', '', '', 'bK', '', '', 'bR'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]);

      const kingCoords = { col: 4, row: 0 };
      const destinyCoords = { col: 6, row: 0 };

      const result = isCastling(kingCoords, destinyCoords, board, 'B');
      expect(result).not.toBeNull();

      if (result) {
        // Torre debe estar en f8
        expect(result[0][5].piece).toBe('bR');
        expect(result[0][5].hasMoved).toBe(true);
      }
    });

    it('enroque largo blanco es válido sin piezas intermedias', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', '', 'wR'],
      ]);

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 2, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).not.toBeNull();

      if (result) {
        // Torre debe estar en d1
        expect(result[7][3].piece).toBe('wR');
        expect(result[7][3].hasMoved).toBe(true);
      }
    });
  });

  describe('Enroque INVÁLIDO - Rey movido', () => {
    it('NO es enroque si rey ya movió', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', '', 'wR'],
      ]);

      const rey = getPieceAtCoords(board, 4, 7);
      rey.hasMoved = true;

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 6, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });
  });

  describe('Enroque INVÁLIDO - Torre movida', () => {
    it('NO es enroque si torre ya movió (kingside)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', '', 'wR'],
      ]);

      const rook = getPieceAtCoords(board, 7, 7);
      rook.hasMoved = true;

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 6, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });

    it('NO es enroque si torre ya movió (queenside)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', '', 'wR'],
      ]);

      const rook = getPieceAtCoords(board, 0, 7);
      rook.hasMoved = true;

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 2, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });
  });

  describe('Enroque INVÁLIDO - Hay piezas intermedias', () => {
    it('NO es enroque si hay pieza entre rey y torre (kingside)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', 'wB', 'wR'],
      ]);

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 6, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });

    it('NO es enroque si hay pieza entre rey y torre (queenside)', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', 'wN', '', '', 'wK', '', '', 'wR'],
      ]);

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 2, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });
  });

  describe('Casos edge', () => {
    it('NO es enroque si rey no está en e-file', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', 'wK', '', '', '', '', 'wR'],
      ]);

      const kingCoords = { col: 2, row: 7 };
      const destinyCoords = { col: 0, row: 7 };

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });

    it('NO es enroque si destino no es col 2 o 6', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wR', '', '', '', 'wK', '', '', 'wR'],
      ]);

      const kingCoords = { col: 4, row: 7 };
      const destinyCoords = { col: 5, row: 7 }; // Destino no válido

      const result = isCastling(kingCoords, destinyCoords, board, 'W');
      expect(result).toBeNull();
    });
  });
});
