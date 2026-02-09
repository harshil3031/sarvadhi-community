import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

// Get socket base URL from API config
const getSocketUrl = (): string => {
  if (__DEV__) {
    // For development, use same base as API (local IP for physical device)
    return 'http://192.168.2.169:3000';
  }
  return 'https://api.sarvadhi.com';
};

interface SocketState {
  // State
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastPongAt: number | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  lastPongAt: null,

  /**
   * Connect to WebSocket server
   * - Retrieves auth token from AsyncStorage
   * - Establishes Socket.IO connection with JWT auth
   * - Sets up automatic reconnection
   * - Handles connection events
   */
  connect: async () => {
    const { socket } = get();

    // Already connected or connecting
    if (socket?.connected || get().isConnecting) {
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      // Retrieve auth token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        set({
          isConnecting: false,
          error: 'No authentication token available',
        });
        return;
      }

      // Create socket connection
      const newSocket = io(getSocketUrl(), {
        auth: {
          token: token, // Send raw token without Bearer prefix
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      // Heartbeat ping interval
      let pingInterval: NodeJS.Timeout | null = null;

      // Connection successful
      newSocket.on('connect', () => {
        console.log('[Socket] Connected:', newSocket.id);
        set({
          socket: newSocket,
          isConnected: true,
          isConnecting: false,
          error: null,
        });

        // Start heartbeat ping every 15s
        if (pingInterval) {
          clearInterval(pingInterval);
        }
        pingInterval = setInterval(() => {
          if (newSocket.connected) {
            newSocket.emit('ping', { ts: Date.now() });
          }
        }, 15000);
      });

      // Connection error
      newSocket.on('connect_error', (error: any) => {
        console.error('[Socket] Connection error:', error);
        set({
          error: error?.message || 'Connection failed',
          isConnecting: false,
        });
      });

      // Disconnected
      newSocket.on('disconnect', (reason: string) => {
        console.log('[Socket] Disconnected:', reason);
        set({
          isConnected: false,
        });

        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
      });

      // Pong handler
      newSocket.on('pong', (payload: any) => {
        set({ lastPongAt: Date.now() });
        console.log('[Socket] Pong received', payload);
      });

      // Authentication error
      newSocket.on('unauthorized', (error: any) => {
        console.error('[Socket] Unauthorized:', error);
        set({
          error: 'Authentication failed',
          isConnected: false,
          isConnecting: false,
        });
        newSocket.disconnect();
      });

      set({ socket: newSocket });
    } catch (error: any) {
      const message = error?.message || 'Failed to connect socket';
      console.error('[Socket] Connection error:', message);
      set({
        isConnecting: false,
        error: message,
      });
    }
  },

  /**
   * Disconnect from WebSocket server
   * - Gracefully closes connection
   * - Cleans up socket instance
   * - Resets connection state
   */
  disconnect: async () => {
    const { socket } = get();

    if (!socket) {
      return;
    }

    try {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        error: null,
      });
    } catch (error) {
      console.error('[Socket] Disconnect error:', error);
      set({
        socket: null,
        isConnected: false,
      });
    }
  },

  /**
   * Emit event to server
   * - Sends data through socket connection
   * - Requires active connection
   *
   * Example: emit('message:send', { text: 'Hello' })
   */
  emit: (event: string, data?: any) => {
    const { socket } = get();

    if (!socket?.connected) {
      console.warn('[Socket] Not connected, cannot emit:', event);
      return;
    }

    try {
      if (data) {
        socket.emit(event, data);
      } else {
        socket.emit(event);
      }
    } catch (error) {
      console.error('[Socket] Emit error:', event, error);
    }
  },

  /**
   * Listen to socket event
   * - Registers event listener
   * - Callback called when event received
   *
   * Example: on('message:received', (message) => { ... })
   */
  on: (event: string, callback: (data: any) => void) => {
    const { socket } = get();

    if (!socket) {
      console.warn('[Socket] Socket not initialized');
      return;
    }

    try {
      socket.on(event, callback);
    } catch (error) {
      console.error('[Socket] on() error:', event, error);
    }
  },

  /**
   * Remove socket event listener
   * - Unregisters event listener
   * - Specific callback or all listeners if no callback
   *
   * Example: off('message:received', handler)
   */
  off: (event: string, callback?: (data: any) => void) => {
    const { socket } = get();

    if (!socket) {
      console.warn('[Socket] Socket not initialized');
      return;
    }

    try {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    } catch (error) {
      console.error('[Socket] off() error:', event, error);
    }
  },
}));
