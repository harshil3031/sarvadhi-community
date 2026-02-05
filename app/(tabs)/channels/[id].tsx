import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, Stack } from 'expo-router';
import { postApi } from '../../../src/api/posts';
import { channelApi } from '../../../src/api/channels';
import { Channel } from '../../../src/api/channels';
import { Post } from '../../../src/api/posts';
import { useAuthStore } from '../../../src/store';
import CreatePostModal from '../../../components/CreatePostModal';
import PostCard from '../../../components/PostCard';

export default function ChannelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  
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
  
  // Create post modal
  const [showCreatePost, setShowCreatePost] = useState(false);

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
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load posts');
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      fetchChannelDetails();
      fetchPosts(true);
    }
  }, [id]);

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
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
        }} 
      />
      
      {/* Create Post Button */}
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

      <FlatList
        data={posts}
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
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  createPostContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
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
});
