import { create } from 'zustand';
import { channelApi, Channel } from '../api/channels';

interface ChannelState {
  channels: Channel.Channel[];
  currentChannel: Channel.Channel | null;
  isLoading: boolean;

  // Actions
  fetchChannels: () => Promise<void>;
  fetchChannel: (id: string) => Promise<void>;
  joinChannel: (id: string) => Promise<void>;
  requestJoinPrivate: (id: string) => Promise<void>;
  leaveChannel: (id: string) => Promise<void>;
  setCurrentChannel: (channel: Channel.Channel | null) => void;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  currentChannel: null,
  isLoading: false,

  fetchChannels: async () => {
    try {
      set({ isLoading: true });
      const response = await channelApi.getAccessibleChannels();
      console.log('[ChannelStore] Fetched accessible channels:', response.data.data?.length);
      const channels = response.data.data || [];

      // Log membership status for debugging
      if (channels.length > 0) {
        const memberCount = channels.filter(c => c.isMember).length;
        console.log(`[ChannelStore] Total channels: ${channels.length}, Joined: ${memberCount}`);
        if (memberCount === 0) {
          console.log('[ChannelStore] No joined channels found. First channel:', JSON.stringify(channels[0]));
        }
      }

      set({ channels, isLoading: false });
    } catch (error) {
      console.error('[ChannelStore] Error fetching channels:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchChannel: async (id: string) => {
    try {
      set({ isLoading: true });
      const response = await channelApi.getChannel(id);
      set({ currentChannel: response.data.data || null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  joinChannel: async (id: string) => {
    try {
      await channelApi.joinChannel(id);

      // Update local state
      const channels = get().channels.map((c) =>
        c.id === id ? { ...c, isMember: true } : c
      );
      set({ channels });

      // Refresh channels to get updated data
      await get().fetchChannels();
    } catch (error) {
      throw error;
    }
  },

  requestJoinPrivate: async (id: string) => {
    try {
      await channelApi.requestJoinPrivate(id);
      // No state update needed immediately as it's 'pending'
    } catch (error) {
      throw error;
    }
  },

  leaveChannel: async (id: string) => {
    try {
      await channelApi.leaveChannel(id);

      // Update local state
      const channels = get().channels.map((c) =>
        c.id === id ? { ...c, isMember: false } : c
      );
      set({ channels });

      // Refresh channels to get updated data
      await get().fetchChannels();
    } catch (error) {
      throw error;
    }
  },

  setCurrentChannel: (channel: Channel.Channel | null) => {
    set({ currentChannel: channel });
  },
}));
