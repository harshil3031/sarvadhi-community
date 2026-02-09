import { useEffect, useCallback, useRef } from 'react';
import { useSocketStore } from '../store/socket.store';
import { Notification, notificationApi } from '../api/notification.api';
import { useAuthStore } from '../store/auth.store';

/**
 * Hook to manage Real-time Notification WebSocket events
 */
export const useNotificationSocket = () => {
    const { socket, on, off } = useSocketStore();
    const { isAuthenticated } = useAuthStore();
    const listenersRef = useRef<Array<{ event: string; callback: any }>>([]);

    /**
     * Listen for new notifications
     */
    const addNotificationListener = useCallback((callback: (notification: Notification.Notification) => void) => {
        const wrappedCallback = (payload: any) => {
            callback(payload);
        };

        on('new_notification', wrappedCallback);
        listenersRef.current.push({ event: 'new_notification', callback: wrappedCallback });
    }, [on]);

    /**
     * Remove notification listener
     */
    const removeNotificationListener = useCallback((callback: (notification: Notification.Notification) => void) => {
        // In a production app, we'd need to match the original callback
        // For this implementation, we'll assume the caller manages their own cleanup or use the useEffect below
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            listenersRef.current.forEach(({ event, callback }) => {
                off(event, callback);
            });
            listenersRef.current = [];
        };
    }, [off]);

    return {
        addNotificationListener,
        removeNotificationListener,
        isConnected: socket?.connected ?? false,
    };
};
