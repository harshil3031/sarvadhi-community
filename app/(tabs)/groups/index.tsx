import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, Stack } from 'expo-router';
import { Group, groupApi } from '../../../src/api/group.api';
import GroupCard from '../../../components/GroupCard';
import CreateGroupModal from '../../../components/CreateGroupModal';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group.Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');

  const fetchGroups = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      if (activeTab === 'my') {
        const response = await groupApi.getMyGroups();
        if (response.data.success && response.data.data) {
          // Explicitly set isMember for My Groups
          const myGroups = response.data.data.map((g) => ({ ...g, isMember: true }));
          setGroups(myGroups);
        }
      } else {
        const response = await groupApi.getAllGroups();
        if (response.data.success && response.data.data) {
          // Filter to show only groups user is NOT a member of
          const exploreGroups = response.data.data.filter((g) => !g.isMember);
          setGroups(exploreGroups);
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [activeTab])
  );

  const handleRefresh = () => fetchGroups(true);

  const handleGroupCreated = (newGroup: Group.Group) => {
    if (activeTab === 'my') {
      setGroups(prev => [{ ...newGroup, isMember: true }, ...prev]);
    } else {
      // Switch to my groups to see it
      setActiveTab('my');
    }
  };

  const handleGroupLeave = (groupId: string) => {
    if (activeTab === 'my') {
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } else {
      // In explore, if we leave (not possible as we aren't member), but just in case
      fetchGroups();
    }
  };

  const handleGroupDelete = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleGroupJoin = (groupId: string) => {
    if (activeTab === 'explore') {
      // Remove from explore list
      setGroups(prev => prev.filter(g => g.id !== groupId));
      // Optionally switch to 'my' tab or show success toast
      Alert.alert('Success', 'Joined group!', [
        { text: 'View My Groups', onPress: () => setActiveTab('my') },
        { text: 'Stay', style: 'cancel' }
      ]);
    }
  };

  const renderGroup = ({ item }: { item: Group.Group }) => (
    <GroupCard
      group={item}
      onLeave={handleGroupLeave}
      onDelete={handleGroupDelete}
      onJoin={handleGroupJoin}
    />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={activeTab === 'my' ? "people-outline" : "search-outline"} size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>
          {activeTab === 'my' ? "No Groups Yet" : "No New Groups"}
        </Text>
        <Text style={styles.emptyText}>
          {activeTab === 'my'
            ? "Create your first group or explore existing ones"
            : "You've joined all available groups!"}
        </Text>
        {activeTab === 'my' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emptyButton, styles.secondaryButton]}
              onPress={() => setActiveTab('explore')}
            >
              <Ionicons name="compass-outline" size={20} color="#3b82f6" />
              <Text style={[styles.emptyButtonText, { color: '#3b82f6' }]}>Explore</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Groups',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 8, padding: 8 }}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={28} color="#3b82f6" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>My Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>Explore</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82F6" />
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            groups.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#333' },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    marginRight: 24,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingTop: 16, paddingBottom: 32 },
  listContentEmpty: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
