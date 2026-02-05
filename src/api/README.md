/**
 * API Usage Guide
 *
 * This guide shows how to use the API layer in your application.
 * Remember: Never call axios directly from components!
 */

// ============================================================================
// ✅ CORRECT: Use API via Zustand Store
// ============================================================================

import { useAuthStore } from '@/store/auth.store';
import { useChannelStore } from '@/store/channel.store';
import { usePostStore } from '@/store/post.store';

// In a component:
export function MyComponent() {
  const { login } = useAuthStore();
  const { channels, fetchChannels } = useChannelStore();
  const { createPost } = usePostStore();

  return null;
}

// ============================================================================
// ✅ CORRECT: Use API directly in Zustand stores
// ============================================================================

import { create } from 'zustand';
import { authApi } from '@/api';

interface AuthStore {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      set({ user: response.data.data?.user });
    } catch (error) {
      // Error handling
      console.error(error);
    }
  },
}));

// ============================================================================
// ✅ CORRECT: Direct API usage in async operations/services
// ============================================================================

import { channelApi } from '@/api';

export async function fetchAllChannels() {
  try {
    const response = await channelApi.getPublicChannels();
    return response.data.data; // Extract data from response wrapper
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    throw error;
  }
}

// ============================================================================
// ❌ WRONG: Calling axios directly in components
// ============================================================================

// DON'T DO THIS:
// import axios from 'axios';
// const response = await axios.get('/channels/public');

// ============================================================================
// API Response Structure
// ============================================================================

// All API endpoints return wrapped responses:
// {
//   success: boolean,
//   data?: T,           // Actual data
//   message?: string
// }

// Errors return ApiErrorResponse:
// {
//   statusCode: number,
//   message: string,
//   error?: string,
//   details?: Record<string, any>
// }

// ============================================================================
// API Modules Overview
// ============================================================================

/**
 * Authentication
 * authApi.login(credentials)
 * authApi.register(data)
 * authApi.loginWithGoogle(idToken)
 * authApi.getCurrentUser()
 * authApi.refreshToken()
 * authApi.logout()
 */

/**
 * Channels
 * channelApi.getPublicChannels()
 * channelApi.getChannel(id)
 * channelApi.createChannel(data)
 * channelApi.updateChannel(id, data)
 * channelApi.deleteChannel(id)
 * channelApi.joinChannel(id)
 * channelApi.leaveChannel(id)
 * channelApi.requestJoinPrivate(id)
 * channelApi.approveJoinRequest(channelId, userId)
 * channelApi.rejectJoinRequest(channelId, userId)
 * channelApi.inviteUser(channelId, userId)
 * channelApi.getChannelMembers(id)
 * channelApi.removeMember(channelId, userId)
 */

/**
 * Groups
 * groupApi.getMyGroups()
 * groupApi.getGroup(id)
 * groupApi.createGroup(data)
 * groupApi.updateGroup(id, data)
 * groupApi.deleteGroup(id)
 * groupApi.inviteUser(groupId, userId)
 * groupApi.leaveGroup(id)
 * groupApi.removeUser(groupId, userId)
 * groupApi.getGroupMembers(id)
 */

/**
 * Posts
 * postApi.createPost(data)
 * postApi.getPostsByChannel(channelId, limit, offset)
 * postApi.getPostsByGroup(groupId, limit, offset)
 * postApi.getPost(id)
 * postApi.updatePost(id, data)
 * postApi.deletePost(id)
 * postApi.pinPost(id)
 * postApi.unpinPost(id)
 */

/**
 * Comments
 * commentApi.createComment(postId, data)
 * commentApi.getComments(postId, limit, offset)
 * commentApi.getComment(id)
 * commentApi.updateComment(id, data)
 * commentApi.deleteComment(id)
 */

/**
 * Direct Messages (WebSocket for real-time)
 * dmApi.getConversations(limit, offset)
 * dmApi.getConversationMessages(conversationId, limit, offset)
 * dmApi.sendMessage(data)          // REST endpoint
 * dmApi.markAsRead(conversationId)
 * dmApi.getConversation(conversationId)
 * dmApi.startConversation(userId)
 */

/**
 * Notifications
 * notificationApi.getNotifications(limit, offset)
 * notificationApi.getUnreadCount()
 * notificationApi.markAsRead(notificationId)
 * notificationApi.markAllAsRead()
 * notificationApi.deleteNotification(notificationId)
 * notificationApi.deleteAllNotifications()
 * notificationApi.getPreferences()
 * notificationApi.updatePreferences(data)
 */

// ============================================================================
// Error Handling Pattern
// ============================================================================

import { ApiErrorResponse } from '@/api';

async function example() {
  try {
    const response = await authApi.login({ email: 'user@example.com', password: 'pass' });
    const userData = response.data.data; // Double destructure due to ApiResponse wrapper
  } catch (error) {
    const apiError = error as ApiErrorResponse;

    switch (apiError.statusCode) {
      case 401:
        // Unauthorized - clear token, redirect to login
        break;
      case 422:
        // Validation error
        console.log('Validation errors:', apiError.details);
        break;
      case 500:
        // Server error
        console.log('Server error:', apiError.message);
        break;
      default:
        // Network or other error
        console.log('Error:', apiError.message);
    }
  }
}

// ============================================================================
// Environment Configuration
// ============================================================================

// Development: http://localhost:3000/api
// Or for physical device: http://YOUR_IP:3000/api

// Production: https://api.sarvadhi.com/api

// Set in src/api/client.ts
