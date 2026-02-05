import apiClient, { ApiResponse } from './client';

/**
 * Channel API Types
 */
export namespace Channel {
  export interface Channel {
    id: string;
    name: string;
    description?: string;
    type: 'public' | 'private';
    createdBy: string; // Changed from creatorId to match backend
    createdAt: string;
    updatedAt: string;
    memberCount?: number;
    isMember?: boolean;
  }

  export interface CreateChannelRequest {
    name: string;
    description?: string;
    type: 'public' | 'private';
  }

  export interface UpdateChannelRequest {
    name?: string;
    description?: string;
  }

  export interface JoinRequestResponse {
    id: string;
    userId: string;
    channelId: string;
    status: 'pending' | 'approved' | 'rejected';
  }
}

/**
 * Channels API Module
 */
export const channelApi = {
  /**
   * GET /channels/public
   * Get all public channels
   */
  getPublicChannels: () =>
    apiClient.get<ApiResponse<Channel.Channel[]>>('/channels/public'),

  /**
   * GET /channels/:id
   * Get specific channel details
   */
  getChannel: (id: string) =>
    apiClient.get<ApiResponse<Channel.Channel>>(`/channels/${id}`),

  /**
   * POST /channels
   * Create new channel (admin/moderator only)
   */
  createChannel: (data: Channel.CreateChannelRequest) =>
    apiClient.post<ApiResponse<Channel.Channel>>('/channels', data),

  /**
   * PUT /channels/:id
   * Update channel details
   */
  updateChannel: (id: string, data: Channel.UpdateChannelRequest) =>
    apiClient.put<ApiResponse<Channel.Channel>>(`/channels/${id}`, data),

  /**
   * DELETE /channels/:id
   * Delete channel
   */
  deleteChannel: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/channels/${id}`),

  /**
   * POST /channels/:id/join
   * Join a public channel
   */
  joinChannel: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/channels/${id}/join`),

  /**
   * POST /channels/:id/leave
   * Leave a channel
   */
  leaveChannel: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/channels/${id}/leave`),

  /**
   * POST /channels/:id/request
   * Request to join private channel
   */
  requestJoinPrivate: (id: string) =>
    apiClient.post<ApiResponse<Channel.JoinRequestResponse>>(`/channels/${id}/request`),

  /**
   * POST /channels/:id/approve
   * Approve join request (moderator/admin only)
   */
  approveJoinRequest: (channelId: string, userId: string) =>
    apiClient.post<ApiResponse<void>>(`/channels/${channelId}/approve`, { userId }),

  /**
   * POST /channels/:id/reject
   * Reject join request (moderator/admin only)
   */
  rejectJoinRequest: (channelId: string, userId: string) =>
    apiClient.post<ApiResponse<void>>(`/channels/${channelId}/reject`, { userId }),

  /**
   * POST /channels/:id/invite
   * Invite user to channel (moderator/admin only)
   */
  inviteUser: (channelId: string, userId: string) =>
    apiClient.post<ApiResponse<void>>(`/channels/${channelId}/invite`, { userId }),

  /**
   * GET /channels/:id/members
   * Get channel members
   */
  getChannelMembers: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/channels/${id}/members`),

  /**
   * POST /channels/:id/remove-member
   * Remove member from channel (moderator/admin only)
   */
  removeMember: (channelId: string, userId: string) =>
    apiClient.post<ApiResponse<void>>(`/channels/${channelId}/remove-member`, { userId }),
};

