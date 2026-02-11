/**
 * ProfileScreen - User profile with stats and activity
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { BorderRadius } from '../theme/radius';
import { ScreenContainer } from '../components/base/ScreenContainer';
import { Avatar } from '../components/common/Avatar';
import { BaseCard } from '../components/base/BaseCard';
import { BaseButton } from '../components/base/BaseButton';
import { Divider } from '../components/base/Divider';

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    scrollContent: {
      paddingBottom: Spacing.xl,
    },
    header: {
      alignItems: 'center',
      paddingVertical: Spacing.lg,
    },
    name: {
      ...Typography.title,
      color: colors.text,
      marginTop: Spacing.md,
    },
    role: {
      ...Typography.body,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    statsCard: {
      marginVertical: Spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...Typography.title,
      color: colors.text,
      fontWeight: '700',
    },
    statLabel: {
      ...Typography.caption,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    buttonContainer: {
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      ...Typography.subtitle,
      color: colors.text,
      marginVertical: Spacing.md,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
    },
    activityIcon: {
      fontSize: 24,
      marginRight: Spacing.md,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      ...Typography.bodyBold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    activityTime: {
      ...Typography.caption,
      color: colors.textTertiary,
    },
  });

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar size="xl" initials="JD" />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.role}>Senior Product Manager</Text>
        </View>

        <BaseCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>42</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Channels</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
          </View>
        </BaseCard>

        <View style={styles.buttonContainer}>
          <BaseButton label="Edit Profile" variant="primary" fullWidth />
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <BaseCard noPadding>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📝</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Posted in #engineering</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <Divider spacing="none" />
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>❤️</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Liked Sarah's post</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <Divider spacing="none" />
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>💬</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Commented on announcement</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </BaseCard>
      </ScrollView>
    </ScreenContainer>
  );
};
