import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../engine/boardLayout';
import { createDeck, isCardDead } from '../engine/deck';
import { getValidMoveTargets } from '../engine/jackLogic';
import type { Card } from '../types/game';

describe('Cards & Jacks Logic', () => {
  it('should generate a 104-card deck with 4 Two-Eyed Jacks and 4 One-Eyed Jacks', () => {
    const deck = createDeck();
    expect(deck.length).toBe(104);

    const twoEyed = deck.filter(c => c.isTwoEyedJack);
    const oneEyed = deck.filter(c => c.isOneEyedJack);

    expect(twoEyed.length).toBe(4); // 2 in deck 1, 2 in deck 2
    expect(oneEyed.length).toBe(4); // 2 in deck 1, 2 in deck 2
  });

  it('should handle Two-Eyed Jack wild card valid targets (all empty non-corner spaces)', () => {
    const board = createInitialBoard();
    const twoEyedJack: Card = {
      id: 'jack-1',
      suit: 'clubs',
      rank: 'J',
      isTwoEyedJack: true,
      isOneEyedJack: false,
    };

    const targets = getValidMoveTargets(twoEyedJack, board, 0);
    expect(targets.length).toBe(96); // 100 - 4 corners = 96 empty spaces
  });

  it('should handle One-Eyed Jack remove card targets (opponent chips not in sequence)', () => {
    const board = createInitialBoard();
    const oneEyedJack: Card = {
      id: 'jack-2',
      suit: 'spades',
      rank: 'J',
      isTwoEyedJack: false,
      isOneEyedJack: true,
    };

    // Place an opponent chip (team 1) and a friendly chip (team 0)
    board[1][1].chip = { playerId: 'opp', teamId: 1, color: 'red' };
    board[1][2].chip = { playerId: 'friend', teamId: 0, color: 'blue' };

    const targets = getValidMoveTargets(oneEyedJack, board, 0);
    expect(targets.length).toBe(1);
    expect(targets[0].row).toBe(1);
    expect(targets[0].col).toBe(1);
    expect(targets[0].action).toBe('remove');
  });

  it('should detect when a card is dead (all board positions occupied)', () => {
    const board = createInitialBoard();
    const testCard: Card = {
      id: 'test-dead',
      suit: 'hearts',
      rank: '2',
      isTwoEyedJack: false,
      isOneEyedJack: false,
    };

    expect(isCardDead(testCard, board)).toBe(false);

    // Occupy both matching cells for 2 of Hearts
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = board[r][c];
        if (cell.card && cell.card.suit === 'hearts' && cell.card.rank === '2') {
          cell.chip = { playerId: 'p1', teamId: 0, color: 'blue' };
        }
      }
    }

    expect(isCardDead(testCard, board)).toBe(true);
  });
});
