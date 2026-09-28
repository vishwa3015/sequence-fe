import type { AIDifficulty, BoardCell, Card, Move, Player } from '../types/game';
import { getValidMoveTargets, type ValidMoveTarget } from './jackLogic';
import { detectNewSequences } from './sequenceDetector';

export function chooseAiMove(
  aiPlayer: Player,
  allPlayers: Player[],
  board: BoardCell[][],
  difficulty: AIDifficulty,
  existingSequences: any[]
): Move | null {
  const hand = aiPlayer.hand;
  if (hand.length === 0) return null;

  const validMovesWithCards: { card: Card; target: ValidMoveTarget }[] = [];

  for (const card of hand) {
    const targets = getValidMoveTargets(card, board, aiPlayer.teamId);
    for (const target of targets) {
      validMovesWithCards.push({ card, target });
    }
  }

  if (validMovesWithCards.length === 0) return null;

  // Easy AI: Pick completely random valid move
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * validMovesWithCards.length);
    const chosen = validMovesWithCards[randomIndex];
    return {
      card: chosen.card,
      targetRow: chosen.target.row,
      targetCol: chosen.target.col,
      action: chosen.target.action,
    };
  }

  // Medium & Hard AI: Evaluate moves with heuristic scoring
  let bestMove: { card: Card; target: ValidMoveTarget } | null = null;
  let bestScore = -Infinity;

  for (const candidate of validMovesWithCards) {
    const score = evaluateMoveScore(
      candidate,
      aiPlayer,
      allPlayers,
      board,
      difficulty,
      existingSequences
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = candidate;
    }
  }

  if (!bestMove) {
    const chosen = validMovesWithCards[0];
    return {
      card: chosen.card,
      targetRow: chosen.target.row,
      targetCol: chosen.target.col,
      action: chosen.target.action,
    };
  }

  return {
    card: bestMove.card,
    targetRow: bestMove.target.row,
    targetCol: bestMove.target.col,
    action: bestMove.target.action,
  };
}

function evaluateMoveScore(
  candidate: { card: Card; target: ValidMoveTarget },
  aiPlayer: Player,
  allPlayers: Player[],
  board: BoardCell[][],
  difficulty: AIDifficulty,
  existingSequences: any[]
): number {
  let score = 0;
  const { card, target } = candidate;
  const { row, col, action } = target;

  // Simulate board after candidate move
  const simulatedBoard = board.map(r => r.map(c => ({ ...c, chip: c.chip ? { ...c.chip } : null })));

  if (action === 'place') {
    simulatedBoard[row][col].chip = {
      playerId: aiPlayer.id,
      teamId: aiPlayer.teamId,
      color: aiPlayer.color,
    };
  } else if (action === 'remove') {
    simulatedBoard[row][col].chip = null;
  }

  // 1. Check if this completes a sequence for AI team (+1000 pts)
  if (action === 'place') {
    const { newSequences } = detectNewSequences(simulatedBoard, aiPlayer.teamId, aiPlayer.id, existingSequences);
    if (newSequences.length > 0) {
      score += 1000 * newSequences.length;
    }
  }

  // 2. Check if this blocks opponent sequence
  const opponentTeams = Array.from(new Set(allPlayers.filter(p => p.teamId !== aiPlayer.teamId).map(p => p.teamId)));

  for (const oppTeamId of opponentTeams) {
    if (action === 'place') {
      // Prior to placing, could opponent form a sequence at (row, col)?
      const tempBoardOpp = board.map(r => r.map(c => ({ ...c, chip: c.chip ? { ...c.chip } : null })));
      tempBoardOpp[row][col].chip = {
        playerId: 'opp',
        teamId: oppTeamId,
        color: 'red',
      };
      const { newSequences: oppSeqs } = detectNewSequences(tempBoardOpp, oppTeamId, 'opp', existingSequences);
      if (oppSeqs.length > 0) {
        score += 800; // Major block!
      }
    } else if (action === 'remove') {
      // Removing an opponent chip that broke up an opponent's 4-in-a-row
      score += 300;
    }
  }

  if (difficulty === 'hard') {
    // Strategic positioning bonuses for Hard AI

    // Corners adjacency bonus (cells near corners are highly valuable)
    const distToCorner = Math.min(
      row + col,
      row + (9 - col),
      (9 - row) + col,
      (9 - row) + (9 - col)
    );
    score += (10 - distToCorner) * 5;

    // Extend friendly chip clusters
    const adjacentFriendlyCount = countAdjacentChips(simulatedBoard, row, col, aiPlayer.teamId);
    score += adjacentFriendlyCount * 25;

    // Conserve 2-Eyed Jacks unless creating a sequence or vital block
    if (card.isTwoEyedJack && score < 700) {
      score -= 150; // Save wild card for high-value plays
    }

    // Conserve 1-Eyed Jacks unless breaking high-threat opponent chip
    if (card.isOneEyedJack && score < 250) {
      score -= 100;
    }
  }

  // Small random jitter to break ties dynamically
  score += Math.random() * 5;

  return score;
}

function countAdjacentChips(board: BoardCell[][], r: number, c: number, teamId: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
        const cell = board[nr][nc];
        if (cell.isCorner || (cell.chip && cell.chip.teamId === teamId)) {
          count++;
        }
      }
    }
  }
  return count;
}
