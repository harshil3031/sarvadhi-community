import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Group, groupApi } from '../../../src/api/group.api';
import { Post, postApi } from '../../../src/api/posts';
import { useAuthStore } from '../../../src/store';
import PostCard from '../../../components/PostCard';
import CreatePostModal from '../../../components/CreatePostModal';
import InviteUserModal from '../../../components/InviteUserModal';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [group, setGroup] = useState<Group.Group | null>(null);
  const [members, setMembers] = useState<Group.GroupMember[]>([]);
  const [posts, setPosts] = useState<Post.Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  const isCreator = user?.id === group?.createdBy;
  const canInvite = isCreator;

  // Animated value for floating button
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const fetchGroup = async () => {
    try {
      const response = await groupApi.getGroup(id!);
      if (response.data.success && response.data.data) setGroup(response.data.data);

      const membersRes = await groupApi.getGroupMembers(id!);
      if (membersRes.data.success && Array.isArray(membersRes.data.data)) {
        setMembers(membersRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch group:', err);
      Alert.alert('Error', 'Failed to load group details');
      router.back();
    }
  };

  const fetchPosts = async (isRefresh = false, loadMore = false) => {
    if (!id) return;

    if (isRefresh) setIsRefreshing(true);
    else if (loadMore) {
      if (isLoadingMore || !hasMore) return;
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const offset = loadMore ? posts.length : 0;
      const response = await postApi.getPostsByGroup(id, 20, offset);

      if (response.data.success && response.data.data) {
        const newPosts = response.data.data;
        setPosts(loadMore ? [...posts, ...newPosts] : newPosts);
        setHasMore(newPosts.length === 20);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchGroup();
        fetchPosts();
      }
    }, [id])
  );

  const handleRefresh = () => {
    fetchGroup();
    fetchPosts(true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) fetchPosts(false, true);
  };

  const handleJoinGroup = async () => {
    if (!group) return;
    try {
      await groupApi.joinGroup(group.id);
      Alert.alert('Success', 'Joined group successfully');
      fetchGroup();
      fetchPosts(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsLeavingGroup(true);
            try {
              const response = await groupApi.leaveGroup(id!);
              if (response.data.success) router.back();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.response?.data?.message || 'Failed to leave group'
              );
            } finally {
              setIsLeavingGroup(false);
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: Post.Post }) => (
    <View style={styles.postWrapper}>
      <PostCard post={item} />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.groupHeader}>
      <Stack.Screen
        options={{
          headerTitle: group?.name || 'Group',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push(`/groups/info/${id}`)}
                style={{ padding: 8 }}
              >
                <Ionicons name="information-circle-outline" size={24} color="#4B5563" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLeaveGroup} style={{ marginRight: 8, padding: 8 }}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.groupIconContainer}>
        <Ionicons name="people" size={32} color="#3b82f6" />
      </View>

      {group?.description && (
        <Text style={styles.groupDescription}>{group.description}</Text>
      )}

      <View style={styles.groupStats}>
        <Ionicons name="person" size={14} color="#999" />
        <Text style={styles.memberCount}>
          {group?.memberCount || 0} members
        </Text>
      </View>

      <View style={styles.groupActions}>
        {group?.isMember ? (
          <>
            {canInvite && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteUser(true)}
              >
                <Ionicons name="person-add" size={20} color="#3b82f6" />
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            )}

            {!isCreator && (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveGroup}
                disabled={isLeavingGroup}
              >
                {isLeavingGroup ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <>
                    <Ionicons name="exit-outline" size={20} />
                    <Text style={styles.leaveButtonText}>Leave</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinGroup}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />
      <Text style={styles.postsTitle}>{group?.isMember ? 'Posts' : 'Join to see Posts'}</Text>
    </View>
  );

  const handlePostCreated = (newPost: Post.Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={group?.isMember ? posts : []}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />

      {/* Animated Floating Button */}
      {group?.isMember && (
        <Animated.View style={[styles.floatingButton, { transform: [{ translateY }] }]}>
          <TouchableOpacity onPress={() => setShowCreatePost(true)}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        groupId={id}
        onPostCreated={handlePostCreated}
      />

      {canInvite && (
        <InviteUserModal
          visible={showInviteUser}
          groupId={id!}
          onClose={() => setShowInviteUser(false)}
          onUserInvited={fetchGroup}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  groupHeader: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', flex: 1 },
  groupIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  groupDescription: { color: '#6B7280', marginBottom: 8, textAlign: 'center' },
  groupStats: { flexDirection: 'row', gap: 6, marginBottom: 16, justifyContent: 'center' },
  memberCount: { color: '#999' },
  groupActions: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  inviteButton: {
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: { color: '#3b82f6', fontWeight: '600' },
  leaveButton: {
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  leaveButtonText: { fontWeight: '600', color: '#b91c1c' },
  joinButton: {
    flexDirection: 'row',
    gap: 6,
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  joinButtonText: { fontWeight: '600', color: '#fff' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  postsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  postWrapper: {
    backgroundColor: 'transparent',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
