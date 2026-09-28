import { AlertCircle, Lock, RefreshCw } from 'lucide-react';
import React from 'react';
import { isCardDead } from '../engine/deck';
import { getValidMoveTargets } from '../engine/jackLogic';
import type { Card, GameState } from '../types/game';
import { PlayingCardComponent } from './PlayingCardComponent';

interface PlayerHandProps {
  gameState: GameState;
  selectedCardId: string | null;
  myPlayerName?: string | null; // Used for Online Multiplayer hidden hands
  onSelectCard: (cardId: string) => void;
  onDiscardDeadCard: (cardId: string) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  gameState,
  selectedCardId,
  myPlayerName,
  onSelectCard,
  onDiscardDeadCard,
}) => {
  const { players, currentPlayerIndex, board, isAiThinking } = gameState;
  const activeTurnPlayer = players[currentPlayerIndex];

  // In online mode, match player by normalized name comparison
  let displayPlayer = activeTurnPlayer;
  if (myPlayerName) {
    const normMine = myPlayerName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundMyPlayer = players.find(p => {
      const normP = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normP.includes(normMine) || normMine.includes(normP);
    });
    if (foundMyPlayer) {
      displayPlayer = foundMyPlayer;
    }
  }

  const isMyTurn = activeTurnPlayer.id === displayPlayer.id;
  const isHumanPlayer = displayPlayer.type === 'human';

  const getColorBgClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'border-rose-500/50 bg-rose-950/40 text-rose-300';
      case 'blue':
        return 'border-blue-500/50 bg-blue-950/40 text-blue-300';
      case 'green':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300';
      case 'yellow':
        return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
      default:
        return 'border-slate-500/50 bg-slate-900/40 text-slate-300';
    }
  };

  return (
    <div className={`glass-panel p-3 rounded-2xl border ${getColorBgClass(displayPlayer.color)} shadow-lg`}>
      {/* Player Hand Banner */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isMyTurn ? (
            <span className="w-3 h-3 rounded-full animate-ping bg-emerald-400" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
          <h3 className="font-extrabold text-sm md:text-base tracking-wide flex items-center gap-2">
            <span>{displayPlayer.name}'s Hand</span>
            {isMyTurn ? (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                YOUR TURN!
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-medium animate-pulse">
                (Waiting for {activeTurnPlayer.name}...)
              </span>
            )}
            {isAiThinking && (
              <span className="text-xs text-amber-400 animate-pulse font-medium">
                (AI Thinking...)
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span>Chips Left: <strong className="text-white">{displayPlayer.chipsRemaining}</strong></span>
          <span>Sequences: <strong className="text-amber-400">{displayPlayer.sequencesCount}</strong></span>
        </div>
      </div>

      {/* Cards Scrollable Row */}
      <div className="flex items-center justify-center space-x-2 md:space-x-3 py-1 overflow-x-auto min-h-[110px]">
        {displayPlayer.hand.map(card => {
          const isSelected = card.id === selectedCardId;
          const validTargets = getValidMoveTargets(card, board, displayPlayer.teamId);
          const dead = isCardDead(card, board);
          const isPlayable = isMyTurn && isHumanPlayer && !dead && validTargets.length > 0;

          return (
            <div key={card.id} className="relative flex flex-col items-center group">
              <PlayingCardComponent
                card={card}
                isSelected={isSelected}
                isPlayable={isPlayable}
                onClick={() => isPlayable && onSelectCard(card.id)}
                size="md"
              />

              {/* Dead Card Discard Action */}
              {dead && isMyTurn && isHumanPlayer && (
                <button
                  onClick={() => onDiscardDeadCard(card.id)}
                  title="Card is Dead (all positions occupied). Click to discard & draw."
                  className="mt-1 flex items-center space-x-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded shadow-md transition-all animate-pulse"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Discard</span>
                </button>
              )}
            </div>
          );
        })}

        {displayPlayer.hand.length === 0 && (
          <div className="text-xs text-slate-400 italic py-4">No cards in hand</div>
        )}
      </div>

      {/* Helper instruction */}
      {isMyTurn && isHumanPlayer && selectedCardId && (
        <div className="mt-2 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-1 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Click highlighted cell on the board to place chip or remove opponent chip.</span>
        </div>
      )}
    </div>
  );
};
