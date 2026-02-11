import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { WidgetActivityBackgroundColor } from 'react-native-android-widget';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { theme } from '../src/theme/index';
import widgetService, { WidgetNotification } from './widgetService';

/**
 * Android Widget Component
 * This component is rendered by react-native-android-widget
 * It's a separate React tree from the main app
 */

interface WidgetProps {
  widgetId: string;
  userId?: string;
}

export const AndroidNotificationWidget: React.FC<WidgetProps> = ({
  widgetId,
  userId: propsUserId,
}) => {
  const { mode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | null>(propsUserId || null);
  const [notifications, setNotifications] = useState<WidgetNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Get userId from storage if not provided
  useEffect(() => {
    const initUserId = async () => {
      if (!propsUserId) {
        try {
          const storedUserId = await AsyncStorage.getItem('@sarvadhi_user_id');
          if (storedUserId) {
            setUserId(storedUserId);
          } else {
            setError('User not logged in');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error retrieving userId:', err);
          setError('Failed to load user');
          setLoading(false);
        }
      }
    };
    initUserId();
  }, [propsUserId]);

  // Load widget data
  const loadWidgetData = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const [notifications, count] = await Promise.all([
        widgetService.fetchWidgetNotifications(userId, 5),
        widgetService.getUnreadCount(userId),
      ]);

      setNotifications(notifications);
      setUnreadCount(count);
      setLastUpdate(new Date());
      console.log(`[Widget] Updated ${notifications.length} notifications at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('[Widget] Error loading data:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadWidgetData();
    }
  }, [userId, loadWidgetData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      console.log('[Widget] Auto-refreshing...');
      loadWidgetData();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, loadWidgetData]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [userId, loadWidgetData]);

  const handleAppStateChange = (status: AppStateStatus) => {
    if (status === 'active') {
      console.log('[Widget] App in foreground, refreshing...');
      loadWidgetData();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: '#000',
    },
    badge: {
      backgroundColor: theme.colors.light.primary,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
    },
    notificationItem: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      backgroundColor: '#f5f5f5',
      borderRadius: theme.radius.md,
      borderLeftWidth: 4,
    },
    notificationItemUnread: {
      borderLeftColor: theme.colors.light.primary,
      backgroundColor: '#fff9f5',
    },
    notificationItemRead: {
      borderLeftColor: '#ddd',
      opacity: 0.7,
    },
    notificationTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
      color: '#333',
      marginBottom: 2,
    },
    notificationMessage: {
      fontSize: theme.typography.caption.fontSize,
      color: '#666',
      lineHeight: 16,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    emptyText: {
      fontSize: theme.typography.body.fontSize,
      color: '#999',
      textAlign: 'center',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    updateTime: {
      fontSize: 9,
      color: '#999',
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    debugInfo: {
      fontSize: 8,
      color: '#999',
      marginTop: theme.spacing.sm,
      padding: theme.spacing.xs,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
    },
    errorContainer: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: '#ffe6e6',
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      borderLeftColor: '#ff4444',
    },
    errorText: {
      fontSize: theme.typography.body.fontSize,
      color: '#ff4444',
    },
  });

  if (error && loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator
          size="small"
          color={mode === 'dark' ? theme.colors.dark.primary : theme.colors.light.primary}
        />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Please log in to the app</Text>
        <Text style={styles.debugInfo}>No user ID found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Debug Info */}
      <Text style={styles.debugInfo}>
        User: {userId} | Notifications: {notifications.length} | Unread: {unreadCount}
      </Text>

      {/* Header with title and unread badge */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : null}

      {/* Notification List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <ScrollView scrollEnabled={notifications.length > 3} showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.read
                  ? styles.notificationItemRead
                  : styles.notificationItemUnread,
              ]}
            >
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Last update time */}
      <Text style={styles.updateTime}>
        Updated: {lastUpdate.toLocaleTimeString()}
      </Text>
    </View>
  );
};

export default AndroidNotificationWidget;
