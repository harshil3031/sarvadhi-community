import { create } from 'zustand';
import { Notification, notificationApi } from '../api/notification.api';

interface NotificationState {
    unreadCount: number;
    notifications: Notification.Notification[];
    isLoading: boolean;

    // Actions
    fetchUnreadCount: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    incrementUnreadCount: () => void;
    markAsRead: (id: string) => Promise<void>;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    unreadCount: 0,
    notifications: [],
    isLoading: false,

    fetchUnreadCount: async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            if (response.data.success && response.data.data) {
                set({ unreadCount: response.data.data.count });
            }
        } catch (err) {
            console.error('Failed to fetch unread notification count:', err);
        }
    },

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const response = await notificationApi.getNotifications(50, 0);
            if (response.data.success && response.data.data) {
                set({
                    notifications: response.data.data,
                    unreadCount: response.data.data.filter(n => !n.isRead).length
                });
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            set({ isLoading: false });
        }
    },

    incrementUnreadCount: () => {
        set(state => ({ unreadCount: state.unreadCount + 1 }));
    },

    setUnreadCount: (count: number) => {
        set({ unreadCount: count });
    },

    markAsRead: async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            set(state => ({
                unreadCount: Math.max(0, state.unreadCount - 1),
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                )
            }));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }
}));
