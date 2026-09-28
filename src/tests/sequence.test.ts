import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../engine/boardLayout';
import { detectNewSequences } from '../engine/sequenceDetector';

describe('Sequence Detection Engine', () => {
  it('should detect a horizontal sequence of 5 chips', () => {
    const board = createInitialBoard();
    // Place 5 chips horizontally for team 0 at row 1, cols 1..5
    for (let c = 1; c <= 5; c++) {
      board[1][c].chip = { playerId: 'p1', teamId: 0, color: 'blue' };
    }

    const { newSequences, updatedBoard } = detectNewSequences(board, 0, 'p1', []);
    expect(newSequences.length).toBe(1);
    expect(newSequences[0].type).toBe('horizontal');

    // Check that chips are locked in sequence
    for (let c = 1; c <= 5; c++) {
      expect(updatedBoard[1][c].chip?.isPartOfSequence).toBe(true);
    }
  });

  it('should detect vertical and diagonal sequences', () => {
    const board = createInitialBoard();

    // Vertical for team 1 at col 2, rows 1..5
    for (let r = 1; r <= 5; r++) {
      board[r][2].chip = { playerId: 'p2', teamId: 1, color: 'red' };
    }

    const { newSequences } = detectNewSequences(board, 1, 'p2', []);
    expect(newSequences.length).toBe(1);
    expect(newSequences[0].type).toBe('vertical');
  });

  it('should allow corner spaces to count as free spaces towards sequences', () => {
    const board = createInitialBoard();
    // Top-left corner is at (0,0) which is free!
    // Place 4 chips next to it at row 0, cols 1..4
    for (let c = 1; c <= 4; c++) {
      board[0][c].chip = { playerId: 'p1', teamId: 0, color: 'blue' };
    }

    const { newSequences } = detectNewSequences(board, 0, 'p1', []);
    expect(newSequences.length).toBe(1);
    expect(newSequences[0].cells).toContainEqual({ row: 0, col: 0 });
  });

  it('should handle 9 chips in a row creating 2 overlapping sequences', () => {
    const board = createInitialBoard();
    // Place 9 chips horizontally at row 2, cols 1..9
    for (let c = 1; c <= 9; c++) {
      board[2][c].chip = { playerId: 'p1', teamId: 0, color: 'blue' };
    }

    const { newSequences } = detectNewSequences(board, 0, 'p1', []);
    expect(newSequences.length).toBe(2);
  });
});
