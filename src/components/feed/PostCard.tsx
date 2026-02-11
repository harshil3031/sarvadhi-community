/**
 * PostCard - Display individual post with reactions, tags, and content
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';
import { Avatar } from '../common/Avatar';
import { BaseCard } from '../base/BaseCard';
import { TagBadge } from '../base/ReactionBar';
import { ReactionBar, ReactionType } from './ReactionBar';

type PostTag = 'Achievement' | 'Announcement';

interface PostCardProps extends Omit<ViewProps, 'role'> {
  id: string;
  avatar?: { uri: string };
  name: string;
  role: string;
  time: string;
  content: string;
  image?: { uri: string };
  tag?: PostTag;
  reactions?: Array<{
    type: ReactionType;
    count: number;
    userReacted?: boolean;
  }>;
  onReactionPress?: (reaction: ReactionType) => void;
  onPress?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  avatar,
  name,
  role,
  time,
  content,
  image,
  tag,
  reactions = [],
  onReactionPress,
  onPress,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      marginBottom: Spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    userInfo: {
      flex: 1,
      flexDirection: 'row',
      gap: Spacing.md,
    },
    userDetails: {
      flex: 1,
    },
    name: {
      ...Typography.bodyBold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    role: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    time: {
      ...Typography.caption,
      color: colors.textTertiary,
    },
    tagContainer: {
      marginLeft: Spacing.md,
    },
    content: {
      ...Typography.body,
      color: colors.text,
      lineHeight: 20,
      marginBottom: image ? Spacing.md : 0,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: Spacing.md,
    },
    reactionsContainer: {
      marginTop: Spacing.sm,
    },
  });

  return (
    <BaseCard style={[styles.card, style]} {...props}>
      {/* Header - User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar size="md" initials={name.charAt(0)} source={avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.role}>{role}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
        {tag && (
          <View style={styles.tagContainer}>
            <TagBadge
              label={tag}
              variant={tag === 'Achievement' ? 'success' : 'info'}
              size="sm"
            />
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={undefined}>
        {content}
      </Text>

      {/* Image (optional) */}
      {image && <Image source={image} style={styles.image} resizeMode="cover" />}

      {/* Reactions */}
      {reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          <View style={styles.divider} />
          <ReactionBar
            reactions={reactions}
            onReactionPress={onReactionPress || (() => {})}
          />
        </View>
      )}
    </BaseCard>
  );
};
