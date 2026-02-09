import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, Stack } from 'expo-router';
import { Notification, notificationApi } from '../../../src/api/notification.api';
import { Colors } from '../../../constants/theme';
import NotificationCard from '../../../components/NotificationCard';
import { useNotificationSocket } from '../../../src/hooks/useNotificationSocket';

const NotificationScreenColors = {
  light: {
    background: '#f9fafb',
    text: '#000',
    mutedText: '#666',
    border: '#ddd',
  },
  dark: {
    background: '#0a0a0a',
    text: '#fff',
    mutedText: '#aaa',
    border: '#333',
  },
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = NotificationScreenColors[colorScheme ?? 'light'] as typeof NotificationScreenColors['light'];

  const [notifications, setNotifications] = useState<Notification.Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { addNotificationListener } = useNotificationSocket();

  const fetchNotifications = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await notificationApi.getNotifications(50, 0);
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);

        // Calculate unread count
        const unread = response.data.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } else {
        // If no data or not an array, set empty array
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    // Real-time updates for notifications list
    addNotificationListener((notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    });
  }, [addNotificationListener]);

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationApi.markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert optimistic update
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: false }
            : notification
        )
      );
      setUnreadCount((prev) => prev + 1);
      throw err;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    const previousNotifications = notifications;
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Revert optimistic update
      setNotifications(previousNotifications);
      const unread = previousNotifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      Alert.alert('Error', 'Failed to update notifications');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    // Optimistic update
    const previousNotifications = notifications;
    const deletedNotification = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (deletedNotification && !deletedNotification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationApi.deleteNotification(notificationId);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      // Revert optimistic update
      setNotifications(previousNotifications);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications? This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => { } },
        {
          text: 'Delete',
          onPress: async () => {
            // Optimistic update
            const previousNotifications = notifications;
            setNotifications([]);
            setUnreadCount(0);

            try {
              await notificationApi.deleteAllNotifications();
            } catch (err) {
              console.error('Failed to delete all notifications:', err);
              // Revert optimistic update
              setNotifications(previousNotifications);
              const unread = previousNotifications.filter((n) => !n.isRead).length;
              setUnreadCount(unread);
              Alert.alert('Error', 'Failed to delete notifications');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  const renderEmptyState = () => (
    <View
      style={[
        styles.emptyState,
        { backgroundColor: colors.background },
      ]}
    >
      <Ionicons name="notifications-outline" size={64} color={colors.mutedText} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyStateMessage, { color: colors.mutedText }]}>
        You're all caught up! Check back later.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <Stack.Screen
      options={{
        headerTitle: 'Notifications',
        headerRight: () => unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={{ marginRight: 8, padding: 8 }}
          >
            <Text style={{ color: '#2563EB', fontWeight: '600', fontSize: 13 }}>Mark all as read</Text>
          </TouchableOpacity>
        ) : null
      }}
    />
  );

  const renderFooter = () => {
    if (notifications.length === 0 || !isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? null : renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={
          notifications.length === 0 ? { flex: 1 } : undefined
        }
      />

      {notifications.length > 0 && (
        <TouchableOpacity
          onPress={handleDeleteAllNotifications}
          style={[styles.deleteAllButton, { borderTopColor: colors.border }]}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.deleteAllText}>Delete All</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-start',
  },
  markAllText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: Dimensions.get('window').height - 200,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  deleteAllText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
});
