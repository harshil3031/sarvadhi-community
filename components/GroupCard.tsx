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
import { Group, groupApi } from '../src/api/group.api';
import { useAuthStore } from '../src/store';

interface GroupCardProps {
  group: Group.Group;
  onLeave?: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
}

export default function GroupCard({ group, onLeave, onDelete }: GroupCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLeaving, setIsLeaving] = useState(false);

  const isCreator = user?.id === group.creatorId;

  const handlePress = () => {
    router.push(`/(tabs)/groups/${group.id}` as any);
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
            setIsLeaving(true);
            try {
              const response = await groupApi.leaveGroup(group.id);
              if (response.data.success) {
                onLeave?.(group.id);
              }
            } catch (err: any) {
              const errorMsg =
                err.response?.data?.message || err.message || 'Failed to leave group';
              Alert.alert('Error', errorMsg);
            } finally {
              setIsLeaving(false);
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
            setIsLeaving(true);
            try {
              const response = await groupApi.deleteGroup(group.id);
              if (response.data.success) {
                onDelete?.(group.id);
              }
            } catch (err: any) {
              const errorMsg =
                err.response?.data?.message || err.message || 'Failed to delete group';
              Alert.alert('Error', errorMsg);
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="people" size={28} color="#3b82f6" />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {group.name}
          </Text>
          {isCreator && (
            <View style={styles.creatorBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.creatorText}>Creator</Text>
            </View>
          )}
        </View>

        {group.description && (
          <Text style={styles.description} numberOfLines={2}>
            {group.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.stats}>
            <Ionicons name="person" size={14} color="#999" />
            <Text style={styles.memberCount}>
              {group.memberCount || 0} {group.memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>

          <View style={styles.actions}>
            {isCreator ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.leaveButton]}
                onPress={handleLeave}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <>
                    <Ionicons name="exit-outline" size={16} color="#666" />
                    <Text style={styles.leaveButtonText}>Leave</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 16,
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
    paddingVertical: 6,
    borderRadius: 6,
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
