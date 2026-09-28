import type { BoardCell, Card } from '../types/game';

export interface ValidMoveTarget {
  row: number;
  col: number;
  action: 'place' | 'remove';
}

export function getValidMoveTargets(card: Card, board: BoardCell[][], currentTeamId: number): ValidMoveTarget[] {
  const targets: ValidMoveTarget[] = [];

  if (card.isTwoEyedJack) {
    // Wild card: can place a chip on any empty, non-corner space
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = board[r][c];
        if (!cell.isCorner && cell.chip === null) {
          targets.push({ row: r, col: c, action: 'place' });
        }
      }
    }
    return targets;
  }

  if (card.isOneEyedJack) {
    // Anti-wild card: can remove an opponent's chip, provided it is NOT locked in a sequence
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = board[r][c];
        if (!cell.isCorner && cell.chip !== null) {
          if (cell.chip.teamId !== currentTeamId && !cell.chip.isPartOfSequence) {
            targets.push({ row: r, col: c, action: 'remove' });
          }
        }
      }
    }
    return targets;
  }

  // Normal Card: find matching empty cells on the board
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = board[r][c];
      if (!cell.isCorner && cell.card) {
        if (cell.card.suit === card.suit && cell.card.rank === card.rank) {
          if (cell.chip === null) {
            targets.push({ row: r, col: c, action: 'place' });
          }
        }
      }
    }
  }

  return targets;
}
