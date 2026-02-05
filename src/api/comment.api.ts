import apiClient, { ApiResponse } from './client';

/**
 * Comment API Types
 */
export namespace Comment {
  export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    author: {
      id: string;
      fullName: string;
      avatar?: string;
    };
    content: string;
    reactionCount: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreateCommentRequest {
    content: string;
  }

  export interface UpdateCommentRequest {
    content: string;
  }
}

/**
 * Comments API Module
 */
export const commentApi = {
  /**
   * POST /comments
   * Create comment on post
   */
  createComment: (postId: string, data: Comment.CreateCommentRequest) =>
    apiClient.post<ApiResponse<Comment.Comment>>(`/comments`, { ...data, postId }),

  /**
   * GET /comments/post/:postId
   * Get comments for post
   */
  getComments: (postId: string, limit = 20, offset = 0) =>
    apiClient.get<ApiResponse<Comment.Comment[]>>(`/comments/post/${postId}`, {
      params: { limit, offset },
    }),

  /**
   * GET /comments/:id
   * Get specific comment
   */
  getComment: (id: string) =>
    apiClient.get<ApiResponse<Comment.Comment>>(`/comments/${id}`),

  /**
   * PUT /comments/:id
   * Update comment
   */
  updateComment: (id: string, data: Comment.UpdateCommentRequest) =>
    apiClient.put<ApiResponse<Comment.Comment>>(`/comments/${id}`, data),

  /**
   * DELETE /comments/:id
   * Delete comment
   */
  deleteComment: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/comments/${id}`),
};
