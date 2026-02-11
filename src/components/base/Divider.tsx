/**
 * Divider - Separator component
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';

interface DividerProps extends ViewProps {
  vertical?: boolean;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  spacing = 'md',
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const spacingConfig = {
    none: 0,
    xs: Spacing.xs,
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
  };

  const styles = StyleSheet.create({
    divider: vertical
      ? {
          width: 1,
          height: '100%',
          backgroundColor: colors.divider,
          marginHorizontal: spacingConfig[spacing],
        }
      : {
          height: 1,
          width: '100%',
          backgroundColor: colors.divider,
          marginVertical: spacingConfig[spacing],
        },
  });

  return <View style={[styles.divider, style]} {...props} />;
};
