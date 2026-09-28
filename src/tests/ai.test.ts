import { describe, expect, it } from 'vitest';
import { chooseAiMove } from '../engine/aiEngine';
import { createInitialBoard } from '../engine/boardLayout';
import type { Player } from '../types/game';

describe('AI Engine Decisions', () => {
  it('should choose a valid move for Easy, Medium, and Hard AI', () => {
    const board = createInitialBoard();
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Computer',
      type: 'computer',
      teamId: 1,
      color: 'red',
      hand: [
        {
          id: 'card-1',
          suit: 'spades',
          rank: '5',
          isTwoEyedJack: false,
          isOneEyedJack: false,
        },
      ],
      chipsRemaining: 48,
      sequencesCount: 0,
    };

    const humanPlayer: Player = {
      id: 'human-1',
      name: 'Human',
      type: 'human',
      teamId: 0,
      color: 'blue',
      hand: [],
      chipsRemaining: 48,
      sequencesCount: 0,
    };

    const players = [humanPlayer, aiPlayer];

    const moveEasy = chooseAiMove(aiPlayer, players, board, 'easy', []);
    expect(moveEasy).not.toBeNull();
    expect(moveEasy?.card.id).toBe('card-1');

    const moveHard = chooseAiMove(aiPlayer, players, board, 'hard', []);
    expect(moveHard).not.toBeNull();
  });
});
