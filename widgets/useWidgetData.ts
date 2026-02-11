/**
 * Custom Hook for Widget Data Management
 * Handles fetching and managing widget notification data
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import widgetService, { WidgetNotification } from './widgetService';

const USER_ID_KEY = '@sarvadhi_user_id';

interface UseWidgetDataResult {
  notifications: WidgetNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

export const useWidgetData = (): UseWidgetDataResult => {
  const [notifications, setNotifications] = useState<WidgetNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get stored user ID
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Fetch notifications and unread count in parallel
      const [fetchedNotifications, count] = await Promise.all([
        widgetService.fetchWidgetNotifications(userId, 10),
        widgetService.getUnreadCount(userId),
      ]);

      setNotifications(fetchedNotifications);
      setUnreadCount(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('Error fetching widget data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await widgetService.clearCache();
    await fetchData();
  }, [fetchData]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const userId = await AsyncStorage.getItem(USER_ID_KEY);
        if (userId) {
          await widgetService.markAsRead(notificationId, userId);
          await refresh();
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [refresh]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (userId) {
        unsubscribe = widgetService.subscribeToWidgetUpdates(userId, (newNotifications) => {
          setNotifications(newNotifications);
          setUnreadCount(newNotifications.filter((n) => !n.read).length);
        });
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
  };
};
