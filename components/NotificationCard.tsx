import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../src/api/notification.api';
import { Colors } from '../constants/theme';

const NotificationCardColors = {
  light: {
    background: '#f5f5f5',
    unreadBackground: '#e3f2fd',
    text: '#000',
    mutedText: '#666',
    border: '#ddd',
  },
  dark: {
    background: '#1a1a1a',
    unreadBackground: '#1e3a5f',
    text: '#fff',
    mutedText: '#aaa',
    border: '#333',
  },
};

interface NotificationCardProps {
  notification: Notification.Notification;
  onMarkAsRead: (id: string) => Promise<void>;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = NotificationCardColors[colorScheme ?? 'light'] as typeof NotificationCardColors['light'];

  const [isLoading, setIsLoading] = React.useState(false);

  const getIconName = (type: string) => {
    switch (type) {
      case 'mention':
        return 'at';
      case 'reaction':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'message':
        return 'mail';
      case 'channel_invite':
        return 'chatbubbles';
      case 'group_invite':
        return 'people';
      default:
        return 'notifications';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mention':
        return 'Mention';
      case 'reaction':
        return 'Reaction';
      case 'comment':
        return 'Comment';
      case 'message':
        return 'Message';
      case 'channel_invite':
        return 'Channel Invite';
      case 'group_invite':
        return 'Group Invite';
      default:
        return 'Notification';
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return notificationDate.toLocaleDateString();
  };

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;

    setIsLoading(true);
    try {
      await onMarkAsRead(notification.id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      Alert.alert('Error', 'Failed to update notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleMarkAsRead}
      activeOpacity={0.7}
      disabled={isLoading}
      style={[
        styles.card,
        {
          backgroundColor: notification.isRead
            ? colors.background
            : colors.unreadBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIconName(notification.type)}
            size={24}
            color="#2563EB"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.typeLabel,
                {
                  color: '#2563EB',
                  fontWeight: notification.isRead ? '500' : '700',
                },
              ]}
            >
              {getTypeLabel(notification.type)}
            </Text>
            {!notification.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontWeight: notification.isRead ? '500' : '600',
              },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>

          <Text
            style={[styles.message, { color: colors.mutedText }]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          <Text style={[styles.time, { color: colors.mutedText }]}>
            {formatTime(notification.createdAt)}
          </Text>
        </View>

        {isLoading && (
          <ActivityIndicator size="small" color="#2563EB" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 'auto',
  },
  title: {
    fontSize: 14,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
});
