import apiClient, { ApiResponse } from './client';

/**
 * Post API Types
 */
export namespace Post {
  export interface Post {
    id: string;
    content: string;
    channelId?: string;
    groupId?: string;
    authorId: string;
    author: {
      id: string;
      fullName: string;
      avatar?: string;
    };
    isPinned: boolean;
    reactionCount: number;
    commentCount: number;
    userReaction?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreatePostRequest {
    content: string;
    channelId?: string;
    groupId?: string;
  }

  export interface UpdatePostRequest {
    content: string;
  }
}

/**
 * Posts API Module
 */
export const postApi = {
  /**
   * POST /posts
   * Create new post
   */
  createPost: (data: Post.CreatePostRequest) =>
    apiClient.post<ApiResponse<Post.Post>>('/posts', data),

  /**
   * GET /posts
   * Get feed posts (paginated)
   */
  getFeedPosts: (limit = 20, offset = 0) =>
    apiClient.get<ApiResponse<Post.Post[]>>('/posts', {
      params: { limit, offset },
    }),

  /**
   * GET /posts/channel/:channelId
   * Get posts by channel
   */
  getPostsByChannel: (channelId: string, limit = 20, offset = 0) =>
    apiClient.get<ApiResponse<Post.Post[]>>(`/posts/channel/${channelId}`, {
      params: { limit, offset },
    }),

  /**
   * GET /posts/group/:groupId
   * Get posts by group
   */
  getPostsByGroup: (groupId: string, limit = 20, offset = 0) =>
    apiClient.get<ApiResponse<Post.Post[]>>(`/posts/group/${groupId}`, {
      params: { limit, offset },
    }),

  /**
   * GET /posts/user/:authorId
   * Get posts by author
   */
  getPostsByAuthor: (authorId: string, limit = 20, offset = 0) =>
    apiClient.get<ApiResponse<Post.Post[]>>(`/posts/user/${authorId}`, {
      params: { limit, offset },
    }),

  /**
   * GET /posts/:id
   * Get specific post
   */
  getPost: (id: string) =>
    apiClient.get<ApiResponse<Post.Post>>(`/posts/${id}`),

  /**
   * PUT /posts/:id
   * Update post
   */
  updatePost: (id: string, data: Post.UpdatePostRequest) =>
    apiClient.put<ApiResponse<Post.Post>>(`/posts/${id}`, data),

  /**
   * DELETE /posts/:id
   * Delete post
   */
  deletePost: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/posts/${id}`),

  /**
   * POST /posts/:id/pin
   * Pin post (moderator/admin only)
   */
  pinPost: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/posts/${id}/pin`),

  /**
   * POST /posts/:id/unpin
   * Unpin post (moderator/admin only)
   */
  unpinPost: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/posts/${id}/unpin`),
};

