import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupApi, Group } from '../../../../src/api/group.api';
import { useAuthStore } from '../../../../src/store/auth.store';

export default function GroupInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [group, setGroup] = useState<Group.Group | null>(null);
  const [members, setMembers] = useState<Group.GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInfo = useCallback(async (isRefresh = false) => {
    if (!id) return;
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [groupRes, membersRes] = await Promise.all([
        groupApi.getGroup(id),
        groupApi.getGroupMembers(id),
      ]);
      if (groupRes.data.success) setGroup(groupRes.data.data || null);
      if (membersRes.data.success) setMembers(membersRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch group info:', err);
      Alert.alert('Error', 'Failed to load group info');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const canManage = user?.role === 'admin' || user?.id === group?.createdBy;

  const handleRemoveMember = async (memberUserId: string) => {
    if (!id) return;
    Alert.alert('Remove Member', 'Are you sure you want to remove this member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupApi.removeMember(id, memberUserId);
            setMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to remove member');
          }
        },
      },
    ]);
  };

  const renderMember = ({ item }: { item: Group.GroupMember }) => {
    const name = item.user?.fullName || 'Unknown';
    const email = item.user?.email || '';
    const avatar = item.user?.profilePhotoUrl;
    const isCreator = item.user?.id === group?.createdBy;

    return (
      <View style={styles.memberRow}>
        <View style={styles.memberAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.memberAvatarImage} />
          ) : (
            <Text style={styles.memberAvatarText}>{name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{name}</Text>
          <Text style={styles.memberEmail}>{email}</Text>
        </View>
        {isCreator ? (
          <View style={styles.creatorBadge}>
            <Text style={styles.creatorBadgeText}>Creator</Text>
          </View>
        ) : canManage ? (
          <TouchableOpacity onPress={() => handleRemoveMember(item.userId)} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Group Info', headerBackTitle: 'Back' }} />

      <View style={styles.card}>
        <Text style={styles.title}>{group?.name || 'Group'}</Text>
        {group?.description ? (
          <Text style={styles.description}>{group.description}</Text>
        ) : (
          <Text style={styles.descriptionMuted}>No description</Text>
        )}
        <View style={styles.statRow}>
          <Ionicons name="people" size={16} color="#6B7280" />
          <Text style={styles.statText}>{group?.memberCount || members.length} members</Text>
        </View>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={renderMember}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchInfo(true)} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No members yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  description: { marginTop: 8, color: '#4B5563', lineHeight: 20 },
  descriptionMuted: { marginTop: 8, color: '#9CA3AF' },
  statRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#6B7280', fontSize: 13 },
  listContent: { paddingBottom: 24 },
  memberRow: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  memberAvatarImage: { width: '100%', height: '100%' },
  memberAvatarText: { fontWeight: '700', color: '#2563EB' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  memberEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  removeButton: { padding: 6 },
  creatorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
  },
  creatorBadgeText: { fontSize: 11, fontWeight: '600', color: '#92400E' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#6B7280' },
});
