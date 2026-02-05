import apiClient, { ApiResponse } from './client';

/**
 * Reaction API Types
 */
export namespace Reaction {
  export interface Reaction {
    id: string;
    postId: string;
    userId: string;
    emoji: string;
    user?: {
      id: string;
      fullName: string;
      avatar?: string;
    };
    createdAt: string;
  }

  export interface AddReactionRequest {
    emoji: string;
  }

  export interface ReactionSummary {
    emoji: string;
    count: number;
    userReacted: boolean;
  }
}

/**
 * Reactions API Module
 */
export const reactionApi = {
  /**
   * POST /posts/:postId/reactions
   * Add reaction to post (one per user, can update emoji)
   */
  addReaction: (postId: string, data: Reaction.AddReactionRequest) =>
    apiClient.post<ApiResponse<Reaction.Reaction>>(`/posts/${postId}/reactions`, data),

  /**
   * DELETE /posts/:postId/reactions
   * Remove your reaction from post
   */
  removeReaction: (postId: string) =>
    apiClient.delete<ApiResponse<void>>(`/posts/${postId}/reactions`),

  /**
   * GET /posts/:postId/reactions
   * Get all reactions for post
   */
  getReactions: (postId: string) =>
    apiClient.get<ApiResponse<Reaction.Reaction[]>>(`/posts/${postId}/reactions`),

  /**
   * GET /posts/:postId/reactions/summary
   * Get reaction summary (grouped by emoji)
   */
  getReactionsSummary: (postId: string) =>
    apiClient.get<ApiResponse<Reaction.ReactionSummary[]>>(`/posts/${postId}/reactions/summary`),
};
