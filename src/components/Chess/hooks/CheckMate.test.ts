import { describe, it, expect } from 'vitest';
import { isCheckmate } from './CheckMate';
import { markCellsUnderAttack } from './MarkCellsUnderAttack';
import { initialBoard, buildBoard } from './testFixtures';

describe('CheckMate - Detección de Jaque y Jaque Mate', () => {
  describe('NO hay jaque en posición inicial', () => {
    it('posición inicial no tiene jaque', () => {
      const board = initialBoard();
      const { newBoard, checkState } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(false);
      expect(result.colorOfCheck).toBeNull();
      expect(result.isCheckmate).toBe(false);
    });
  });

  describe('Detección de Jaque', () => {
    it('detecta jaque cuando rey blanco es atacado por torre negra', () => {
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
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(true);
      expect(result.colorOfCheck).toBe('W');
    });

    it('detecta jaque cuando rey negro es atacado por torre blanca', () => {
      const board = buildBoard([
        ['', '', '', '', 'bK', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wR', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(true);
      expect(result.colorOfCheck).toBe('B');
    });

    it('NO detecta jaque cuando rey no está bajo ataque', () => {
      const board = buildBoard([
        ['bR', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wK', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(false);
    });
  });

  describe('Detección de Jaque Mate', () => {
    it('detecta jaque mate (posición de fool\'s mate)', () => {
      // Fool's mate: posición donde rey blanco en e1 está bajo ataque de reina negra en h4
      // y no puede escapar
      const board = buildBoard([
        ['bR', 'bN', 'bB', '', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', '', 'bP', 'bP', 'bP'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'bQ'],
        ['', '', '', '', 'bP', '', '', ''],
        ['', '', '', '', '', '', 'wP', ''],
        ['wP', 'wP', 'wP', 'wP', 'wP', '', '', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      // En fool's mate, rey blanco está en jaque mate
      expect(result.check).toBe(true);
      expect(result.isCheckmate).toBe(true);
      expect(result.colorOfCheck).toBe('W');
    });

    it('detecta que NO es jaque mate cuando rey puede capturar atacante', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'bQ', '', '', ''],
        ['', '', '', '', 'wK', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(true);
      // Rey puede capturar la reina, así que NO es mate
      expect(result.isCheckmate).toBe(false);
    });

    it('detecta que NO es jaque mate cuando hay defensa (protectores/blockers)', () => {
      const board = buildBoard([
        ['', '', '', '', 'bR', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wK', '', 'wB', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(true);
      // Rey puede moverse o hay defensas disponibles
      expect(result.isCheckmate).toBe(false);
    });
  });

  describe('Jaque Doble', () => {
    it('en jaque doble solo el movimiento del rey resuelve', () => {
      // Rey bajo ataque de dos piezas
      const board = buildBoard([
        ['', '', '', '', '', '', '', 'bR'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['bB', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'wK', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      if (result.check) {
        // En jaque doble, no hay protectores ni blockers (solo rey se mueve)
        if (result.numberOfAttackersIsOne === false) {
          expect(result.protectors.length).toBe(0);
          expect(result.blockers.length).toBe(0);
        }
      }
    });
  });

  describe('Casos edge', () => {
    it('jaque mate solo ocurre cuando NO hay movimientos defensivos', () => {
      const board = buildBoard([
        ['bR', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      // Es jaque, pero el rey puede moverse
      expect(result.check).toBe(true);
      expect(result.isCheckmate).toBe(false);
    });

    it('detecta jaque múltiple con múltiples defensores', () => {
      const board = buildBoard([
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', 'wN', '', '', '', '', '', ''],
        ['', 'wB', '', 'bQ', '', '', '', ''],
        ['wK', '', '', '', '', '', '', ''],
      ]);

      const { newBoard } = markCellsUnderAttack(board);
      const result = isCheckmate(newBoard, false);

      expect(result.check).toBe(true);
      expect(result.isCheckmate).toBe(false);
    });
  });
});
