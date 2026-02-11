/**
 * BaseButton - Reusable button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const sizeConfig = {
    sm: { height: 40, paddingHorizontal: Spacing.md },
    md: { height: 48, paddingHorizontal: Spacing.lg },
    lg: { height: 56, paddingHorizontal: Spacing.xl },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.disabled : colors.primary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'tertiary':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: disabled ? colors.disabled : colors.error,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger') {
      return '#ffffff';
    }
    if (variant === 'secondary') {
      return colors.text;
    }
    return colors.primary;
  };

  const styles = StyleSheet.create({
    button: {
      ...sizeConfig[size],
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
      ...getVariantStyles(),
    },
    text: {
      ...Typography.bodyBold,
      color: getTextColor(),
      marginRight: isLoading ? Spacing.xs : 0,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading && <ActivityIndicator color={getTextColor()} size="small" />}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};
