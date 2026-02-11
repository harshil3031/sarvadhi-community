/**
 * EmptyState - Component for empty list states
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

interface EmptyStateProps extends ViewProps {
  icon?: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xl * 2,
    },
    icon: {
      fontSize: 64,
      marginBottom: Spacing.lg,
    },
    title: {
      ...Typography.title,
      color: colors.text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    description: {
      ...Typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};
