/**
 * Widget Service - Manages widget data updates and synchronization
 * Handles fetching notifications and updating widget state
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_CACHE_KEY = '@sarvadhi_widget_notifications';
const WIDGET_LAST_UPDATE_KEY = '@sarvadhi_widget_last_update';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface WidgetNotification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'mention' | 'announcement' | 'achievement';
  timestamp: string;
  read: boolean;
  userId?: string;
  userName?: string;
}

class WidgetService {
  private static instance: WidgetService;
  private apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.169:3000/api',
    timeout: 10000,
  });

  private constructor() {}

  static getInstance(): WidgetService {
    if (!WidgetService.instance) {
      WidgetService.instance = new WidgetService();
    }
    return WidgetService.instance;
  }

  /**
   * Fetch notifications for widget display
   */
  async fetchWidgetNotifications(
    userId: string,
    limit: number = 5
  ): Promise<WidgetNotification[]> {
    try {
      // Check cache first
      const cachedData = await this.getCachedNotifications();
      if (cachedData) {
        return cachedData;
      }

      // Fetch from API
      const response = await this.apiClient.get(
        `/notifications?userId=${userId}&limit=${limit}&widget=true`
      );

      const notifications: WidgetNotification[] = response.data.notifications || [];

      // Cache the result
      await this.cacheNotifications(notifications);

      return notifications;
    } catch (error) {
      console.error('Error fetching widget notifications:', error);
      // Return cached data if available, otherwise empty array
      const cachedData = await this.getCachedNotifications();
      return cachedData || [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await this.apiClient.get(`/notifications/unread-count/${userId}`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read from widget
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.apiClient.put(`/notifications/${notificationId}/read`, {
        userId,
        widget: true,
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Cache notifications locally
   */
  private async cacheNotifications(notifications: WidgetNotification[]): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify(notifications)),
        AsyncStorage.setItem(WIDGET_LAST_UPDATE_KEY, new Date().toISOString()),
      ]);
    } catch (error) {
      console.error('Error caching notifications:', error);
    }
  }

  /**
   * Get cached notifications if still valid
   */
  private async getCachedNotifications(): Promise<WidgetNotification[] | null> {
    try {
      const [cachedData, lastUpdate] = await Promise.all([
        AsyncStorage.getItem(WIDGET_CACHE_KEY),
        AsyncStorage.getItem(WIDGET_LAST_UPDATE_KEY),
      ]);

      if (!cachedData || !lastUpdate) {
        return null;
      }

      const lastUpdateTime = new Date(lastUpdate).getTime();
      const now = new Date().getTime();

      // Check if cache is still valid
      if (now - lastUpdateTime > CACHE_DURATION) {
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error retrieving cached notifications:', error);
      return null;
    }
  }

  /**
   * Clear widget cache
   */
  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(WIDGET_CACHE_KEY),
        AsyncStorage.removeItem(WIDGET_LAST_UPDATE_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing widget cache:', error);
    }
  }

  /**
   * Subscribe to real-time notification updates
   * For integration with Firebase Messaging
   */
  subscribeToWidgetUpdates(
    userId: string,
    onUpdate: (notifications: WidgetNotification[]) => void
  ): () => void {
    // This would be integrated with Firebase Cloud Messaging
    // or WebSocket for real-time updates
    const interval = setInterval(() => {
      this.fetchWidgetNotifications(userId).then(onUpdate);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }
}

export default WidgetService.getInstance();
