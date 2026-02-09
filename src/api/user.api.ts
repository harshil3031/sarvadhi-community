import apiClient, { ApiResponse } from './client';
import { Auth } from './auth';

export namespace UserApi {
    export interface UserProfile extends Auth.User {
        last_seen_at?: string;
    }

    export interface SearchResponse {
        users: UserProfile[];
        channels: any[];
        groups: any[];
    }
}

export const userApi = {
    /**
     * GET /users/:id
     * Get user profile by ID
     */
    getUserById: (id: string) =>
        apiClient.get<ApiResponse<UserApi.UserProfile>>(`/users/${id}`),

    /**
     * GET /users/search
     * Search users by name or email
     */
    searchUsers: (query: string) =>
        apiClient.get<ApiResponse<UserApi.UserProfile[]>>('/users/search', { params: { q: query } }),

    /**
     * GET /channels/search
     * Search channels by name
     */
    searchChannels: (query: string) =>
        apiClient.get<ApiResponse<any[]>>('/channels/search', { params: { q: query } }),

    /**
     * GET /groups/search
     * Search groups by name
     */
    searchGroups: (query: string) =>
        apiClient.get<ApiResponse<any[]>>('/groups/search', { params: { q: query } }),
};
