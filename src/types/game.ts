export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export const CARD_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const CARD_RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isTwoEyedJack: boolean;
  isOneEyedJack: boolean;
}

export type PlayerType = 'human' | 'computer';
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  teamId: number;
  color: PlayerColor;
  hand: Card[];
  chipsRemaining: number;
  sequencesCount: number;
}

export interface BoardCell {
  row: number;
  col: number;
  card: { suit: Suit; rank: Rank } | null;
  isCorner: boolean;
  chip: {
    playerId: string;
    teamId: number;
    color: PlayerColor;
    isPartOfSequence?: boolean;
  } | null;
  sequenceId?: string;
}

export interface Sequence {
  id: string;
  teamId: number;
  playerId: string;
  cells: { row: number; col: number }[];
  type: 'horizontal' | 'vertical' | 'diagonal';
}

export type GameMode = 'vs_computer' | '2_player' | '3_player' | '4_player' | 'team';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  aiDifficulty: AIDifficulty;
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  playerId: string;
  playerName: string;
  playerColor: PlayerColor;
  text: string;
  type: 'move' | 'jack' | 'sequence' | 'win' | 'system' | 'discard';
}

export interface GameState {
  board: BoardCell[][];
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  gameMode: GameMode;
  teamsCount: number;
  requiredSequencesToWin: number;
  turnNumber: number;
  sequences: Sequence[];
  winner: {
    teamId: number;
    winningPlayers: Player[];
    reason: string;
  } | null;
  status: 'home' | 'setup' | 'playing' | 'game_over';
  selectedCardId: string | null;
  lastMove: {
    row: number;
    col: number;
    card: Card;
    playerId: string;
    action: 'place' | 'remove';
  } | null;
  logs: GameLogEntry[];
  settings: GameSettings;
  isAiThinking: boolean;
}

export interface Move {
  card: Card;
  targetRow: number;
  targetCol: number;
  action: 'place' | 'remove';
}
