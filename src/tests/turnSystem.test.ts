import { describe, expect, it } from 'vitest';
import { executeTurnMove, initializeGame } from '../engine/gameEngine';
import { getValidMoveTargets } from '../engine/jackLogic';

describe('Turn Management & Game Loop', () => {
  it('should initialize game state correctly and cycle turns after valid moves', () => {
    const game = initializeGame({
      gameMode: '2_player',
      aiDifficulty: 'medium',
      playerNames: ['Alice', 'Bob'],
    });

    expect(game.players.length).toBe(2);
    expect(game.currentPlayerIndex).toBe(0);
    expect(game.turnNumber).toBe(1);

    const player1 = game.players[0];

    // Find the first card in hand that has valid targets on the empty board (e.g. normal card or 2-eyed jack)
    let cardToPlay = player1.hand[0];
    let targets = getValidMoveTargets(cardToPlay, game.board, player1.teamId);

    if (targets.length === 0) {
      cardToPlay = player1.hand.find(c => getValidMoveTargets(c, game.board, player1.teamId).length > 0) || cardToPlay;
      targets = getValidMoveTargets(cardToPlay, game.board, player1.teamId);
    }

    expect(targets.length).toBeGreaterThan(0);

    const target = targets[0];
    const nextState = executeTurnMove(game, cardToPlay.id, target.row, target.col);

    expect(nextState.currentPlayerIndex).toBe(1); // Turn passed to player 2
    expect(nextState.turnNumber).toBe(2);
    expect(nextState.board[target.row][target.col].chip?.playerId).toBe(player1.id);
  });
});
