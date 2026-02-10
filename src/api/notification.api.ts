import apiClient, { ApiResponse } from './client';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
/**
 * Notification API Types
 */
export namespace Notification {
  export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    referenceId?: string | null;
    relatedId?: string | null; // Channel ID or Group ID for invitations
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

  registerPushToken: (token: string, platform: 'android' | 'ios') =>
    apiClient.post('/notifications/push-token', {
      token,
      platform,
    }),

  sendTestPush: (title?: string, message?: string) =>
    apiClient.post<ApiResponse<void>>('/notifications/test-push', {
      title,
      message,
    }),
};

export const registerPushToken = async () => {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const token = await messaging().getToken();
  if (!token) return;

  console.log('Obtained FCM token:', token);
  await notificationApi.registerPushToken(token, Platform.OS);
};

export const setupAndroidNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3b82f6',
    sound: 'default',
  });

  // Create a high priority channel for important notifications
  await Notifications.setNotificationChannelAsync('important', {
    name: 'Important',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3b82f6',
    sound: 'default',
  });
};

export const setupIOSNotificationSound = async () => {
  if (Platform.OS !== 'ios') return;

  // Configure iOS notification settings - sound is enabled by default
  // on iOS and will use the system default notification sound
  console.log('iOS notification sound configuration enabled');
};
