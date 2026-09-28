import { io, Socket } from 'socket.io-client';
import type { AIDifficulty, GameMode, GameState } from '../types/game';

class SocketService {
  public socket: Socket | null = null;

  public connect(url?: string) {
    if (!this.socket) {
      // Production URL fallback -> Environment Variable or Local Network IP
      const envUrl = import.meta.env.VITE_BACKEND_URL;
      const hostname = window.location.hostname || 'localhost';
      const targetUrl = url || envUrl || `http://${hostname}:3001`;

      console.log('[SocketClient] Connecting to backend server at:', targetUrl);

      this.socket = io(targetUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('[SocketClient] Connected to backend server:', this.socket?.id);
        this.rebindAllListeners();
      });
    } else if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  private addListener(event: string, handler: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const list = this.listeners.get(event)!;
    if (!list.includes(handler)) {
      list.push(handler);
    }

    this.connect();
    if (this.socket) {
      this.socket.off(event, handler);
      this.socket.on(event, handler);
    }
  }

  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  private rebindAllListeners() {
    if (!this.socket) return;
    this.listeners.forEach((handlers, event) => {
      handlers.forEach(h => {
        this.socket?.off(event, h);
        this.socket?.on(event, h);
      });
    });
  }

  public createRoom(
    playerName: string,
    mode: GameMode,
    aiDifficulty: AIDifficulty,
    callback: (res: { success: boolean; roomCode?: string; room?: any; error?: string }) => void
  ) {
    this.connect();
    this.socket?.emit('create_room', { playerName, mode, aiDifficulty }, callback);
  }

  public joinRoom(
    roomCode: string,
    playerName: string,
    callback: (res: { success: boolean; roomCode?: string; room?: any; error?: string }) => void
  ) {
    this.connect();
    this.socket?.emit('join_room', { roomCode, playerName }, callback);
  }

  public reconnectRoom(
    roomCode: string,
    playerName: string,
    callback: (res: { success: boolean; room?: any; gameState?: GameState; error?: string }) => void
  ) {
    this.connect();
    this.socket?.emit('reconnect_room', { roomCode, playerName }, callback);
  }

  public startOnlineGame(roomCode: string, callback: (res: { success: boolean; error?: string }) => void) {
    this.connect();
    this.socket?.emit('start_online_game', { roomCode }, callback);
  }

  public makeOnlineMove(roomCode: string, cardId: string, targetRow: number, targetCol: number) {
    this.connect();
    this.socket?.emit('make_online_move', { roomCode, cardId, targetRow, targetCol });
  }

  public discardDeadCard(roomCode: string, cardId: string) {
    this.connect();
    this.socket?.emit('discard_dead_card', { roomCode, cardId });
  }

  public sendChat(roomCode: string, text: string) {
    this.connect();
    this.socket?.emit('send_chat', { roomCode, text });
  }

  public onRoomUpdated(handler: (room: any) => void) {
    this.addListener('room_updated', handler);
  }

  public onGameStarted(handler: (data: { gameState: GameState; room: any }) => void) {
    this.addListener('game_started', handler);
  }

  public onGameStateUpdated(handler: (data: { gameState: GameState }) => void) {
    this.addListener('game_state_updated', handler);
  }

  public onChatUpdated(handler: (data: { chatMessages: any[] }) => void) {
    this.addListener('chat_updated', handler);
  }

  public removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((handlers, event) => {
        handlers.forEach(h => this.socket?.off(event, h));
      });
    }
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
