import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { postApi } from '../../../src/api/posts';
import { channelApi } from '../../../src/api/channels';
import { Channel } from '../../../src/api/channels';
import { Post } from '../../../src/api/posts';
import { useAuthStore } from '../../../src/store/auth.store';
import { useChannelStore } from '../../../src/store/channel.store';
import { useSocketStore } from '../../../src/store/socket.store';
import CreatePostModal from '../../../components/CreatePostModal';
import PostCard from '../../../components/PostCard';

export default function ChannelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { joinChannel, requestJoinPrivate } = useChannelStore();
  const { on, off, emit } = useSocketStore();

  // Channel state
  const [channel, setChannel] = useState<Channel.Channel | null>(null);

  // Posts state (local component state, not global store per requirements)
  const [posts, setPosts] = useState<Post.Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false); // Track if user doesn't have access

  // Create post modal
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Prevent concurrent fetches
  const isFetchingRef = useRef(false);

  const LIMIT = 20;

  // Fetch channel details
  const fetchChannelDetails = async () => {
    try {
      const response = await channelApi.getChannel(id);
      if (response.data.success && response.data.data) {
        setChannel(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch channel:', err);
    }
  };

  // Fetch posts for this channel
  const fetchPosts = async (reset = false) => {
    // Skip if we already know access is denied
    if (accessDenied) {
      console.log('Skipping fetch - access denied to private channel');
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    isFetchingRef.current = true;

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await postApi.getPostsByChannel(id, LIMIT, currentOffset);

      if (response.data.success && response.data.data) {
        const newPosts = response.data.data;

        if (reset) {
          setPosts(newPosts);
          setOffset(LIMIT);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          setOffset(prev => prev + LIMIT);
        }

        // Check if there are more posts to load
        setHasMore(newPosts.length === LIMIT);
        setError(null);
        setAccessDenied(false); // Reset access denied if we successfully fetch
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to load posts';
      
      // Handle 403 forbidden errors (private channel access)
      if (err.response?.status === 403) {
        setError(errorMsg);
        setAccessDenied(true); // Set flag to prevent further requests
        // Don't show alert for 403 - user will see the join button instead
        console.log('403 Error: User does not have access to this private channel - stopping further requests');
        setPosts([]); // Clear any existing posts
      } else {
        setError(errorMsg);
        // Only show alert for non-403 errors
        Alert.alert('Error', errorMsg);
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      // Reset access denied flag when switching channels
      setAccessDenied(false);
      setIsLoading(true);
      fetchChannelDetails();
      fetchPosts(true);
    }
  }, [id]);

  // Join/leave channel room for real-time updates
  useEffect(() => {
    if (!id) return;

    emit('join_channel', { channelId: id });

    const handlePostCreated = (newPost: Post.Post) => {
      if (newPost.channelId === id) {
        setPosts((prev) => [newPost, ...prev]);
      }
    };

    on('channel_post_created', handlePostCreated);

    return () => {
      emit('leave_channel', { channelId: id });
      off('channel_post_created', handlePostCreated);
    };
  }, [id, emit, on, off]);

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setAccessDenied(false); // Allow retry on manual refresh
    setOffset(0);
    fetchPosts(true);
  };

  // Load more posts (pagination)
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      fetchPosts(false);
    }
  };

  // Handle new post created (optimistic UI)
  const handlePostCreated = (newPost: Post.Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Handle post updated (optimistic UI)
  const handlePostUpdated = (updatedPost: Post.Post) => {
    setPosts(prev =>
      prev.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  // Handle post deleted (optimistic UI)
  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleJoin = async () => {
    if (!channel) return;
    try {
      if (channel.type === 'public') {
        await joinChannel(channel.id);
        Alert.alert('Success', 'Joined channel successfully');
      } else {
        await requestJoinPrivate(channel.id);
        Alert.alert('Request Sent', 'Your request to join this private channel has been submitted.');
      }
      // Reset access denied flag and fetch fresh data
      setAccessDenied(false);
      fetchChannelDetails();
      fetchPosts(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join channel');
    }
  };

  // Render individual post
  const renderPost = ({ item }: { item: Post.Post }) => (
    <PostCard
      post={item}
      currentUserId={user?.id}
      onPostUpdated={handlePostUpdated}
      onPostDeleted={handlePostDeleted}
      showActions={true}
    />
  );

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: channel?.name || 'Channel Feed',
          headerBackTitle: 'Channels',
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/channels/info/${id}`)}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#4B5563" />
            </Pressable>
          )
        }}
      />

      {/* Not a Member Banner */}
      {!channel?.isMember && (
        <View style={styles.joinContainer}>
          <View style={styles.joinIconContainer}>
            <Ionicons
              name={channel?.type === 'private' ? 'lock-closed' : 'megaphone-outline'}
              size={48}
              color="#3B82F6"
            />
          </View>
          <Text style={styles.joinTitle}>
            {channel?.type === 'private' ? 'Private Channel' : 'Join this Channel'}
          </Text>
          <Text style={styles.joinDescription}>
            {channel?.type === 'private'
              ? 'This is a private channel. You need to request access to view content and participate.'
              : 'You are currently viewing this channel as a guest. Join to start posting and interacting!'}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.joinButtonPressed,
            ]}
            onPress={handleJoin}
          >
            <Text style={styles.joinButtonText}>
              {channel?.type === 'private' ? 'Request Access' : 'Join Channel'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Create Post Button (Only for members) */}
      {channel?.isMember && (
        <View style={styles.createPostContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.createPostButton,
              pressed && styles.createPostButtonPressed,
            ]}
            onPress={() => setShowCreatePost(true)}
          >
            <Text style={styles.createPostButtonText}>✍️ Create Post</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={channel?.isMember ? posts : []}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to post in this channel!
            </Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        channelId={id}
        onPostCreated={handlePostCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  createPostContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  createPostButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createPostButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
  joinContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  joinIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  joinTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  joinDescription: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonPressed: {
    backgroundColor: '#1D4ED8',
    transform: [{ scale: 0.98 }],
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
