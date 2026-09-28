import { ArrowLeft, Bot, Play, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import type { AIDifficulty, GameMode, PlayerColor } from '../types/game';

interface SetupScreenProps {
  initialMode?: GameMode;
  onStartGame: (mode: GameMode, difficulty: AIDifficulty, names: string[], colors: PlayerColor[]) => void;
  onBackToHome: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  initialMode = 'vs_computer',
  onStartGame,
  onBackToHome,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
  ]);

  const handleNameChange = (index: number, val: string) => {
    const updated = [...playerNames];
    updated[index] = val;
    setPlayerNames(updated);
  };

  const getPlayerCount = () => {
    switch (gameMode) {
      case 'vs_computer': return 2;
      case '2_player': return 2;
      case '3_player': return 3;
      case '4_player': return 4;
      case 'team': return 4;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(gameMode, difficulty, playerNames.slice(0, getPlayerCount()), ['blue', 'red', 'green', 'yellow']);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black">
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl max-w-xl w-full">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
          <h2 className="text-xl font-black text-amber-400">Game Setup</h2>
          <div className="w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { id: 'vs_computer', label: 'vs Computer', icon: Bot },
                { id: '2_player', label: '2 Players', icon: Users },
                { id: '3_player', label: '3 Players', icon: Users },
                { id: '4_player', label: '4 Players', icon: Users },
                { id: 'team', label: 'Team (2v2)', icon: Zap },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = gameMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGameMode(m.id as GameMode)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Difficulty Selector (if vs Computer) */}
          {gameMode === 'vs_computer' && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Computer AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(diff => {
                  const isSelected = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold capitalize transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Player Names */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              Player Names
            </label>
            <div className="space-y-2">
              {Array.from({ length: getPlayerCount() }).map((_, idx) => {
                const isComputer = gameMode === 'vs_computer' && idx === 1;
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 w-16">
                      Player {idx + 1}:
                    </span>
                    <input
                      type="text"
                      disabled={isComputer}
                      value={isComputer ? `Computer (${difficulty.toUpperCase()})` : playerNames[idx]}
                      onChange={e => handleNameChange(idx, e.target.value)}
                      className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Game Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-400/40 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START GAME</span>
          </button>
        </form>
      </div>
    </div>
  );
};
