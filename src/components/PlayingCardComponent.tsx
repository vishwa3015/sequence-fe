import React from 'react';
import type { Card, Suit } from '../types/game';

interface PlayingCardProps {
  card: Card;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayingCardComponent: React.FC<PlayingCardProps> = ({
  card,
  isSelected = false,
  isPlayable = true,
  onClick,
  size = 'md',
}) => {
  const suitSymbols: Record<Suit, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  const suitColorClasses: Record<Suit, { text: string; bgBadge: string; border: string }> = {
    hearts: {
      text: 'text-red-600',
      bgBadge: 'bg-red-100 text-red-700 border-red-200',
      border: 'border-red-200',
    },
    diamonds: {
      text: 'text-amber-600',
      bgBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      border: 'border-amber-200',
    },
    spades: {
      text: 'text-blue-900',
      bgBadge: 'bg-blue-100 text-blue-950 border-blue-200',
      border: 'border-blue-200',
    },
    clubs: {
      text: 'text-emerald-800',
      bgBadge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      border: 'border-emerald-200',
    },
  };

  const suitStyle = suitColorClasses[card.suit];
  const suitSymbol = suitSymbols[card.suit];

  const sizeClasses = {
    sm: 'w-12 h-16 text-xs p-1',
    md: 'w-16 h-24 text-sm p-1.5',
    lg: 'w-20 h-32 text-base p-2',
  };

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable}
      className={`playing-card relative flex flex-col justify-between rounded-xl font-black shadow-lg cursor-pointer transition-all select-none border-2 ${
        sizeClasses[size]
      } ${
        isSelected
          ? 'ring-4 ring-yellow-400 shadow-yellow-500/80 -translate-y-2.5 scale-105 z-20 bg-amber-50 border-yellow-400'
          : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-300 hover:border-slate-400'
      } ${
        !isPlayable
          ? 'opacity-40 grayscale-[50%] cursor-not-allowed hover:transform-none'
          : 'hover:shadow-xl'
      }`}
    >
      {/* Top-left rank & suit */}
      <div className={`flex flex-col items-center leading-none ${suitStyle.text}`}>
        <span className="font-extrabold text-xs md:text-sm">{card.rank}</span>
        <span className="text-xs">{suitSymbol}</span>
      </div>

      {/* Center suit emblem / Jack Badge */}
      <div className="flex flex-col items-center justify-center my-auto">
        {card.isTwoEyedJack ? (
          <div className="flex flex-col items-center">
            <span className="text-[14px] leading-none mb-0.5">👁️👁️</span>
            <span className="text-[9px] px-1 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded shadow-xs uppercase tracking-tight">
              WILD
            </span>
          </div>
        ) : card.isOneEyedJack ? (
          <div className="flex flex-col items-center">
            <span className="text-[14px] leading-none mb-0.5">👁️</span>
            <span className="text-[9px] px-1 py-0.5 bg-gradient-to-r from-rose-600 to-red-700 text-white font-black rounded shadow-xs uppercase tracking-tight">
              REMOVE
            </span>
          </div>
        ) : (
          <span className={`${size === 'lg' ? 'text-3xl' : 'text-2xl'} ${suitStyle.text}`}>
            {suitSymbol}
          </span>
        )}
      </div>

      {/* Bottom-right inverted rank & suit */}
      <div className={`flex flex-col items-center leading-none self-end rotate-180 ${suitStyle.text}`}>
        <span className="font-extrabold text-xs md:text-sm">{card.rank}</span>
        <span className="text-xs">{suitSymbol}</span>
      </div>

      {/* Playable indicator green bottom bar */}
      {isPlayable && !isSelected && (
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-emerald-500 rounded-b-xl opacity-90 shadow-sm" />
      )}
    </button>
  );
};
