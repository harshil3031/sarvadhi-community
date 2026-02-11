/**
 * CreatePostCard - Card for creating new posts
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewProps,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { BorderRadius } from '../theme/radius';
import { Avatar } from './base/Avatar';
import { BaseCard } from './base/BaseCard';

interface CreatePostCardProps extends ViewProps {
  userName: string;
  userAvatar?: { uri: string };
  onPress?: () => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  userName,
  userAvatar,
  onPress,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      marginBottom: Spacing.md,
    },
    container: {
      flexDirection: 'row',
      gap: Spacing.md,
      alignItems: 'center',
    },
    inputButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputText: {
      ...Typography.body,
      color: colors.placeholder,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surfaceSecondary,
    },
    actionText: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },
  });

  return (
    <BaseCard style={[styles.card, style]} {...props}>
      <View style={styles.container}>
        <Avatar size="md" initials={userName.charAt(0)} source={userAvatar} />
        <TouchableOpacity
          style={styles.inputButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.inputText}>What's on your mind?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>📸</Text>
          <Text style={styles.actionText}>Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>🏆</Text>
          <Text style={styles.actionText}>Achievement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>📢</Text>
          <Text style={styles.actionText}>Announce</Text>
        </TouchableOpacity>
      </View>
    </BaseCard>
  );
};
