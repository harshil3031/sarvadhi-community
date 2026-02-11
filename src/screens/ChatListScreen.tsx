/**
 * ChatListScreen - List of direct messages
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
import { Avatar } from '../components/common/Avatar';
import { BaseCard } from '../components/base/BaseCard';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatar?: { uri: string };
  online?: boolean;
}

const MOCK_CHATS: Chat[] = [
  { id: '1', name: 'Sarah Johnson', lastMessage: 'Thanks for the update!', timestamp: '2m ago', unreadCount: 2, online: true },
  { id: '2', name: 'Alex Chen', lastMessage: 'Let\'s discuss tomorrow', timestamp: '1h ago', online: true },
  { id: '3', name: 'Priya Sharma', lastMessage: 'Great work on the design!', timestamp: '3h ago' },
];

export const ChatListScreen: React.FC = () => {
  const { colors } = useTheme();
  const [chats] = useState<Chat[]>(MOCK_CHATS);

  const renderChat: ListRenderItem<Chat> = ({ item }) => {
    const styles = StyleSheet.create({
      chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingVertical: Spacing.sm,
      },
      content: {
        flex: 1,
        marginLeft: Spacing.md,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
      },
      name: {
        ...Typography.bodyBold,
        color: colors.text,
      },
      timestamp: {
        ...Typography.caption,
        color: colors.textTertiary,
      },
      lastMessage: {
        ...Typography.body,
        color: colors.textSecondary,
      },
      badge: {
        minWidth: 20,
        height: 20,
        borderRadius: BorderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
      },
      badgeText: {
        ...Typography.caption,
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 11,
      },
    });

    return (
      <TouchableOpacity activeOpacity={0.7}>
        <BaseCard style={styles.chatItem}>
          <Avatar
            size="lg"
            initials={item.name.charAt(0)}
            source={item.avatar}
            online={item.online}
          />
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </BaseCard>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};
