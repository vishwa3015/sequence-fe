import { Activity, RefreshCw, Sparkles, Trophy, Zap } from 'lucide-react';
import React from 'react';
import type { GameLogEntry, PlayerColor } from '../types/game';

interface GameLogProps {
  logs: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const getLogIcon = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'sequence':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'win':
        return <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
      case 'jack':
        return <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'discard':
        return <RefreshCw className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  const getColorText = (color: PlayerColor) => {
    switch (color) {
      case 'red': return 'text-rose-400';
      case 'blue': return 'text-blue-400';
      case 'green': return 'text-emerald-400';
      case 'yellow': return 'text-amber-400';
    }
  };

  return (
    <div className="glass-panel p-3 rounded-xl border border-slate-700/80 shadow-lg flex flex-col h-48 md:h-56">
      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700/60 pb-1 flex items-center justify-between">
        <span>Game Activity Log</span>
        <span className="text-[10px] text-slate-500 font-mono">{logs.length} events</span>
      </h5>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {logs.map(log => (
          <div
            key={log.id}
            className={`p-1.5 rounded bg-slate-900/50 border border-slate-800/80 text-[11px] leading-tight flex items-start space-x-1.5 ${
              log.type === 'sequence' || log.type === 'win'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 font-semibold'
                : 'text-slate-300'
            }`}
          >
            {getLogIcon(log.type)}
            <div className="flex-1">
              {log.playerId !== 'system' && (
                <span className={`font-bold mr-1 ${getColorText(log.playerColor)}`}>
                  {log.playerName}:
                </span>
              )}
              <span>{log.text}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono self-start ml-1">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
