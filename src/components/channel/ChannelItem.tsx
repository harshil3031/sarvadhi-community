/**
 * ChannelItem - Channel list item component
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';

interface ChannelItemProps {
  id: string;
  name: string;
  description?: string;
  unreadCount?: number;
  lastActivity?: string;
  isPrivate?: boolean;
  onPress?: () => void;
}

export const ChannelItem: React.FC<ChannelItemProps> = ({
  id,
  name,
  description,
  unreadCount = 0,
  lastActivity,
  isPrivate = false,
  onPress,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    iconText: {
      fontSize: 18,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    name: {
      ...Typography.bodyBold,
      color: colors.text,
      flex: 1,
    },
    description: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    lastActivity: {
      ...Typography.caption,
      color: colors.textTertiary,
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xs,
    },
    badgeText: {
      ...Typography.caption,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 11,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>{isPrivate ? '🔒' : '#'}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {lastActivity && (
            <Text style={styles.lastActivity}>{lastActivity}</Text>
          )}
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
