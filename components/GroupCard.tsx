import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Group, groupApi } from '../src/api/group.api';
import { useAuthStore } from '../src/store';
import { useTheme } from '../src/theme/ThemeContext';
import { BaseCard } from '../src/components/base/BaseCard';

interface GroupCardProps {
  group: Group.Group;
  onLeave?: (groupId: string) => Promise<void>;
  onDelete?: (groupId: string) => Promise<void>;
  onJoin?: (groupId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function GroupCard({ group, onLeave, onDelete, onJoin, isLoading = false }: GroupCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const isCreator = user?.id === group.createdBy;
  const isMember = group.isMember !== false; // Default to true if undefined (backward compat for MyGroups) check handling in parent

  // Actually, better logic: 
  // If isMember is explicitly false, show Join.
  const showJoin = group.isMember === false;

  const handlePress = () => {
    // If not a member, maybe don't allow viewing detail? Or allow viewing preview?
    // For now allow viewing.
    router.push(`/(tabs)/groups/${group.id}` as any);
  };

  const handleJoin = async () => {
    setIsProcessing(true);
    try {
      const response = await groupApi.joinGroup(group.id);
      if (response.data.success) {
        onJoin?.(group.id);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to join group';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
        visibilityTime: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will need to be invited again to rejoin.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const response = await groupApi.leaveGroup(group.id);
              if (response.data.success) {
                onLeave?.(group.id);
              }
            } catch (err: any) {
              const errorMsg =
                err.response?.data?.message || err.message || 'Failed to leave group';
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMsg,
                visibilityTime: 3000,
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const response = await groupApi.deleteGroup(group.id);
              if (response.data.success) {
                onDelete?.(group.id);
              }
            } catch (err: any) {
              const errorMsg =
                err.response?.data?.message || err.message || 'Failed to delete group';
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMsg,
                visibilityTime: 3000,
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <BaseCard style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }] }>
        <Ionicons name="people" size={28} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          {isCreator && (
            <View style={[styles.creatorBadge, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={[styles.creatorText, { color: colors.warning }]}>Creator</Text>
            </View>
          )}
        </View>

        {group.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {group.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.stats}>
            <Ionicons name="person" size={14} color={colors.textTertiary} />
            <Text style={[styles.memberCount, { color: colors.textTertiary }]}>
              {group.memberCount || 0} {group.memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>

          <View style={styles.actions}>
            {showJoin ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton, { backgroundColor: colors.primary }]}
                onPress={handleJoin}
                disabled={isLoading || isProcessing}
              >
                {isLoading || isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="enter-outline" size={16} color="#fff" />
                    <Text style={styles.joinButtonText}>Join</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : isCreator ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: `${colors.error}20` }]}
                onPress={handleDelete}
                disabled={isLoading || isProcessing}
              >
                {isLoading || isProcessing ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.leaveButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={handleLeave}
                disabled={isLoading || isProcessing}
              >
                {isLoading || isProcessing ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <>
                    <Ionicons name="exit-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.leaveButtonText, { color: colors.textSecondary }]}>Leave</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      </BaseCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 13,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  joinButton: {
    backgroundColor: '#3b82f6',
  },
  joinButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  leaveButton: {
    backgroundColor: '#f5f5f5',
  },
  leaveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
});
