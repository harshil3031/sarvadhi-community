import apiClient, { ApiResponse } from './client';

/**
 * Notification API Types
 */
export namespace Notification {
  export interface Notification {
    id: string;
    userId: string;
    type: 'mention' | 'reaction' | 'comment' | 'message' | 'channel_invite' | 'group_invite';
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface NotificationPreferences {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    mentionNotifications: boolean;
    reactionNotifications: boolean;
    commentNotifications: boolean;
    messageNotifications: boolean;
    inviteNotifications: boolean;
  }
}

/**
 * Notifications API Module
 */
export const notificationApi = {
  /**
   * GET /notifications
   * Get user notifications
   */
  getNotifications: (limit = 50, offset = 0) =>
    apiClient.get<ApiResponse<Notification.Notification[]>>('/notifications', {
      params: { limit, offset },
    }),

  /**
   * GET /notifications/unread
   * Get unread notification count
   */
  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread'),

  /**
   * POST /notifications/:id/read
   * Mark notification as read
   */
  markAsRead: (notificationId: string) =>
    apiClient.post<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  /**
   * POST /notifications/read-all
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    apiClient.post<ApiResponse<void>>('/notifications/read-all'),

  /**
   * DELETE /notifications/:id
   * Delete notification
   */
  deleteNotification: (notificationId: string) =>
    apiClient.delete<ApiResponse<void>>(`/notifications/${notificationId}`),

  /**
   * DELETE /notifications
   * Delete all notifications
   */
  deleteAllNotifications: () =>
    apiClient.delete<ApiResponse<void>>('/notifications'),

  /**
   * GET /notifications/preferences
   * Get notification preferences
   */
  getPreferences: () =>
    apiClient.get<ApiResponse<Notification.NotificationPreferences>>('/notifications/preferences'),

  /**
   * PUT /notifications/preferences
   * Update notification preferences
   */
  updatePreferences: (data: Partial<Notification.NotificationPreferences>) =>
    apiClient.put<ApiResponse<Notification.NotificationPreferences>>('/notifications/preferences', data),
};
