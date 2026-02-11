/**
 * ChatInput - Input field for sending messages
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  Text as RNText,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';
import { BaseInput } from '../base/BaseInput';

interface ChatInputProps extends ViewProps {
  onSend?: (message: string) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: Spacing.sm,
    },
    inputContainer: {
      flex: 1,
      marginBottom: 0,
    },
    inputWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.md,
      backgroundColor: colors.background,
    },
    inputText: {
      flex: 1,
      ...Typography.body,
      color: colors.text,
      paddingVertical: Spacing.sm,
      minHeight: 40,
      maxHeight: 100,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    sendIcon: {
      fontSize: 20,
    },
  });

  return (
    <View style={[styles.container, style]} {...props}>
      <BaseInput
        containerStyle={styles.inputContainer}
        inputWrapperStyle={styles.inputWrapper}
        inputTextStyle={styles.inputText}
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        multiline
        returnKeyType="default"
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          !message.trim() && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!message.trim()}
        activeOpacity={0.7}
      >
        <RNText style={styles.sendIcon}>📤</RNText>
      </TouchableOpacity>
    </View>
  );
};
