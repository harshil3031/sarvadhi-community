import React, { useState, useEffect, useCallback } from 'react';
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
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
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
  const [posts, setPosts] = useState<Post.Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  const isCreator = user?.id === group?.creatorId;

  const fetchGroup = async () => {
    try {
      const response = await groupApi.getGroup(id!);
      if (response.data.success && response.data.data) {
        setGroup(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch group:', err);
      Alert.alert('Error', 'Failed to load group details');
      router.back();
    }
  };

  const fetchPosts = async (isRefresh = false, loadMore = false) => {
    if (!id) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else if (loadMore) {
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

        if (loadMore) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

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
    if (!isLoadingMore && hasMore) {
      fetchPosts(false, true);
    }
  };

  const handlePostCreated = (newPost: Post.Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost: Post.Post) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleLeaveGroup = async () => {
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
            setIsLeavingGroup(true);
            try {
              const response = await groupApi.leaveGroup(id!);
              if (response.data.success) {
                router.back();
              }
            } catch (err: any) {
              const errorMsg =
                err.response?.data?.message || err.message || 'Failed to leave group';
              Alert.alert('Error', errorMsg);
            } finally {
              setIsLeavingGroup(false);
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: Post.Post }) => (
    <PostCard
      post={item}
      onPostUpdated={handlePostUpdated}
      onPostDeleted={handlePostDeleted}
    />
  );

  const renderHeader = () => (
    <View style={styles.groupHeader}>
      <View style={styles.groupIconContainer}>
        <Ionicons name="people" size={32} color="#3b82f6" />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group?.name}</Text>
        {group?.description && (
          <Text style={styles.groupDescription}>{group.description}</Text>
        )}
        <View style={styles.groupStats}>
          <Ionicons name="person" size={14} color="#999" />
          <Text style={styles.memberCount}>
            {group?.memberCount || 0} {group?.memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </View>

      <View style={styles.groupActions}>
        {isCreator && (
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
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <>
                <Ionicons name="exit-outline" size={20} color="#666" />
                <Text style={styles.leaveButtonText}>Leave</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => setShowCreatePost(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.createPostButtonText}>Create Post</Text>
      </TouchableOpacity>

      <View style={styles.divider} />
      <Text style={styles.postsTitle}>Posts</Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptyText}>Be the first to share something!</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        groupId={id}
        onPostCreated={handlePostCreated}
      />

      {/* Invite User Modal */}
      {isCreator && (
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
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  listContent: {
    paddingBottom: 32,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  groupHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  groupIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupInfo: {
    gap: 4,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  memberCount: {
    fontSize: 13,
    color: '#999',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 16,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
