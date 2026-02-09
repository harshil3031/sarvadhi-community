import { useEffect, useRef, useCallback } from 'react';
import { useSocketStore } from '../store/socket.store';

interface DMSocketEvents {
  'dm:message_received': (message: any) => void;
  'dm:user_typing': (data: { conversationId: string; userName: string }) => void;
  'dm:typing_stop': (data: { conversationId: string; userName?: string }) => void;
  'dm:message_read': (data: { conversationId: string; messageId: string }) => void;
}

/**
 * Hook to manage DM WebSocket events
 * Listens to real-time messages, typing indicators, and read receipts
 */
export const useDMSocket = () => {
  const { socket, emit, on, off } = useSocketStore();
  const listenersRef = useRef<Array<{ event: string; callback: any; originalCallback?: any }>>([]);

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

      // Map high-level DM events to low-level socket events from backend
      let backendEvent: string = event;
      let wrappedCallback: any = callback;

      if (event === 'dm:message_received') {
        backendEvent = 'receive_message';
        wrappedCallback = (payload: any) => {
          // Backend sends { message, conversationId }
          (callback as DMSocketEvents['dm:message_received'])(payload.message);
        };
      } else if (event === 'dm:user_typing') {
        backendEvent = 'user_typing';
        wrappedCallback = (payload: any) => {
          (callback as DMSocketEvents['dm:user_typing'])({
            conversationId: payload.conversationId,
            userName: payload.userName || 'Someone',
          });
        };
      } else if (event === 'dm:typing_stop') {
        backendEvent = 'user_stop_typing';
        wrappedCallback = (payload: any) => {
          (callback as DMSocketEvents['dm:typing_stop'])({
            conversationId: payload.conversationId,
            userName: payload.userName,
          });
        };
      } else if (event === 'dm:message_read') {
        backendEvent = 'message_read';
        wrappedCallback = (payload: any) => {
          (callback as DMSocketEvents['dm:message_read'])({
            conversationId: payload.conversationId,
            messageId: payload.messageId || '', // Backend might send userId if multiple read
          });
        };
      }

      on(backendEvent, wrappedCallback);
      listenersRef.current.push({
        event: backendEvent,
        callback: wrappedCallback,
        originalCallback: callback
      });
    },
    [on, socket]
  );

  /**
   * Emit message to server
   */
  const sendMessage = useCallback(
    (conversationId: string, text: string): void => {
      // Backend listens to `send_message`
      emit('send_message', {
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
      // Backend listens to `typing`
      emit('typing', { conversationId });
    },
    [emit]
  );

  /**
   * Stop typing notification
   */
  const stopTyping = useCallback(
    (conversationId: string): void => {
      // Backend listens to `stop_typing`
      emit('stop_typing', { conversationId });
    },
    [emit]
  );

  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(
    (conversationId: string): void => {
      // Backend currently doesn't track read receipts; this is a no-op placeholder
      // Keeping emit for future backend support
      emit('mark_read', { conversationId });
    },
    [emit]
  );

  /**
   * Join a DM conversation room for real-time updates
   */
  const joinConversation = useCallback(
    (conversationId: string): void => {
      emit('join_conversation', { conversationId });
    },
    [emit]
  );

  /**
   * Leave a DM conversation room
   */
  const leaveConversation = useCallback(
    (conversationId: string): void => {
      emit('leave_conversation', { conversationId });
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

  /**
   * Remove event listener
   */
  const removeEventListener = useCallback(
    <K extends keyof DMSocketEvents>(event: K, callback: DMSocketEvents[K]): void => {
      const entry = listenersRef.current.find(
        (l) => l.originalCallback === callback
      );
      if (entry) {
        off(entry.event, entry.callback);
        listenersRef.current = listenersRef.current.filter((l) => l !== entry);
      }
    },
    [off]
  );

  return {
    isConnected: socket?.connected ?? false,
    addSocketListener: addEventListener,
    removeSocketListener: removeEventListener,
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
    joinConversation,
    leaveConversation,
  };
};
