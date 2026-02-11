/**
 * MessageBubble - Chat message component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';

interface MessageBubbleProps extends ViewProps {
  message: string;
  isOwnMessage?: boolean;
  timestamp?: string;
  senderName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage = false,
  timestamp,
  senderName,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginVertical: Spacing.xs,
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      paddingHorizontal: Spacing.md,
    },
    bubble: {
      maxWidth: '75%',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.lg,
      backgroundColor: isOwnMessage ? colors.primary : colors.surface,
      borderWidth: isOwnMessage ? 0 : 1,
      borderColor: isOwnMessage ? 'transparent' : colors.border,
    },
    senderName: {
      ...Typography.captionBold,
      color: isOwnMessage ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    text: {
      ...Typography.body,
      color: isOwnMessage ? '#FFFFFF' : colors.text,
    },
    timestamp: {
      ...Typography.caption,
      color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.textTertiary,
      marginTop: Spacing.xs,
      textAlign: isOwnMessage ? 'right' : 'left',
    },
  });

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.bubble}>
        {senderName && !isOwnMessage && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <Text style={styles.text}>{message}</Text>
        {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
      </View>
    </View>
  );
};
