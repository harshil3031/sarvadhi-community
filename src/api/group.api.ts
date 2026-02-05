import apiClient, { ApiResponse } from './client';

/**
 * Group API Types
 */
export namespace Group {
  export interface Group {
    id: string;
    name: string;
    description?: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    memberCount?: number;
  }

  export interface CreateGroupRequest {
    name: string;
    description?: string;
  }

  export interface UpdateGroupRequest {
    name?: string;
    description?: string;
  }

  export interface GroupMember {
    id: string;
    fullName: string;
    email: string;
    role: 'creator' | 'admin' | 'member';
    joinedAt: string;
  }
}

/**
 * Groups API Module
 */
export const groupApi = {
  /**
   * GET /groups/my
   * Get current user's groups
   */
  getMyGroups: () =>
    apiClient.get<ApiResponse<Group.Group[]>>('/groups/my'),

  /**
   * GET /groups/:id
   * Get specific group details
   */
  getGroup: (id: string) =>
    apiClient.get<ApiResponse<Group.Group>>(`/groups/${id}`),

  /**
   * POST /groups
   * Create new group
   */
  createGroup: (data: Group.CreateGroupRequest) =>
    apiClient.post<ApiResponse<Group.Group>>('/groups', data),

  /**
   * PUT /groups/:id
   * Update group (creator only)
   */
  updateGroup: (id: string, data: Group.UpdateGroupRequest) =>
    apiClient.put<ApiResponse<Group.Group>>(`/groups/${id}`, data),

  /**
   * DELETE /groups/:id
   * Delete group (creator only)
   */
  deleteGroup: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/groups/${id}`),

  /**
   * POST /groups/:id/invite
   * Invite user to group
   */
  inviteUser: (groupId: string, userId: string) =>
    apiClient.post<ApiResponse<void>>(`/groups/${groupId}/invite`, { userId }),

  /**
   * POST /groups/:id/leave
   * Leave a group
   */
  leaveGroup: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/groups/${id}/leave`),

  /**
   * POST /groups/:id/remove-user
   * Remove user from group (creator only)
   */
  removeUser: (groupId: string, userId: string) =>
    apiClient.post<ApiResponse<void>>(`/groups/${groupId}/remove-user`, { userId }),

  /**
   * GET /groups/:id/members
   * Get group members
   */
  getGroupMembers: (id: string) =>
    apiClient.get<ApiResponse<Group.GroupMember[]>>(`/groups/${id}/members`),
};
