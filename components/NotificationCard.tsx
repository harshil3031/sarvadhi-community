import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Notification } from '../src/api/notification.api';
import { channelApi } from '../src/api/channels';
import { groupApi } from '../src/api/group.api';
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
  onDelete: (id: string) => Promise<void>;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = NotificationCardColors[colorScheme ?? 'light'] as typeof NotificationCardColors['light'];
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [inviteHandled, setInviteHandled] = useState(false);

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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update notification',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!notification.relatedId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid invitation',
        visibilityTime: 3000,
      });
      return;
    }

    setIsAccepting(true);
    try {
      if (notification.type === 'channel_invite') {
        // Use acceptInvite for channel invitations
        await channelApi.acceptInvite(notification.relatedId);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Joined channel successfully!',
          visibilityTime: 2000,
        });
        router.push(`/(tabs)/channels/${notification.relatedId}`);
      } else if (notification.type === 'group_invite') {
        await groupApi.joinGroup(notification.relatedId);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Joined group successfully!',
          visibilityTime: 2000,
        });
        router.push(`/(tabs)/groups/${notification.relatedId}`);
      }
      setInviteHandled(true);
      await onMarkAsRead(notification.id);
      await onDelete(notification.id);
    } catch (err: any) {
      console.error('Failed to accept invite:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to accept invitation',
        visibilityTime: 3000,
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!notification.relatedId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid invitation',
        visibilityTime: 3000,
      });
      return;
    }

    setIsDeclining(true);
    try {
      // Reject the invitation in the database
      if (notification.type === 'channel_invite') {
        await channelApi.rejectInvite(notification.relatedId);
      } else if (notification.type === 'group_invite') {
        // For groups, just mark as read for now (groups don't have invite system yet)
        // TODO: Add group invite rejection when group invite system is implemented
      }

      // Mark notification as read
      await onMarkAsRead(notification.id);
      setInviteHandled(true);
      await onDelete(notification.id);
      Toast.show({
        type: 'success',
        text1: 'Declined',
        text2: 'Invitation declined',
        visibilityTime: 2000,
      });
    } catch (err: any) {
      console.error('Failed to decline invite:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to decline invitation',
        visibilityTime: 3000,
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const isInvitation = notification.type === 'channel_invite' || notification.type === 'group_invite';

  const handlePress = async () => {
    // Mark as read first
    await handleMarkAsRead();

    // Navigate based on type
    if (notification.type === 'dm_message' && notification.referenceId) {
      router.push(`/(tabs)/messages/${notification.referenceId}`);
    } else if (notification.type === 'post_comment' || notification.type === 'post_reaction' || notification.type === 'post_mention') {
      if (notification.referenceId) {
        router.push(`/(tabs)/feed/post/${notification.referenceId}`);
      }
    } else if (isInvitation) {
      // Invitation cards handle their own navigation via accept/decline
      return;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
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
            {(notification as any).groupCount > 1 && (
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>
                  {(notification as any).groupCount}
                </Text>
              </View>
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

          {/* Invitation Action Buttons */}
          {isInvitation && !inviteHandled && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.acceptButton, isAccepting && styles.buttonDisabled]}
                onPress={handleAcceptInvite}
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.declineButton, isDeclining && styles.buttonDisabled]}
                onPress={handleDeclineInvite}
                disabled={isAccepting || isDeclining}
              >
                {isDeclining ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={16} color="#666" />
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  groupBadge: {
    backgroundColor: '#ef4444',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  groupBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  declineButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
