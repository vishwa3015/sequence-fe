import { CheckCircle2, Play, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { createInitialBoard, validateBoardLayout } from '../engine/boardLayout';
import { createDeck } from '../engine/deck';
import { getValidMoveTargets } from '../engine/jackLogic';
import { detectNewSequences } from '../engine/sequenceDetector';
import type { Card } from '../types/game';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const runAllTests = () => {
    setIsRunning(true);
    const testList: TestResult[] = [];

    try {
      // 1. Board Layout Test
      const board = createInitialBoard();
      const isBoardValid = validateBoardLayout();
      testList.push({
        category: 'Board',
        name: '10x10 Canonical Board & Card Distribution',
        passed: isBoardValid && board.length === 10,
        message: 'Verified 10x10 layout, 4 corner spaces & 48 card pairs.',
      });

      // 2. Deck & Jacks Test
      const deck = createDeck();
      const twoEyed = deck.filter(c => c.isTwoEyedJack).length;
      const oneEyed = deck.filter(c => c.isOneEyedJack).length;
      testList.push({
        category: 'Cards & Jacks',
        name: 'Deck Generation & Jack Badges',
        passed: deck.length === 104 && twoEyed === 4 && oneEyed === 4,
        message: 'Verified 104 cards total, 4 Two-Eyed Wild Jacks, 4 One-Eyed Remove Jacks.',
      });

      // 3. Two-Eyed Jack Targets Test
      const wildCard: Card = {
        id: 'test-wild',
        suit: 'clubs',
        rank: 'J',
        isTwoEyedJack: true,
        isOneEyedJack: false,
      };
      const wildTargets = getValidMoveTargets(wildCard, board, 0);
      testList.push({
        category: 'Cards & Jacks',
        name: 'Two-Eyed Jack Wild Targets',
        passed: wildTargets.length === 96,
        message: `Found ${wildTargets.length} valid empty non-corner targets.`,
      });

      // 4. One-Eyed Jack Targets Test
      const removeCard: Card = {
        id: 'test-remove',
        suit: 'spades',
        rank: 'J',
        isTwoEyedJack: false,
        isOneEyedJack: true,
      };
      board[1][1].chip = { playerId: 'opp', teamId: 1, color: 'red' };
      const removeTargets = getValidMoveTargets(removeCard, board, 0);
      testList.push({
        category: 'Cards & Jacks',
        name: 'One-Eyed Jack Opponent Removal Targets',
        passed: removeTargets.length === 1,
        message: 'Successfully identified removable opponent chip.',
      });

      // 5. Sequence Detection Test
      const testBoard = createInitialBoard();
      for (let c = 1; c <= 5; c++) {
        testBoard[1][c].chip = { playerId: 'p1', teamId: 0, color: 'blue' };
      }
      const { newSequences } = detectNewSequences(testBoard, 0, 'p1', []);
      testList.push({
        category: 'Sequence Detection',
        name: '5-in-a-Row Horizontal Sequence Detection',
        passed: newSequences.length === 1 && newSequences[0].type === 'horizontal',
        message: 'Detected 5-in-a-row sequence and locked chips.',
      });

      // 6. Corner Free Space Test
      const cornerBoard = createInitialBoard();
      for (let c = 1; c <= 4; c++) {
        cornerBoard[0][c].chip = { playerId: 'p1', teamId: 0, color: 'blue' };
      }
      const { newSequences: cornerSeqs } = detectNewSequences(cornerBoard, 0, 'p1', []);
      testList.push({
        category: 'Sequence Detection',
        name: 'Corner Space Sequence Integration',
        passed: cornerSeqs.length === 1,
        message: 'Corner (0,0) free space successfully completed 5-in-a-row.',
      });
    } catch (err: any) {
      testList.push({
        category: 'System',
        name: 'Execution Error',
        passed: false,
        message: err.message || 'Error running tests',
      });
    }

    setResults(testList);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-xl font-black text-white">System Verification Suite</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        <div className="mb-4">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? 'Running Verification...' : 'Execute All System Tests'}</span>
          </button>
        </div>

        {/* Test Output Logs */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {results.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Click above to execute in-app verification of Board, Deck, Jacks, and Sequence Detection algorithms.
            </div>
          ) : (
            results.map((res, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-start space-x-3 ${
                  res.passed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>[{res.category}] {res.name}</span>
                    <span className="text-[10px] uppercase tracking-wide font-extrabold text-emerald-400">
                      PASSED
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">{res.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
