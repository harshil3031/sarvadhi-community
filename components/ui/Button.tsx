import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Sizes } from '../../src/constants/design';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
      };
    case 'secondary':
      return {
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        borderWidth: 1,
      };
    case 'danger':
      return {
        backgroundColor: Colors.danger,
        borderColor: Colors.danger,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: Colors.border,
        borderWidth: 1,
      };
    default:
      return {};
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 36,
      };
    case 'lg':
      return {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        minHeight: Sizes.buttonHeight,
      };
    case 'md':
    default:
      return {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 44,
      };
  }
};

const getTextColorForVariant = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return Colors.background;
    case 'secondary':
    case 'ghost':
      return Colors.text;
    default:
      return Colors.text;
  }
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const textColor = getTextColorForVariant(variant);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        variantStyles,
        sizeStyles,
        fullWidth && { flex: 1 },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
          }}
        >
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon as any} size={20} color={textColor} />
          )}
          <Text style={[styles.text, { color: textColor }]}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon as any} size={20} color={textColor} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
