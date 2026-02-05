import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useChannelStore } from "../../src/store/channel.store";
import { usePostStore } from "../../src/store/post.store";
import { Post } from "../../src/api/posts";
import PostCard from "../../components/PostCard";

export default function FeedScreen() {
  const { channels, fetchChannels, isLoading: channelsLoading } = useChannelStore();
  const { posts, fetchFeedPosts, isLoading: postsLoading } = usePostStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      await fetchChannels();
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  useEffect(() => {
    // When channels are loaded, fetch posts from joined channels
    const joinedChannels = channels.filter((c) => c.isMember);
    if (joinedChannels.length > 0) {
      const channelIds = joinedChannels.map((c) => c.id);
      fetchFeedPosts(channelIds).catch(error => {
        console.error('Failed to load posts:', error);
      });
    }
  }, [channels]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed();
    setIsRefreshing(false);
  };

  const joinedChannels = channels.filter((c) => c.isMember);

  if (channelsLoading && channels.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  if (joinedChannels.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📢</Text>
        <Text style={styles.emptyTitle}>Join Channels to See Posts</Text>
        <Text style={styles.info}>
          Join some channels to see posts in your feed.
        </Text>
      </View>
    );
  }

  if (posts.length === 0 && !postsLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🚀</Text>
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.info}>
          Be the first to post in your channels!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={posts}
      keyExtractor={(item: Post.Post) => item.id}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPostUpdated={() => handleRefresh()}
          onPostDeleted={() => handleRefresh()}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
        />
      }
      ListEmptyComponent={
        postsLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  list: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
});
