/**
 * BaseInput - Reusable input component
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';

interface BaseInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  inputTextStyle?: StyleProp<TextStyle>;
}

export const BaseInput: React.FC<BaseInputProps> = ({
  label,
  error,
  helperText,
  multiline = false,
  maxLength,
  value,
  onChangeText,
  style,
  containerStyle,
  inputWrapperStyle,
  inputTextStyle,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: Spacing.sm,
    },
    label: {
      ...Typography.bodyBold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 0,
      backgroundColor: colors.surface,
      minHeight: 48,
    },
    input: {
      flex: 1,
      ...Typography.body,
      color: colors.text,
      minHeight: multiline ? 100 : 48,
      paddingVertical: 10,
      fontWeight: '400',
    },
    error: {
      ...Typography.caption,
      color: colors.error,
      marginTop: Spacing.xs,
    },
    helperText: {
      ...Typography.caption,
      color: colors.textTertiary,
      marginTop: Spacing.xs,
    },
    characterCount: {
      ...Typography.caption,
      color: colors.textTertiary,
      marginLeft: Spacing.xs,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, inputWrapperStyle]}>
        <TextInput
          style={[styles.input, style, inputTextStyle]}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
          {...props}
        />
        {maxLength && value && (
          <Text style={styles.characterCount}>
            {String(value).length}/{maxLength}
          </Text>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};
