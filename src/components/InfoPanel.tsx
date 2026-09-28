import { BookOpen, Layers, Settings, TestTube, Trophy } from 'lucide-react';
import React from 'react';
import type { GameState, PlayerColor } from '../types/game';

interface InfoPanelProps {
  gameState: GameState;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenTests: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  gameState,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenTests,
}) => {
  const { players, currentPlayerIndex, deck, discardPile, turnNumber, requiredSequencesToWin, isAiThinking } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  const getColorDot = (color: PlayerColor) => {
    switch (color) {
      case 'red': return 'bg-rose-500 shadow-rose-500/50';
      case 'blue': return 'bg-blue-500 shadow-blue-500/50';
      case 'green': return 'bg-emerald-500 shadow-emerald-500/50';
      case 'yellow': return 'bg-amber-400 shadow-amber-400/50';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-700/80 shadow-xl flex flex-col justify-between space-y-4">
      {/* Current Turn Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-3">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Current Turn</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            Turn #{turnNumber}
          </span>
        </div>

        <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <div className={`w-4 h-4 rounded-full shadow-md ${getColorDot(currentPlayer.color)} ${isAiThinking ? 'animate-bounce' : ''}`} />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm text-slate-100 flex items-center justify-between">
              <span>{currentPlayer.name}</span>
              <span className="text-xs text-amber-400">{currentPlayer.type === 'computer' ? '🤖 AI' : '👤 Human'}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {isAiThinking ? 'Thinking of next move...' : 'Select a card from hand to play'}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard / Player Stats */}
      <div>
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Players & Progress</span>
          <span className="text-[10px] text-amber-400 font-normal">Goal: {requiredSequencesToWin} Sequence(s)</span>
        </h5>

        <div className="space-y-1.5">
          {players.map((p, idx) => {
            const isCurrent = idx === currentPlayerIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-md text-xs font-semibold border transition-all ${
                  isCurrent
                    ? 'bg-slate-800 border-amber-500/50 text-white shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getColorDot(p.color)}`} />
                  <span className="truncate max-w-[110px]">{p.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span>Chips: {p.chipsRemaining}</span>
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    <Trophy className="w-3 h-3" />
                    {p.sequencesCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deck & Discard Pile Status */}
      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Deck Cards: <strong className="text-white">{deck.length}</strong></span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Discarded: <span className="text-slate-200">{discardPile.length}</span>
        </div>
      </div>

      {/* Quick Control Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={onOpenHowToPlay}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all border border-slate-700"
        >
          <BookOpen className="w-4 h-4 text-amber-400 mb-0.5" />
          <span>Rules</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all border border-slate-700"
        >
          <Settings className="w-4 h-4 text-blue-400 mb-0.5" />
          <span>Settings</span>
        </button>

        <button
          onClick={onOpenTests}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-semibold transition-all border border-slate-700"
        >
          <TestTube className="w-4 h-4 text-emerald-400 mb-0.5" />
          <span>Tests</span>
        </button>
      </div>
    </div>
  );
};
