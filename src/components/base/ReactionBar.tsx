/**
 * TagBadge - Badge/Tag component
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

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface TagBadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  variant = 'info',
  size = 'sm',
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'success':
        return { bg: '#dcfce7', text: colors.success };
      case 'warning':
        return { bg: '#fef3c7', text: colors.warning };
      case 'error':
        return { bg: '#fee2e2', text: colors.error };
      case 'info':
      default:
        return { bg: '#dbeafe', text: colors.info };
    }
  };

  const sizeConfig = {
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, ...Typography.caption },
    md: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, ...Typography.caption },
  };

  const { bg, text } = getVariantColors();

  const styles = StyleSheet.create({
    badge: {
      ...sizeConfig[size],
      borderRadius: BorderRadius.sm,
      backgroundColor: bg,
      alignSelf: 'flex-start',
    },
    label: {
      color: text,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.badge, style]} {...props}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};
