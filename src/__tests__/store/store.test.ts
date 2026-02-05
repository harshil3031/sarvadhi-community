/**
 * Example Store Tests
 * 
 * Demonstrates testing Zustand stores
 */

import { renderHook, act } from '@testing-library/react-native';
import { useChannelStore } from '../../store/channel.store';
import { usePostStore } from '../../store/post.store';

// Mock the API
jest.mock('../../api/channels');
jest.mock('../../api/posts');

describe('Channel Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChannelStore.setState({
      channels: [],
      currentChannel: null,
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty channels array', () => {
      const { result } = renderHook(() => useChannelStore());
      expect(result.current.channels).toEqual([]);
    });

    it('should have null currentChannel', () => {
      const { result } = renderHook(() => useChannelStore());
      expect(result.current.currentChannel).toBeNull();
    });

    it('should not be loading', () => {
      const { result } = renderHook(() => useChannelStore());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setCurrentChannel', () => {
    it('should set current channel', () => {
      const { result } = renderHook(() => useChannelStore());
      const mockChannel = {
        id: 'channel-1',
        name: 'General',
        description: 'General channel',
        isPrivate: false,
        isMember: false,
        memberCount: 10,
        creatorId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.setCurrentChannel(mockChannel);
      });

      expect(result.current.currentChannel).toEqual(mockChannel);
    });

    it('should clear current channel', () => {
      const { result } = renderHook(() => useChannelStore());

      act(() => {
        result.current.setCurrentChannel(null);
      });

      expect(result.current.currentChannel).toBeNull();
    });
  });
});

describe('Post Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePostStore.setState({
      posts: [],
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty posts array', () => {
      const { result } = renderHook(() => usePostStore());
      expect(result.current.posts).toEqual([]);
    });

    it('should not be loading', () => {
      const { result } = renderHook(() => usePostStore());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearPosts', () => {
    it('should clear all posts', () => {
      const mockPosts = [
        {
          id: 'post-1',
          content: 'Test',
          channelId: 'channel-1',
          groupId: undefined,
          authorId: 'user-1',
          author: { id: 'user-1', fullName: 'Test User' },
          isPinned: false,
          reactionCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const { result } = renderHook(() => usePostStore());

      act(() => {
        usePostStore.setState({ posts: mockPosts });
      });

      expect(result.current.posts).toHaveLength(1);

      act(() => {
        result.current.clearPosts();
      });

      expect(result.current.posts).toHaveLength(0);
    });
  });
});
