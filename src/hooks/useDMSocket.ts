import { useEffect, useRef, useCallback } from 'react';
import { useSocketStore } from '../store/socket.store';

interface DMSocketEvents {
  'dm:message_received': (message: any) => void;
  'dm:user_typing': (data: { conversationId: string; userName: string }) => void;
  'dm:typing_stop': (data: { conversationId: string }) => void;
  'dm:message_read': (data: { conversationId: string; messageId: string }) => void;
}

/**
 * Hook to manage DM WebSocket events
 * Listens to real-time messages, typing indicators, and read receipts
 */
export const useDMSocket = () => {
  const { socket, emit, on, off } = useSocketStore();
  const listenersRef = useRef<Array<{ event: string; callback: any }>>([]);

  /**
   * Register event listener
   * Tracks listeners for cleanup on unmount
   */
  const addEventListener = useCallback(
    <K extends keyof DMSocketEvents>(
      event: K,
      callback: DMSocketEvents[K]
    ): void => {
      if (!socket?.connected) {
        console.warn('[DM Socket] Socket not connected, listener will be queued');
      }

      on(event, callback);
      listenersRef.current.push({ event, callback });
    },
    [on, socket]
  );

  /**
   * Emit message to server
   */
  const sendMessage = useCallback(
    (conversationId: string, text: string): void => {
      emit('dm:send_message', {
        conversationId,
        text,
        timestamp: new Date().toISOString(),
      });
    },
    [emit]
  );

  /**
   * Notify that user is typing
   */
  const sendTyping = useCallback(
    (conversationId: string): void => {
      emit('dm:typing', { conversationId });
    },
    [emit]
  );

  /**
   * Stop typing notification
   */
  const stopTyping = useCallback(
    (conversationId: string): void => {
      emit('dm:typing_stop', { conversationId });
    },
    [emit]
  );

  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(
    (conversationId: string): void => {
      emit('dm:mark_read', { conversationId });
    },
    [emit]
  );

  /**
   * Cleanup listeners on unmount
   */
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(({ event, callback }) => {
        off(event, callback);
      });
      listenersRef.current = [];
    };
  }, [off]);

  return {
    isConnected: socket?.connected ?? false,
    addEventListener,
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
  };
};
