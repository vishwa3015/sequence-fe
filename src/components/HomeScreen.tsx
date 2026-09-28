import { BookOpen, Bot, Globe, RotateCcw, Settings, ShieldCheck, Users } from 'lucide-react';
import React from 'react';

interface HomeScreenProps {
  hasSavedSession?: boolean;
  onResumeGame?: () => void;
  onStartVsComputer: () => void;
  onStartMultiplayer: () => void;
  onStartOnlineLobby: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenTests: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  hasSavedSession = false,
  onResumeGame,
  onStartVsComputer,
  onStartMultiplayer,
  onStartOnlineLobby,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenTests,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Background Decorative Graphic Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Title Box */}
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-700/80 shadow-2xl max-w-lg w-full text-center relative z-10 flex flex-col items-center space-y-8">
        
        {/* Logo Banner */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg border border-blue-400">
              ♠
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-white font-black text-xl shadow-lg border border-rose-400">
              ♥
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border border-amber-300">
              ♦
            </span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg border border-emerald-400">
              ♣
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mt-2">
            SEQUENCE MATRIX
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Classic 5-in-a-Row Card & Board Game
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          {hasSavedSession && onResumeGame && (
            <button
              onClick={onResumeGame}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-400/40 transition-all flex items-center justify-center space-x-3 border border-emerald-300 animate-pulse group"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>RESUME PREVIOUS GAME</span>
            </button>
          )}

          <button
            onClick={onStartOnlineLobby}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-400/40 transition-all flex items-center justify-center space-x-3 border border-amber-300 group"
          >
            <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>PLAY ONLINE MULTIPLAYER</span>
          </button>

          <button
            onClick={onStartVsComputer}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-900/40 hover:shadow-blue-600/50 transition-all flex items-center justify-center space-x-3 border border-blue-400/40 group"
          >
            <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Play vs Computer</span>
          </button>

          <button
            onClick={onStartMultiplayer}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/50 transition-all flex items-center justify-center space-x-3 border border-emerald-400/40 group"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Local Same PC Multiplayer</span>
          </button>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={onOpenHowToPlay}
              className="py-3 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex flex-col items-center justify-center gap-1 group"
            >
              <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Rules</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="py-3 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex flex-col items-center justify-center gap-1 group"
            >
              <Settings className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Settings</span>
            </button>

            <button
              onClick={onOpenTests}
              className="py-3 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-semibold text-xs transition-all border border-slate-700 flex flex-col items-center justify-center gap-1 group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>System Tests</span>
            </button>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-[11px] text-slate-500 pt-2">
          Automatic Session Persistence • Page Refresh Protection
        </div>
      </div>
    </div>
  );
};
