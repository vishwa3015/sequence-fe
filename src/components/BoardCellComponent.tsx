import { Star } from 'lucide-react';
import React from 'react';
import type { BoardCell, PlayerColor, Suit } from '../types/game';

interface BoardCellProps {
  cell: BoardCell;
  isValidTarget: boolean;
  targetAction?: 'place' | 'remove';
  isLastMove: boolean;
  onClick: () => void;
  animationsEnabled: boolean;
}

export const BoardCellComponent: React.FC<BoardCellProps> = ({
  cell,
  isValidTarget,
  targetAction = 'place',
  isLastMove,
  onClick,
  animationsEnabled,
}) => {
  const suitSymbols: Record<Suit, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  const suitColorClasses: Record<Suit, { text: string; bg: string }> = {
    hearts: { text: 'text-red-600', bg: 'bg-red-50/50' },
    diamonds: { text: 'text-amber-600', bg: 'bg-amber-50/50' },
    spades: { text: 'text-blue-950', bg: 'bg-slate-50/50' },
    clubs: { text: 'text-emerald-900', bg: 'bg-emerald-50/30' },
  };

  const suitStyle = cell.card ? suitColorClasses[cell.card.suit] : null;

  const getChipColorClasses = (color: PlayerColor) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-br from-red-500 via-rose-600 to-red-800 border-red-200 shadow-red-900/80 text-white';
      case 'blue':
        return 'bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800 border-blue-200 shadow-blue-900/80 text-white';
      case 'green':
        return 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 border-emerald-200 shadow-emerald-900/80 text-white';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 border-amber-100 shadow-amber-900/80 text-slate-950';
    }
  };

  return (
    <div
      onClick={isValidTarget ? onClick : undefined}
      className={`relative aspect-square rounded-lg flex flex-col items-center justify-between p-0.5 border-2 shadow-sm transition-all duration-150 select-none ${
        cell.isCorner
          ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-amber-300 text-slate-950 shadow-md'
          : 'bg-gradient-to-b from-white via-slate-50 to-amber-50/30 border-slate-300 hover:border-slate-400'
      } ${
        isValidTarget
          ? targetAction === 'remove'
            ? 'ring-4 ring-rose-500 cursor-pointer bg-rose-200 animate-pulse z-20'
            : 'ring-4 ring-emerald-400 cursor-pointer bg-emerald-200 animate-pulse z-20'
          : 'cursor-default'
      } ${
        isLastMove ? 'ring-4 ring-yellow-400 ring-offset-1 ring-offset-slate-900 z-20' : ''
      } ${
        cell.chip?.isPartOfSequence ? 'ring-4 ring-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.9)] z-10' : ''
      }`}
    >
      {cell.isCorner ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Star className="w-5 h-5 text-slate-950 fill-slate-950 animate-spin-slow" />
          <span className="text-[9px] font-black uppercase text-slate-950 tracking-tight mt-0.5">FREE</span>
        </div>
      ) : (
        <>
          {/* Top Rank + Suit */}
          <div className={`flex items-center justify-between w-full px-1 text-[11px] font-black leading-none ${suitStyle?.text}`}>
            <span>{cell.card?.rank}</span>
            <span className="text-[10px]">{cell.card ? suitSymbols[cell.card.suit] : ''}</span>
          </div>

          {/* Center Suit Graphic */}
          <div className={`text-base font-black my-auto ${suitStyle?.text}`}>
            {cell.card ? suitSymbols[cell.card.suit] : ''}
          </div>

          {/* Bottom Suit + Rank */}
          <div className={`flex items-center justify-between w-full px-1 text-[11px] font-black leading-none rotate-180 ${suitStyle?.text}`}>
            <span>{cell.card?.rank}</span>
            <span className="text-[10px]">{cell.card ? suitSymbols[cell.card.suit] : ''}</span>
          </div>
        </>
      )}

      {/* Chip Token Overlay */}
      {cell.chip && (
        <div className="absolute inset-0 flex items-center justify-center p-1 z-10 pointer-events-none">
          <div
            className={`w-4/5 h-4/5 rounded-full border-2 flex items-center justify-center shadow-xl font-black text-xs ${getChipColorClasses(
              cell.chip.color
            )} ${animationsEnabled ? 'animate-chip-drop' : ''}`}
          >
            {/* Inner Ring Design */}
            <div className="w-3/4 h-3/4 rounded-full border border-white/40 flex items-center justify-center">
              {cell.chip.isPartOfSequence && (
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Valid Target Hover Ghost Chip */}
      {isValidTarget && !cell.chip && targetAction === 'place' && (
        <div className="absolute inset-0 flex items-center justify-center p-1 z-10 pointer-events-none opacity-60">
          <div className="w-3/4 h-3/4 rounded-full bg-emerald-400 border-2 border-emerald-200 animate-ping" />
        </div>
      )}
    </div>
  );
};
