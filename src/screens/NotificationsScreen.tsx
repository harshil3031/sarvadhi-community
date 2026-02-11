/**
 * NotificationsScreen - List of notifications
 */

import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { BorderRadius } from '../theme/radius';
import { ScreenContainer } from '../components/base/ScreenContainer';
import { BaseCard } from '../components/base/BaseCard';

interface Notification {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: '❤️', title: 'Sarah liked your post', description: 'About the new product launch', timestamp: '5m ago', unread: true },
  { id: '2', icon: '💬', title: 'New message from Alex', description: 'Let\'s sync up tomorrow', timestamp: '1h ago', unread: true },
  { id: '3', icon: '🏆', title: 'Achievement unlocked!', description: 'You reached 100 posts', timestamp: '3h ago', unread: false },
  { id: '4', icon: '📢', title: 'New announcement', description: 'Company all-hands meeting next week', timestamp: '1d ago', unread: false },
];

export const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const renderNotification: ListRenderItem<Notification> = ({ item }) => {
    const styles = StyleSheet.create({
      notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: item.unread ? colors.primaryLight : colors.surface,
      },
      icon: {
        fontSize: 32,
        marginRight: Spacing.md,
      },
      content: {
        flex: 1,
      },
      title: {
        ...Typography.bodyBold,
        color: colors.text,
        marginBottom: Spacing.xs,
      },
      description: {
        ...Typography.body,
        color: colors.textSecondary,
        marginBottom: Spacing.xs,
      },
      timestamp: {
        ...Typography.caption,
        color: colors.textTertiary,
      },
      unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: BorderRadius.full,
        backgroundColor: colors.primary,
      },
    });

    return (
      <TouchableOpacity activeOpacity={0.7}>
        <BaseCard style={styles.notificationItem}>
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          {item.unread && <View style={styles.unreadBadge} />}
        </BaseCard>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};
