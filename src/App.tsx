import React, { useEffect, useState } from 'react';
import { soundManager } from './audio/soundManager';
import { Board } from './components/Board';
import { GameLog } from './components/GameLog';
import { HomeScreen } from './components/HomeScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { InfoPanel } from './components/InfoPanel';
import { OnlineLobbyScreen } from './components/OnlineLobbyScreen';
import { PlayerHand } from './components/PlayerHand';
import { SettingsModal } from './components/SettingsModal';
import { SetupScreen } from './components/SetupScreen';
import { TestRunnerModal } from './components/TestRunnerModal';
import { WinnerModal } from './components/WinnerModal';
import { chooseAiMove } from './engine/aiEngine';
import { discardDeadCardInHand, executeTurnMove, initializeGame, type SetupOptions } from './engine/gameEngine';
import { socketService } from './services/socketService';
import type { AIDifficulty, Card, GameMode, GameSettings, GameState, PlayerColor } from './types/game';

const LOCAL_STORAGE_KEY = 'SEQUENCE_MATRIX_SAVED_GAME';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<'home' | 'setup' | 'playing' | 'online_lobby'>('home');
  const [initialSetupMode, setInitialSetupMode] = useState<GameMode>('vs_computer');
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [myOnlinePlayerName, setMyOnlinePlayerName] = useState<string | null>(() => {
    return localStorage.getItem('SEQUENCE_MY_PLAYER_NAME') || null;
  });

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);

  // 1. Restore saved session from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.gameState) {
          setGameState(parsed.gameState);
          setOnlineRoomCode(parsed.onlineRoomCode || null);
          if (parsed.playerName) setMyOnlinePlayerName(parsed.playerName);
          setHasSavedSession(true);

          if (parsed.onlineRoomCode && parsed.playerName) {
            socketService.reconnectRoom(parsed.onlineRoomCode, parsed.playerName, res => {
              if (res.success) {
                if (res.gameState) setGameState(res.gameState);
                setScreen('playing');
              }
            });
          } else if (parsed.screen === 'playing') {
            setScreen('playing');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved game session:', e);
    }
  }, []);

  // 2. Persist state to LocalStorage on changes
  useEffect(() => {
    if (gameState && screen === 'playing') {
      try {
        const payload = {
          gameState,
          screen,
          onlineRoomCode,
          playerName: myOnlinePlayerName,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        setHasSavedSession(true);
      } catch (e) {
        console.warn('Failed to save game session:', e);
      }
    }
  }, [gameState, screen, onlineRoomCode, myOnlinePlayerName]);

  const clearSavedSession = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setHasSavedSession(false);
  };

  // Handle Game Setup submission (Local)
  const handleStartGame = (mode: GameMode, difficulty: AIDifficulty, names: string[], colors: PlayerColor[]) => {
    const setupOpts: SetupOptions = {
      gameMode: mode,
      aiDifficulty: difficulty,
      playerNames: names,
      playerColors: colors,
    };
    const newState = initializeGame(setupOpts);
    setOnlineRoomCode(null);
    setGameState(newState);
    setScreen('playing');
  };

  // Handle Online Game start
  const handleStartOnlineGame = (initialState: GameState, roomCode: string, playerName: string) => {
    setOnlineRoomCode(roomCode);
    setMyOnlinePlayerName(playerName);
    setGameState(initialState);
    setScreen('playing');
  };

  // Socket updates for online games
  useEffect(() => {
    socketService.onGameStateUpdated(({ gameState: updatedState }) => {
      soundManager.playChipPlace();
      setGameState(updatedState);
    });
  }, []);

  // Select card in player hand
  const handleSelectCard = (cardId: string) => {
    if (!gameState || gameState.status !== 'playing') return;

    soundManager.playCardSelect();
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedCardId: prev.selectedCardId === cardId ? null : cardId,
      };
    });
  };

  // Helper check if current turn is my turn in online mode
  const isMyTurnOnline = () => {
    if (!onlineRoomCode || !myOnlinePlayerName || !gameState) return true;
    const activeTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    const normActive = activeTurnPlayer.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normMine = myOnlinePlayerName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normActive.includes(normMine) || normMine.includes(normActive);
  };

  // Click board cell to execute move
  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gameState.status !== 'playing' || !gameState.selectedCardId) return;

    const activeTurnPlayer = gameState.players[gameState.currentPlayerIndex];

    if (onlineRoomCode) {
      if (!isMyTurnOnline()) return; // Block move if not your turn in online game

      soundManager.playChipPlace();
      // Broadcast online move via Socket.io backend
      socketService.makeOnlineMove(onlineRoomCode, gameState.selectedCardId, row, col);
      setGameState(prev => (prev ? { ...prev, selectedCardId: null } : prev));
      return;
    }

    // Local Game Execution
    if (activeTurnPlayer.type !== 'human') return;

    const card = activeTurnPlayer.hand.find(c => c.id === gameState.selectedCardId);
    if (!card) return;

    if (card.isOneEyedJack) {
      soundManager.playChipRemove();
    } else {
      soundManager.playChipPlace();
    }

    const prevSeqCount = gameState.sequences.length;
    const nextState = executeTurnMove(gameState, gameState.selectedCardId, row, col);

    if (nextState.sequences.length > prevSeqCount) {
      soundManager.playSequenceFanfare();
    }

    setGameState(nextState);
  };

  // Discard dead card
  const handleDiscardDeadCard = (cardId: string) => {
    if (!gameState || gameState.status !== 'playing') return;
    soundManager.playCardPlace();

    if (onlineRoomCode) {
      socketService.discardDeadCard(onlineRoomCode, cardId);
      return;
    }

    const nextState = discardDeadCardInHand(gameState, cardId);
    setGameState(nextState);
  };

  // Computer AI Automation Turn Loop (for local play)
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || onlineRoomCode) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type === 'computer' && !gameState.isAiThinking) {
      setGameState(prev => (prev ? { ...prev, isAiThinking: true } : prev));

      const timer = setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.status !== 'playing') return prev;

          const aiPlayer = prev.players[prev.currentPlayerIndex];
          if (aiPlayer.type !== 'computer') return prev;

          for (const card of aiPlayer.hand) {
            const deadState = discardDeadCardInHand(prev, card.id);
            if (deadState !== prev) {
              return { ...deadState, isAiThinking: false };
            }
          }

          const move = chooseAiMove(
            aiPlayer,
            prev.players,
            prev.board,
            prev.settings.aiDifficulty,
            prev.sequences
          );

          if (move) {
            if (move.action === 'remove') {
              soundManager.playChipRemove();
            } else {
              soundManager.playChipPlace();
            }

            const prevSeqCount = prev.sequences.length;
            const nextState = executeTurnMove(prev, move.card.id, move.targetRow, move.targetCol);

            if (nextState.sequences.length > prevSeqCount) {
              soundManager.playSequenceFanfare();
            }

            return { ...nextState, isAiThinking: false };
          } else {
            return {
              ...prev,
              currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
              isAiThinking: false,
            };
          }
        });
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [gameState, onlineRoomCode]);

  // Update Settings
  const handleUpdateSettings = (updated: Partial<GameSettings>) => {
    setGameState(prev => (prev ? { ...prev, settings: { ...prev.settings, ...updated } } : prev));
  };

  // Reset Game
  const handleResetGame = () => {
    if (!gameState) return;
    const resetState = initializeGame({
      gameMode: gameState.gameMode,
      aiDifficulty: gameState.settings.aiDifficulty,
      playerNames: gameState.players.map(p => p.name),
    });
    setGameState(resetState);
    setIsSettingsOpen(false);
  };

  const getSelectedCard = (): Card | null => {
    if (!gameState || !gameState.selectedCardId) return null;
    const activeTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    return activeTurnPlayer.hand.find(c => c.id === gameState.selectedCardId) || null;
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {screen === 'home' && (
        <HomeScreen
          hasSavedSession={hasSavedSession}
          onResumeGame={() => setScreen('playing')}
          onStartVsComputer={() => {
            clearSavedSession();
            setInitialSetupMode('vs_computer');
            setScreen('setup');
          }}
          onStartMultiplayer={() => {
            clearSavedSession();
            setInitialSetupMode('2_player');
            setScreen('setup');
          }}
          onStartOnlineLobby={() => setScreen('online_lobby')}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTests={() => setIsTestsOpen(true)}
        />
      )}

      {screen === 'setup' && (
        <SetupScreen
          initialMode={initialSetupMode}
          onStartGame={handleStartGame}
          onBackToHome={() => setScreen('home')}
        />
      )}

      {screen === 'online_lobby' && (
        <OnlineLobbyScreen
          onStartOnlineGame={handleStartOnlineGame}
          onBackToHome={() => setScreen('home')}
        />
      )}

      {screen === 'playing' && gameState && (
        <div className="min-h-screen p-3 md:p-6 flex flex-col items-center justify-between max-w-7xl mx-auto space-y-4">
          
          {/* Top Bar Header */}
          <div className="w-full flex items-center justify-between glass-panel px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-lg">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setScreen('home')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <span>← Menu</span>
              </button>
              <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>SEQUENCE MATRIX</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono uppercase">
                  {onlineRoomCode ? `ROOM: ${onlineRoomCode}` : gameState.gameMode.replace('_', ' ')}
                </span>
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Rules
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Settings
              </button>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Left/Middle: Game Board */}
            <div className="lg:col-span-8 flex flex-col items-center space-y-4 w-full">
              <Board
                gameState={gameState}
                selectedCard={getSelectedCard()}
                onCellClick={handleCellClick}
              />

              {/* Bottom Player Hand Controls */}
              <div className="w-full max-w-[720px]">
                <PlayerHand
                  gameState={gameState}
                  selectedCardId={gameState.selectedCardId}
                  myPlayerName={onlineRoomCode ? myOnlinePlayerName : null}
                  onSelectCard={handleSelectCard}
                  onDiscardDeadCard={handleDiscardDeadCard}
                />
              </div>
            </div>

            {/* Right: Info Panel & Activity Stream */}
            <div className="lg:col-span-4 flex flex-col space-y-4 w-full">
              <InfoPanel
                gameState={gameState}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
                onOpenTests={() => setIsTestsOpen(true)}
              />

              <GameLog logs={gameState.logs} />
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
      
      {gameState && (
        <SettingsModal
          isOpen={isSettingsOpen}
          settings={gameState.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetGame={handleResetGame}
          onReturnToMainMenu={() => {
            setIsSettingsOpen(false);
            setScreen('home');
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {gameState && gameState.status === 'game_over' && (
        <WinnerModal
          gameState={gameState}
          onPlayAgain={handleResetGame}
          onNewGame={() => setScreen('setup')}
          onMainMenu={() => {
            clearSavedSession();
            setScreen('home');
          }}
        />
      )}

      <TestRunnerModal isOpen={isTestsOpen} onClose={() => setIsTestsOpen(false)} />
    </div>
  );
};

export default App;
