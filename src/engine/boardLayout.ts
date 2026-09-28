import type { BoardCell, Rank, Suit } from '../types/game';

type CardDef = { suit: Suit; rank: Rank };

function generateMixedSequenceLayout(): (CardDef | 'CORNER')[][] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Q', 'K', 'A'];

  const allCards: CardDef[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      allCards.push({ suit, rank });
      allCards.push({ suit, rank });
    }
  }

  let seed = 42;
  const prng = () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffledCards = [...allCards];
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }

  const grid: (CardDef | 'CORNER')[][] = Array(10)
    .fill(null)
    .map(() => Array(10).fill('CORNER'));

  let cardIdx = 0;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r === 0 && c === 0) || (r === 0 && c === 9) || (r === 9 && c === 0) || (r === 9 && c === 9)) {
        grid[r][c] = 'CORNER';
      } else {
        grid[r][c] = shuffledCards[cardIdx++];
      }
    }
  }

  return grid;
}

const CANONICAL_BOARD_LAYOUT = generateMixedSequenceLayout();

export function getCanonicalLayout(): (CardDef | 'CORNER')[][] {
  return CANONICAL_BOARD_LAYOUT;
}

export function createInitialBoard(): BoardCell[][] {
  const layout = getCanonicalLayout();
  return layout.map((rowItems, r) =>
    rowItems.map((cellItem, c) => {
      const isCorner = cellItem === 'CORNER';
      return {
        row: r,
        col: c,
        isCorner,
        card: isCorner ? null : (cellItem as CardDef),
        chip: null,
      };
    })
  );
}

export function validateBoardLayout(): boolean {
  const layout = getCanonicalLayout();
  const counts: Record<string, number> = {};
  let cornerCount = 0;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const item = layout[r][c];
      if (item === 'CORNER') {
        cornerCount++;
      } else {
        const key = `${item.suit}-${item.rank}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }

  if (cornerCount !== 4) return false;

  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Q', 'K', 'A'];

  for (const suit of suits) {
    for (const rank of ranks) {
      const key = `${suit}-${rank}`;
      if (counts[key] !== 2) {
        return false;
      }
    }
  }
  return true;
}
