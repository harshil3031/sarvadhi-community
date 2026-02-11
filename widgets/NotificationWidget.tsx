import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  AppState,
  AppStateStatus,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { theme } from '../src/theme/index';
import widgetService, { WidgetNotification } from './widgetService';

interface NotificationData extends WidgetNotification {
  userName?: string;
}

export const NotificationWidget: React.FC = () => {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Get userId from storage
  useEffect(() => {
    const initUserId = async () => {
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
    };
    initUserId();
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const [notifications, count] = await Promise.all([
        widgetService.fetchWidgetNotifications(userId, 10),
        widgetService.getUnreadCount(userId),
      ]);

      setNotifications(notifications as NotificationData[]);
      setUnreadCount(count);
      setLastUpdate(new Date());
      console.log(`[NotificationWidget] Updated ${notifications.length} notifications`);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      console.log('[NotificationWidget] Auto-refreshing...');
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, loadNotifications]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [userId, loadNotifications]);

  const handleAppStateChange = (status: AppStateStatus) => {
    if (status === 'active' && userId) {
      console.log('[NotificationWidget] App in foreground, refreshing...');
      loadNotifications();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.dark.background : theme.colors.light.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.dark.border : theme.colors.light.border,
    },
    headerTitle: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: isDark ? theme.colors.dark.text : theme.colors.light.text,
    },
    badge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.colors.light.primary,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    notificationItem: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.dark.border : theme.colors.light.border,
      backgroundColor: isDark ? theme.colors.dark.surface : theme.colors.light.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderRadius: theme.radius.lg,
    },
    notificationUnread: {
      backgroundColor: isDark
        ? theme.colors.dark.primary + '20'
        : theme.colors.light.primary + '20',
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.light.primary,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    notificationTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: isDark ? theme.colors.dark.text : theme.colors.light.text,
      flex: 1,
    },
    notificationTime: {
      fontSize: theme.typography.caption.fontSize,
      color: isDark ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary,
    },
    notificationMessage: {
      fontSize: theme.typography.body.fontSize,
      color: isDark ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    typeTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.sm,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
      fontSize: theme.typography.body.fontSize,
      color: isDark ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      padding: theme.spacing.md,
      backgroundColor: isDark ? theme.colors.dark.primary + '20' : theme.colors.light.primary + '20',
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.light.primary,
    },
    errorText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.light.primary,
    },
    updateTime: {
      fontSize: 11,
      color: isDark ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
  });

  const getTypeColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'message':
        return { bg: theme.colors.light.secondary + '20', text: theme.colors.light.secondary };
      case 'mention':
        return { bg: theme.colors.light.primary + '20', text: theme.colors.light.primary };
      case 'announcement':
        return { bg: '#F59E0B20', text: '#F59E0B' };
      case 'achievement':
        return { bg: '#10B98120', text: '#10B981' };
      default:
        return { bg: theme.colors.light.primary + '20', text: theme.colors.light.primary };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

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
          size="large"
          color={isDark ? theme.colors.dark.primary : theme.colors.light.primary}
        />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Please log in to the app</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ position: 'relative' }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const typeColor = getTypeColor(item.type);
            return (
              <Pressable
                style={[styles.notificationItem, item.read ? {} : styles.notificationUnread]}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <View
                  style={[
                    styles.typeTag,
                    { backgroundColor: typeColor.bg },
                  ]}
                >
                  <Text style={[styles.typeText, { color: typeColor.text }]}>
                    {item.type}
                  </Text>
                </View>
              </Pressable>
            );
          }}
          contentContainerStyle={{ padding: theme.spacing.md }}
        />
      )}

      {/* Last update time */}
      <Text style={styles.updateTime}>
        Updated: {lastUpdate.toLocaleTimeString()}
      </Text>
    </View>
  );
};

export default NotificationWidget;
