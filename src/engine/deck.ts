import type { BoardCell, Card, Player, Rank, Suit } from '../types/game';

export function createDeck(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (let deckNum = 1; deckNum <= 2; deckNum++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        const id = `${suit}-${rank}-deck${deckNum}`;
        const isTwoEyed = rank === 'J' && (suit === 'clubs' || suit === 'diamonds');
        const isOneEyed = rank === 'J' && (suit === 'spades' || suit === 'hearts');

        deck.push({
          id,
          suit,
          rank,
          isTwoEyedJack: isTwoEyed,
          isOneEyedJack: isOneEyed,
        });
      }
    }
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getHandSize(playerCount: number): number {
  if (playerCount === 2) return 7;
  if (playerCount === 3) return 6;
  if (playerCount === 4) return 6;
  return 6;
}

export function dealInitialCards(players: Player[], deck: Card[]): { updatedPlayers: Player[]; remainingDeck: Card[] } {
  const deckCopy = [...deck];
  const handSize = getHandSize(players.length);

  const updatedPlayers = players.map(p => {
    const hand: Card[] = [];
    for (let i = 0; i < handSize; i++) {
      if (deckCopy.length > 0) {
        hand.push(deckCopy.pop()!);
      }
    }
    return { ...p, hand };
  });

  return { updatedPlayers, remainingDeck: deckCopy };
}

export function isCardDead(card: Card, board: BoardCell[][]): boolean {
  if (card.isTwoEyedJack || card.isOneEyedJack) {
    return false;
  }

  const matchingCells: BoardCell[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = board[r][c];
      if (cell.card && cell.card.suit === card.suit && cell.card.rank === card.rank) {
        matchingCells.push(cell);
      }
    }
  }

  if (matchingCells.length === 0) return true;
  return matchingCells.every(cell => cell.chip !== null);
}
