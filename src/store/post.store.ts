import { create } from 'zustand';
import { postApi, Post } from '../api/posts';

interface PostState {
  posts: Post.Post[];
  isLoading: boolean;
  
  // Actions
  fetchPostsByChannel: (channelId: string) => Promise<void>;
  fetchPostsByGroup: (groupId: string) => Promise<void>;
  fetchFeedPosts: (channelIds: string[]) => Promise<void>;
  createPost: (content: string, channelId?: string, groupId?: string) => Promise<Post.Post>;
  deletePost: (id: string) => Promise<void>;
  clearPosts: () => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,

  fetchPostsByChannel: async (channelId: string) => {
    try {
      set({ isLoading: true });
      const response = await postApi.getPostsByChannel(channelId);
      set({ posts: response.data.data || [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPostsByGroup: async (groupId: string) => {
    try {
      set({ isLoading: true });
      const response = await postApi.getPostsByGroup(groupId);
      set({ posts: response.data.data || [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchFeedPosts: async (channelIds: string[]) => {
    try {
      set({ isLoading: true });
      
      // Fetch posts from all channels in parallel
      const promises = channelIds.map(id => postApi.getPostsByChannel(id));
      const responses = await Promise.allSettled(promises);
      
      // Combine all posts
      const allPosts: Post.Post[] = [];
      responses.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data.data) {
          allPosts.push(...result.value.data.data);
        }
      });
      
      // Sort by creation date
      allPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      set({ posts: allPosts, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createPost: async (content: string, channelId?: string, groupId?: string) => {
    try {
      const response = await postApi.createPost({
        content,
        channelId,
        groupId,
      });
      
      // Add to local state
      const newPost = response.data.data;
      if (newPost) {
        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      }
      
      return newPost || ({} as Post.Post);
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (id: string) => {
    try {
      await postApi.deletePost(id);
      
      // Remove from local state
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  clearPosts: () => {
    set({ posts: [] });
  },
}));
