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
      const response = await channelApi.getPublicChannels();
      set({ channels: response.data.data || [], isLoading: false });
    } catch (error) {
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
