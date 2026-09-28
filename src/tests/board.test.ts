import { describe, expect, it } from 'vitest';
import { createInitialBoard, validateBoardLayout } from '../engine/boardLayout';
import { getValidMoveTargets } from '../engine/jackLogic';
import type { Card } from '../types/game';

describe('Board Layout and Positions', () => {
  it('should create a 10x10 board with 4 corner spaces', () => {
    const board = createInitialBoard();
    expect(board.length).toBe(10);
    expect(board[0].length).toBe(10);

    const corners = [
      board[0][0],
      board[0][9],
      board[9][0],
      board[9][9],
    ];

    corners.forEach(corner => {
      expect(corner.isCorner).toBe(true);
      expect(corner.card).toBeNull();
    });
  });

  it('should validate that all 48 non-Jack cards appear exactly twice', () => {
    const isValid = validateBoardLayout();
    expect(isValid).toBe(true);
  });

  it('should recognize unoccupied normal positions as valid targets for matching card', () => {
    const board = createInitialBoard();
    const testCard: Card = {
      id: 'test-card-1',
      suit: 'diamonds',
      rank: '6',
      isTwoEyedJack: false,
      isOneEyedJack: false,
    };

    const targets = getValidMoveTargets(testCard, board, 0);
    expect(targets.length).toBe(2); // Appears twice on board
    expect(targets[0].action).toBe('place');
  });

  it('should prevent placing a chip on an occupied position with normal card', () => {
    const board = createInitialBoard();
    const testCard: Card = {
      id: 'test-card-1',
      suit: 'diamonds',
      rank: '6',
      isTwoEyedJack: false,
      isOneEyedJack: false,
    };

    const targets = getValidMoveTargets(testCard, board, 0);
    expect(targets.length).toBe(2);

    // Occupy the first target cell
    board[targets[0].row][targets[0].col].chip = {
      playerId: 'p1',
      teamId: 0,
      color: 'blue',
    };

    const newTargets = getValidMoveTargets(testCard, board, 0);
    expect(newTargets.length).toBe(1); // Only 1 remaining valid target
  });
});
