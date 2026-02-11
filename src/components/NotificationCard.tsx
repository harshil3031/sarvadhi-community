/**
 * NotificationCard - Notification display component
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { BorderRadius } from '../theme/radius';
import { Shadows } from '../theme/shadows';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationCardProps extends ViewProps {
  type?: NotificationType;
  title: string;
  description?: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type = 'info',
  title,
  description,
  onDismiss,
  action,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#dcfce7', border: colors.success, icon: '✓' };
      case 'warning':
        return { bg: '#fef3c7', border: colors.warning, icon: '⚠' };
      case 'error':
        return { bg: '#fee2e2', border: colors.error, icon: '✕' };
      case 'info':
      default:
        return { bg: '#dbeafe', border: colors.info, icon: 'ℹ' };
    }
  };

  const typeColors = getTypeColors();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: typeColors.bg,
      borderLeftWidth: 4,
      borderLeftColor: typeColors.border,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginVertical: Spacing.sm,
      ...Shadows.sm,
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      ...Typography.bodyBold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    description: {
      ...Typography.body,
      color: colors.textSecondary,
    },
    actionButton: {
      marginLeft: Spacing.md,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
    },
    actionText: {
      ...Typography.bodyBold,
      color: typeColors.border,
    },
  });

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={{ marginLeft: Spacing.sm }}>
          <Text style={{ fontSize: 18, color: colors.textSecondary }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
