import { Home, Music, RefreshCw, Volume2, X } from 'lucide-react';
import React from 'react';
import { soundManager } from '../audio/soundManager';
import type { AIDifficulty, GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (updated: Partial<GameSettings>) => void;
  onResetGame: () => void;
  onReturnToMainMenu: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onResetGame,
  onReturnToMainMenu,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSoundToggle = () => {
    const nextVal = !settings.soundEnabled;
    soundManager.isSoundEnabled = nextVal;
    onUpdateSettings({ soundEnabled: nextVal });
  };

  const handleMusicToggle = () => {
    const nextVal = !settings.musicEnabled;
    soundManager.setMusicEnabled(nextVal);
    onUpdateSettings({ musicEnabled: nextVal });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h3 className="text-xl font-black text-amber-400">Game Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Sound Effects</h4>
                <p className="text-[10px] text-slate-400">Card & Chip Audio</p>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.soundEnabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Ambient Music */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-3">
              <Music className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Ambient Music</h4>
                <p className="text-[10px] text-slate-400">Background Soundtrack</p>
              </div>
            </div>
            <button
              onClick={handleMusicToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.musicEnabled
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Animations</h4>
              <p className="text-[10px] text-slate-400">Chip drop keyframes</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ animationsEnabled: !settings.animationsEnabled })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.animationsEnabled
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.animationsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* AI Difficulty */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-2">Computer AI Difficulty</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => onUpdateSettings({ aiDifficulty: diff })}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    settings.aiDifficulty === diff
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <button
            onClick={onResetGame}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Reset Current Game</span>
          </button>

          <button
            onClick={onReturnToMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-rose-800/60"
          >
            <Home className="w-4 h-4 text-rose-400" />
            <span>Return to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
