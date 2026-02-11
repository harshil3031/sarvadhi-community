/**
 * BaseCard - Reusable card component for corporate SaaS app
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { BorderRadius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';

interface BaseCardProps extends ViewProps {
  elevated?: boolean;
  noPadding?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  elevated = true,
  noPadding = false,
  style,
  ...props
}) => {
  const { colors, mode } = useTheme();

  const styles = StyleSheet.create({
    card: {
      alignSelf: 'stretch',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: noPadding ? 0 : Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...(elevated && mode === 'light' && Shadows.md),
    },
  });

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};
