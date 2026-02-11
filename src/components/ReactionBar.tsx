/**
 * ReactionBar - Interactive reactions component
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { BorderRadius } from '../theme/radius';

export type ReactionType = '👍' | '❤️' | '😂' | '😮' | '😢' | '🔥';

interface ReactionCount {
  type: ReactionType;
  count: number;
  userReacted?: boolean;
}

interface ReactionBarProps {
  reactions: ReactionCount[];
  onReactionPress: (reaction: ReactionType) => void;
}

const REACTIONS: ReactionType[] = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  onReactionPress,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
      marginTop: Spacing.sm,
    },
    reactionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    reactionButtonActive: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    emoji: {
      fontSize: 16,
      marginRight: Spacing.xs,
    },
    count: {
      ...Typography.caption,
      color: colors.textSecondary,
    },
    countActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    moreButton: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
  });

  const hasReaction = (type: ReactionType) =>
    reactions.some((r) => r.type === type);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={reactions.length > 4}
    >
      <View style={styles.container}>
        {reactions.map((reaction) => (
          <TouchableOpacity
            key={reaction.type}
            style={[
              styles.reactionButton,
              reaction.userReacted && styles.reactionButtonActive,
            ]}
            onPress={() => onReactionPress(reaction.type)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{reaction.type}</Text>
            <Text
              style={[
                styles.count,
                reaction.userReacted && styles.countActive,
              ]}
            >
              {reaction.count}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            // Open reaction picker
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 16 }}>+</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
