/**
 * ChannelHeader - Header for channel details screen
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

interface ChannelHeaderProps {
  name: string;
  memberCount: number;
  description?: string;
  onSettingsPress?: () => void;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  name,
  memberCount,
  description,
  onSettingsPress,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
    },
    title: {
      ...Typography.title,
      color: colors.text,
      flex: 1,
    },
    settingsButton: {
      padding: Spacing.xs,
    },
    settingsIcon: {
      fontSize: 20,
    },
    subtitle: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    description: {
      ...Typography.body,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onSettingsPress && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.subtitle}>{memberCount} members</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};
