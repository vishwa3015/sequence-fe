import confetti from 'canvas-confetti';
import { Home, Play, RefreshCw, Trophy } from 'lucide-react';
import React, { useEffect } from 'react';
import { soundManager } from '../audio/soundManager';
import type { GameState } from '../types/game';

interface WinnerModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
  onMainMenu: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  gameState,
  onPlayAgain,
  onNewGame,
  onMainMenu,
}) => {
  const { winner, players, turnNumber, sequences } = gameState;

  useEffect(() => {
    if (winner) {
      soundManager.playWinFanfare();
      // Launch celebration confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [winner]);

  if (!winner) return null;

  const winnerNames = winner.winningPlayers.map(p => p.name).join(' & ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-gold p-8 rounded-3xl border border-amber-500/60 shadow-2xl max-w-lg w-full text-center space-y-6">
        
        {/* Trophy Header */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-3 animate-bounce">
            <Trophy className="w-10 h-10 text-slate-950" />
          </div>
          <h2 className="text-3xl font-black text-amber-300 tracking-tight">
            VICTORY!
          </h2>
          <p className="text-lg font-bold text-white mt-1">
            {winnerNames}
          </p>
          <span className="text-xs text-amber-400/90 font-medium mt-0.5">
            {winner.reason}
          </span>
        </div>

        {/* Statistics Summary */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px] mb-2">
            Match Statistics
          </h4>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="p-2 bg-slate-800/60 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Turns Played</span>
              <strong className="text-white text-sm">{turnNumber}</strong>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Total Sequences</span>
              <strong className="text-amber-400 text-sm">{sequences.length}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            {players.map(p => (
              <div key={p.id} className="flex justify-between items-center text-slate-300">
                <span>{p.name}</span>
                <span className="font-bold text-amber-400">{p.sequencesCount} Sequence(s)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onNewGame}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 border border-slate-700"
            >
              <Play className="w-4 h-4 text-blue-400" />
              <span>New Setup</span>
            </button>

            <button
              onClick={onMainMenu}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 border border-slate-700"
            >
              <Home className="w-4 h-4 text-rose-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
