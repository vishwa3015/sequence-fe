import { Star, ShieldAlert, X, Zap } from 'lucide-react';
import React, { useState } from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'jacks' | 'winning'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <h3 className="text-xl font-black text-amber-400">How To Play Sequence</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-4 border-b border-slate-800 pb-2">
          {[
            { id: 'basics', label: 'Basic Rules' },
            { id: 'jacks', label: 'Jack Card Abilities' },
            { id: 'winning', label: 'Sequence & Winning' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 pr-2">
          {activeTab === 'basics' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-extrabold text-amber-300 text-sm mb-1">1. Match & Place</h4>
                <p>
                  On your turn, choose a card from your hand. Highlighted matching spaces will appear on the 10×10 board. Click an empty space to place your color chip.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-extrabold text-amber-300 text-sm mb-1">2. Draw & Turn Advance</h4>
                <p>
                  After playing a card and placing a chip, you automatically draw a replacement card from the deck and turn advances to the next player.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-extrabold text-amber-300 text-sm mb-1">3. Corner Free Spaces</h4>
                <p className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    The 4 corners of the board are <strong>Free Spaces</strong>. They count as a chip of any color for all players when completing a 5-in-a-row sequence!
                  </span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'jacks' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40">
                <h4 className="font-extrabold text-amber-300 text-sm mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Two-Eyed Jack (Wild Card)</span>
                </h4>
                <p className="mb-2">
                  J♣ and J♦ are Two-Eyed Jacks! Playing a Two-Eyed Jack allows you to place your chip on <strong>ANY empty non-corner space</strong> on the board.
                </p>
                <div className="inline-block px-2 py-1 bg-amber-500 text-slate-950 font-black rounded text-[10px]">
                  BADGE: WILD
                </div>
              </div>

              <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/40">
                <h4 className="font-extrabold text-rose-300 text-sm mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>One-Eyed Jack (Remove Card)</span>
                </h4>
                <p className="mb-2">
                  J♠ and J♥ are One-Eyed Jacks! Playing a One-Eyed Jack lets you <strong>remove any opponent chip</strong> from the board, unless that chip is part of an already completed protected sequence!
                </p>
                <div className="inline-block px-2 py-1 bg-rose-600 text-white font-black rounded text-[10px]">
                  BADGE: REMOVE
                </div>
              </div>
            </div>
          )}

          {activeTab === 'winning' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-extrabold text-amber-300 text-sm mb-1">Creating a Sequence</h4>
                <p>
                  A <strong>Sequence</strong> is a connected row of 5 chips of your color (horizontally, vertically, or diagonally).
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-extrabold text-amber-300 text-sm mb-1">Sequence Rules</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>2-player / 2-team games require <strong>2 Sequences</strong> to win.</li>
                  <li>3-player / 4-player games require <strong>1 Sequence</strong> to win.</li>
                  <li>Two sequences of the same team can share 1 common chip.</li>
                  <li>Once a sequence is completed, its chips are locked and cannot be removed by One-Eyed Jacks.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
