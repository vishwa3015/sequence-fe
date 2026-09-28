import { ArrowLeft, Copy, Globe, MessageSquare, Play, Send, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import type { AIDifficulty, GameMode, GameState } from '../types/game';

interface OnlineLobbyScreenProps {
  onStartOnlineGame: (initialState: GameState, roomCode: string, playerName: string) => void;
  onBackToHome: () => void;
}

export const OnlineLobbyScreen: React.FC<OnlineLobbyScreenProps> = ({
  onStartOnlineGame,
  onBackToHome,
}) => {
  const [view, setView] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('SEQUENCE_MY_PLAYER_NAME') || 'Player ' + Math.floor(Math.random() * 900 + 100);
  });
  const [gameMode, setGameMode] = useState<GameMode>('2_player');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [inputRoomCode, setInputRoomCode] = useState('');

  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    socketService.connect();

    socketService.onRoomUpdated(room => {
      setActiveRoom(room);
    });

    socketService.onGameStarted(({ gameState, room }) => {
      localStorage.setItem('SEQUENCE_MY_PLAYER_NAME', playerName);
      onStartOnlineGame(gameState, room.roomCode, playerName);
    });

    socketService.onChatUpdated(({ chatMessages }) => {
      setActiveRoom((prev: any) => (prev ? { ...prev, chatMessages } : prev));
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [onStartOnlineGame, playerName]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    localStorage.setItem('SEQUENCE_MY_PLAYER_NAME', playerName);
    socketService.createRoom(playerName, gameMode, difficulty, res => {
      if (res.success) {
        setActiveRoom(res.room);
        setView('waiting');
      } else {
        setErrorMsg(res.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inputRoomCode.trim()) {
      setErrorMsg('Please enter a room code');
      return;
    }
    localStorage.setItem('SEQUENCE_MY_PLAYER_NAME', playerName);
    socketService.joinRoom(inputRoomCode, playerName, res => {
      if (res.success) {
        setActiveRoom(res.room);
        setView('waiting');
      } else {
        setErrorMsg(res.error || 'Failed to join room');
      }
    });
  };

  const handleStartGameHost = () => {
    if (!activeRoom) return;
    socketService.startOnlineGame(activeRoom.roomCode, res => {
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to start game');
      }
    });
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom) return;
    socketService.sendChat(activeRoom.roomCode, chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black">
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl max-w-xl w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
          <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>Online Multiplayer</span>
          </h2>
          <div className="w-16" />
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 font-semibold animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* 1. Main Online Menu */}
        {view === 'menu' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Your Display Name</label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setView('create')}
                className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-lg flex flex-col items-center justify-center gap-2 border border-amber-300 transition-all"
              >
                <Users className="w-6 h-6" />
                <span>Create Online Room</span>
              </button>

              <button
                onClick={() => setView('join')}
                className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm shadow-lg flex flex-col items-center justify-center gap-2 border border-blue-400 transition-all"
              >
                <Globe className="w-6 h-6" />
                <span>Join Room Code</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Create Room View */}
        {view === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Game Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '2_player', label: '2 Players' },
                  { id: '3_player', label: '3 Players' },
                  { id: '4_player', label: '4 Players' },
                  { id: 'team', label: '2v2 Teams' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGameMode(m.id as GameMode)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      gameMode === m.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all"
            >
              CREATE ROOM
            </button>
          </form>
        )}

        {/* 3. Join Room View */}
        {view === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Enter 6-Digit Room Code</label>
              <input
                type="text"
                placeholder="e.g. SEQ-9X"
                value={inputRoomCode}
                onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-widest font-black text-amber-400 focus:outline-none focus:border-amber-400 uppercase text-center"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg transition-all"
            >
              JOIN ROOM
            </button>
          </form>
        )}

        {/* 4. Waiting Room Lobby View */}
        {view === 'waiting' && activeRoom && (
          <div className="space-y-6">
            {/* Room Code Share Banner */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Room Invite Code</span>
                <span className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                  {activeRoom.roomCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
              </button>
            </div>

            {/* Connected Players List */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex justify-between">
                <span>Connected Players</span>
                <span>{activeRoom.players.length} / {activeRoom.maxPlayers}</span>
              </h4>
              <div className="space-y-2">
                {activeRoom.players.map((p: any) => (
                  <div
                    key={p.socketId}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-bold text-slate-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>{p.name}</span>
                      {p.isHost && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] border border-amber-500/30">
                          HOST
                        </span>
                      )}
                    </div>
                    <span className="text-emerald-400 font-normal">Ready</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Lobby Chat Stream */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
              <h5 className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Lobby Chat</span>
              </h5>
              <div className="h-24 overflow-y-auto space-y-1 text-xs pr-1">
                {activeRoom.chatMessages?.map((m: any) => (
                  <div key={m.id} className="text-[11px] leading-tight">
                    <strong className="text-amber-400 mr-1">{m.sender}:</strong>
                    <span className="text-slate-300">{m.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-1 pt-1">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Host Start Game Button */}
            {activeRoom.players[0]?.socketId === socketService.socket?.id ? (
              <button
                onClick={handleStartGameHost}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>START ONLINE MATCH</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-900/60 rounded-xl text-center text-xs text-amber-300 font-semibold animate-pulse">
                Waiting for room host to start the game...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
