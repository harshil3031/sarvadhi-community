import apiClient, { ApiResponse } from './client';

/**
 * Direct Message API Types
 */
export namespace DM {
  export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender: {
      id: string;
      fullName: string;
      avatar?: string;
    };
    text: string;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Conversation {
    id: string;
    participants: Array<{
      id: string;
      fullName: string;
      email: string;
      avatar?: string;
    }>;
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
    createdAt: string;
  }

  export interface SendMessageRequest {
    conversationId: string;
    text: string;
  }
}

/**
 * Direct Messages API Module
 * Note: WebSocket connection is handled separately for real-time messaging
 */
export const dmApi = {
  /**
   * GET /dms/conversations
   * Get all conversations for current user
   */
  getConversations: (limit = 50, offset = 0) =>
    apiClient.get<ApiResponse<DM.Conversation[]>>('/dms/conversations', {
      params: { limit, offset },
    }),

  /**
   * GET /dms/conversations/:conversationId/messages
   * Get messages for specific conversation
   */
  getConversationMessages: (conversationId: string, limit = 50, offset = 0) =>
    apiClient.get<ApiResponse<DM.Message[]>>(`/dms/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    }),

  /**
   * POST /dms/send
   * Send message (REST endpoint for history, real-time via WebSocket)
   */
  sendMessage: (data: DM.SendMessageRequest) =>
    apiClient.post<ApiResponse<DM.Message>>('/dms/send', data),

  /**
   * POST /dms/:conversationId/read
   * Mark conversation messages as read
   */
  markAsRead: (conversationId: string) =>
    apiClient.post<ApiResponse<void>>(`/dms/${conversationId}/read`),

  /**
   * POST /dms/conversations
   * Start new conversation with user (or get existing)
   */
  startConversation: (userId: string) =>
    apiClient.post<ApiResponse<DM.Conversation>>('/dms/conversations', { userId }),
};
