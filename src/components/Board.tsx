import React from 'react';
import { getValidMoveTargets, type ValidMoveTarget } from '../engine/jackLogic';
import type { BoardCell, Card, GameState } from '../types/game';
import { BoardCellComponent } from './BoardCellComponent';

interface BoardProps {
  gameState: GameState;
  selectedCard: Card | null;
  onCellClick: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({ gameState, selectedCard, onCellClick }) => {
  const { board, currentPlayerIndex, players, lastMove, settings } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Calculate valid target positions if a card is selected
  let validTargets: ValidMoveTarget[] = [];
  if (selectedCard && currentPlayer.type === 'human') {
    validTargets = getValidMoveTargets(selectedCard, board, currentPlayer.teamId);
  }

  const isTargetCell = (row: number, col: number) => {
    return validTargets.find(t => t.row === row && t.col === col);
  };

  const isLastMoveCell = (row: number, col: number) => {
    return lastMove !== null && lastMove.row === row && lastMove.col === col;
  };

  return (
    <div className="glass-panel p-3 md:p-4 rounded-3xl border-2 border-amber-600/50 shadow-2xl bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 max-w-full overflow-hidden">
      {/* 10x10 Board Grid */}
      <div className="grid grid-cols-10 gap-1 md:gap-1.5 w-full max-w-[720px] aspect-square mx-auto p-1 bg-slate-950/60 rounded-2xl border border-emerald-900/60 shadow-inner">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const target = isTargetCell(r, c);
            return (
              <BoardCellComponent
                key={`cell-${r}-${c}`}
                cell={cell}
                isValidTarget={!!target}
                targetAction={target?.action}
                isLastMove={isLastMoveCell(r, c)}
                onClick={() => onCellClick(r, c)}
                animationsEnabled={settings.animationsEnabled}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
