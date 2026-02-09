import { create } from 'zustand';
import { dmApi } from '../api/dm.api';

interface DMState {
    unreadCount: number;

    // Actions
    fetchTotalUnreadCount: () => Promise<void>;
    setUnreadCount: (count: number) => void;
    incrementUnreadCount: () => void;
}

export const useDMStore = create<DMState>((set) => ({
    unreadCount: 0,

    fetchTotalUnreadCount: async () => {
        try {
            const response = await dmApi.getConversations();
            if (response.data.success && response.data.data) {
                const total = response.data.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
                set({ unreadCount: total });
            }
        } catch (err) {
            console.error('Failed to fetch DM unread count:', err);
        }
    },

    setUnreadCount: (count: number) => {
        set({ unreadCount: count });
    },

    incrementUnreadCount: () => {
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
    }
}));
