import type {
  AIDifficulty,
  BoardCell,
  Card,
  GameLogEntry,
  GameMode,
  GameState,
  Player,
  PlayerColor,
} from '../types/game';
import { createInitialBoard } from './boardLayout';
import { createDeck, dealInitialCards, isCardDead, shuffleDeck } from './deck';
import { getValidMoveTargets } from './jackLogic';
import { detectNewSequences } from './sequenceDetector';

export interface SetupOptions {
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerNames: string[];
  playerColors?: PlayerColor[];
}

export function initializeGame(options: SetupOptions): GameState {
  const { gameMode, aiDifficulty, playerNames } = options;

  let players: Player[] = [];
  let teamsCount = 2;
  let requiredSequencesToWin = 2;

  if (gameMode === 'vs_computer') {
    teamsCount = 2;
    requiredSequencesToWin = 2;
    players = [
      {
        id: 'player-1',
        name: playerNames[0] || 'Player 1',
        type: 'human',
        teamId: 0,
        color: 'blue',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
      {
        id: 'player-2',
        name: 'Computer (' + aiDifficulty.toUpperCase() + ')',
        type: 'computer',
        teamId: 1,
        color: 'red',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
    ];
  } else if (gameMode === '2_player') {
    teamsCount = 2;
    requiredSequencesToWin = 2;
    players = [
      {
        id: 'player-1',
        name: playerNames[0] || 'Player 1',
        type: 'human',
        teamId: 0,
        color: 'blue',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
      {
        id: 'player-2',
        name: playerNames[1] || 'Player 2',
        type: 'human',
        teamId: 1,
        color: 'red',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
    ];
  } else if (gameMode === '3_player') {
    teamsCount = 3;
    requiredSequencesToWin = 1;
    players = [
      {
        id: 'player-1',
        name: playerNames[0] || 'Player 1',
        type: 'human',
        teamId: 0,
        color: 'blue',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
      {
        id: 'player-2',
        name: playerNames[1] || 'Player 2',
        type: 'human',
        teamId: 1,
        color: 'red',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
      {
        id: 'player-3',
        name: playerNames[2] || 'Player 3',
        type: 'human',
        teamId: 2,
        color: 'green',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
    ];
  } else if (gameMode === '4_player') {
    teamsCount = 4;
    requiredSequencesToWin = 1;
    players = [
      {
        id: 'player-1',
        name: playerNames[0] || 'Player 1',
        type: 'human',
        teamId: 0,
        color: 'blue',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
      {
        id: 'player-2',
        name: playerNames[1] || 'Player 2',
        type: 'human',
        teamId: 1,
        color: 'red',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
      {
        id: 'player-3',
        name: playerNames[2] || 'Player 3',
        type: 'human',
        teamId: 2,
        color: 'green',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
      {
        id: 'player-4',
        name: playerNames[3] || 'Player 4',
        type: 'human',
        teamId: 3,
        color: 'yellow',
        hand: [],
        chipsRemaining: 36,
        sequencesCount: 0,
      },
    ];
  } else if (gameMode === 'team') {
    // 4 players, 2 teams (Team 0: P1 & P3 Blue, Team 1: P2 & P4 Red)
    teamsCount = 2;
    requiredSequencesToWin = 2;
    players = [
      {
        id: 'player-1',
        name: (playerNames[0] || 'Player 1') + ' (Team A)',
        type: 'human',
        teamId: 0,
        color: 'blue',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
      {
        id: 'player-2',
        name: (playerNames[1] || 'Player 2') + ' (Team B)',
        type: 'human',
        teamId: 1,
        color: 'red',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
      {
        id: 'player-3',
        name: (playerNames[2] || 'Player 3') + ' (Team A)',
        type: 'human',
        teamId: 0,
        color: 'blue',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
      {
        id: 'player-4',
        name: (playerNames[3] || 'Player 4') + ' (Team B)',
        type: 'human',
        teamId: 1,
        color: 'red',
        hand: [],
        chipsRemaining: 48,
        sequencesCount: 0,
      },
    ];
  }

  const rawDeck = createDeck();
  const shuffledDeck = shuffleDeck(rawDeck);
  const { updatedPlayers, remainingDeck } = dealInitialCards(players, shuffledDeck);
  const board = createInitialBoard();

  const initialLogs: GameLogEntry[] = [
    {
      id: `log-${Date.now()}-init`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: 'system',
      playerName: 'System',
      playerColor: 'blue',
      text: `Game started in ${gameMode.replace('_', ' ').toUpperCase()} mode. Goal: ${requiredSequencesToWin} Sequence(s).`,
      type: 'system',
    },
  ];

  return {
    board,
    players: updatedPlayers,
    currentPlayerIndex: 0,
    deck: remainingDeck,
    discardPile: [],
    gameMode,
    teamsCount,
    requiredSequencesToWin,
    turnNumber: 1,
    sequences: [],
    winner: null,
    status: 'playing',
    selectedCardId: null,
    lastMove: null,
    logs: initialLogs,
    settings: {
      soundEnabled: true,
      musicEnabled: false,
      animationsEnabled: true,
      aiDifficulty,
    },
    isAiThinking: false,
  };
}

export function executeTurnMove(
  state: GameState,
  cardId: string,
  targetRow: number,
  targetCol: number
): GameState {
  if (state.status === 'game_over') return state;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const card = currentPlayer.hand.find(c => c.id === cardId);
  if (!card) return state;

  const targets = getValidMoveTargets(card, state.board, currentPlayer.teamId);
  const matchedTarget = targets.find(t => t.row === targetRow && t.col === targetCol);

  if (!matchedTarget) return state;

  // 1. Update Board
  const updatedBoard = state.board.map(r => r.map(c => ({ ...c, chip: c.chip ? { ...c.chip } : null })));
  const targetCell = updatedBoard[targetRow][targetCol];

  if (matchedTarget.action === 'place') {
    targetCell.chip = {
      playerId: currentPlayer.id,
      teamId: currentPlayer.teamId,
      color: currentPlayer.color,
    };
  } else if (matchedTarget.action === 'remove') {
    targetCell.chip = null;
  }

  // 2. Card Management (Remove card from hand, add to discard pile, draw new card)
  const newHand = currentPlayer.hand.filter(c => c.id !== cardId);
  const newDiscardPile = [...state.discardPile, card];
  const newDeck = [...state.deck];

  if (newDeck.length > 0) {
    const drawnCard = newDeck.pop()!;
    newHand.push(drawnCard);
  }

  // 3. Update Current Player
  const updatedCurrentPlayer: Player = {
    ...currentPlayer,
    hand: newHand,
    chipsRemaining: matchedTarget.action === 'place' ? Math.max(0, currentPlayer.chipsRemaining - 1) : currentPlayer.chipsRemaining,
  };

  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex ? updatedCurrentPlayer : p
  );

  // 4. Check Sequence Detection
  const { newSequences, updatedBoard: finalBoard } = detectNewSequences(
    updatedBoard,
    currentPlayer.teamId,
    currentPlayer.id,
    state.sequences
  );

  const allSequences = [...state.sequences, ...newSequences];

  // Update sequences count for team/player
  if (newSequences.length > 0) {
    newSequences.forEach(seq => {
      updatedPlayers.forEach(p => {
        if (p.teamId === seq.teamId) {
          p.sequencesCount += 1;
        }
      });
    });
  }

  // 5. Check Win Condition
  // Calculate total sequences per team
  const teamSeqCounts: Record<number, number> = {};
  allSequences.forEach(seq => {
    teamSeqCounts[seq.teamId] = (teamSeqCounts[seq.teamId] || 0) + 1;
  });

  let winner = null;
  let newStatus: GameState['status'] = state.status;

  const winningTeamId = Object.keys(teamSeqCounts).find(
    tId => teamSeqCounts[Number(tId)] >= state.requiredSequencesToWin
  );

  if (winningTeamId !== undefined) {
    const winnerTeam = Number(winningTeamId);
    const winningPlayers = updatedPlayers.filter(p => p.teamId === winnerTeam);
    newStatus = 'game_over';
    winner = {
      teamId: winnerTeam,
      winningPlayers,
      reason: `Completed ${state.requiredSequencesToWin} Sequence(s)!`,
    };
  }

  // 6. Log entry
  const cardSymbol = getCardDisplaySymbol(card);
  let actionText = '';
  if (card.isTwoEyedJack) {
    actionText = `played Two-Eyed Jack (${cardSymbol}) and placed a chip at (${targetRow + 1}, ${targetCol + 1}).`;
  } else if (card.isOneEyedJack) {
    actionText = `played One-Eyed Jack (${cardSymbol}) and removed an opponent's chip at (${targetRow + 1}, ${targetCol + 1}).`;
  } else {
    actionText = `played ${cardSymbol} and placed a chip at (${targetRow + 1}, ${targetCol + 1}).`;
  }

  const newLogs: GameLogEntry[] = [
    {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      playerColor: currentPlayer.color,
      text: actionText,
      type: card.isOneEyedJack || card.isTwoEyedJack ? 'jack' : 'move',
    },
    ...state.logs,
  ];

  if (newSequences.length > 0) {
    newLogs.unshift({
      id: `log-${Date.now()}-seq`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      playerColor: currentPlayer.color,
      text: `🎉 CREATED A SEQUENCE of 5!`,
      type: 'sequence',
    });
  }

  if (winner) {
    const winnerNames = winner.winningPlayers.map(p => p.name).join(' & ');
    newLogs.unshift({
      id: `log-${Date.now()}-win`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: currentPlayer.id,
      playerName: winnerNames,
      playerColor: currentPlayer.color,
      text: `🏆 ${winnerNames} WON THE GAME!`,
      type: 'win',
    });
  }

  // 7. Advance Turn
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % updatedPlayers.length;

  return {
    ...state,
    board: finalBoard,
    players: updatedPlayers,
    currentPlayerIndex: newStatus === 'game_over' ? state.currentPlayerIndex : nextPlayerIndex,
    deck: newDeck,
    discardPile: newDiscardPile,
    turnNumber: state.turnNumber + 1,
    sequences: allSequences,
    winner,
    status: newStatus,
    selectedCardId: null,
    lastMove: {
      row: targetRow,
      col: targetCol,
      card,
      playerId: currentPlayer.id,
      action: matchedTarget.action,
    },
    logs: newLogs,
  };
}

export function discardDeadCardInHand(state: GameState, cardId: string): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const card = currentPlayer.hand.find(c => c.id === cardId);
  if (!card) return state;

  if (!isCardDead(card, state.board)) return state;

  // Discard dead card and draw replacement
  const newHand = currentPlayer.hand.filter(c => c.id !== cardId);
  const newDiscardPile = [...state.discardPile, card];
  const newDeck = [...state.deck];

  if (newDeck.length > 0) {
    const drawn = newDeck.pop()!;
    newHand.push(drawn);
  }

  const updatedPlayer = { ...currentPlayer, hand: newHand };
  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex ? updatedPlayer : p
  );

  const cardSymbol = getCardDisplaySymbol(card);
  const newLogs: GameLogEntry[] = [
    {
      id: `log-${Date.now()}-discard`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      playerColor: currentPlayer.color,
      text: `discarded a dead card (${cardSymbol}) and drew a replacement.`,
      type: 'discard',
    },
    ...state.logs,
  ];

  return {
    ...state,
    players: updatedPlayers,
    deck: newDeck,
    discardPile: newDiscardPile,
    selectedCardId: null,
    logs: newLogs,
  };
}

export function getCardDisplaySymbol(card: Card): string {
  const suitSymbols: Record<string, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };
  return `${card.rank}${suitSymbols[card.suit] || card.suit}`;
}
