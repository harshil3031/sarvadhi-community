import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Pressable, Platform, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChannelStore } from "../../src/store/channel.store";
import { usePostStore } from "../../src/store/post.store";
import { Post } from "../../src/api/posts";
import PostCard from "../../components/PostCard";
import CreatePostModal from "../../components/CreatePostModal";

export default function FeedScreen() {
  const router = useRouter();
  const { channels, fetchChannels, isLoading: channelsLoading } = useChannelStore();
  const { posts, fetchFeedPosts, isLoading: postsLoading } = usePostStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

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
    // Also re-fetch posts directly if we have channels
    const joined = channels.filter((c) => c.isMember);
    if (joined.length > 0) {
      await fetchFeedPosts(joined.map(c => c.id));
    }
    setIsRefreshing(false);
  };

  const handlePostCreated = () => {
    // Refresh posts explicitly
    const currentJoinedChannels = channels.filter((c) => c.isMember);
    if (currentJoinedChannels.length > 0) {
      const channelIds = currentJoinedChannels.map((c) => c.id);
      fetchFeedPosts(channelIds);
    }
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

  // Calculate default channel ID (first joined public channel)
  const defaultChannelId = joinedChannels.length > 0 ? joinedChannels[0].id : undefined;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Feed",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="search" size={24} color="#111827" />
            </TouchableOpacity>
          )
        }}
      />

      {joinedChannels.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📢</Text>
          <Text style={styles.emptyTitle}>Join Channels to See Posts</Text>
          <Text style={styles.info}>
            Join some channels to see posts in your feed.
          </Text>
        </View>
      ) : posts.length === 0 && !postsLoading ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🚀</Text>
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.info}>
            Be the first to post in your channels!
          </Text>
        </View>
      ) : (
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
      )}

      {/* Floating Action Button */}
      {joinedChannels.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed
          ]}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        channelId={defaultChannelId} // Initial selection
        availableChannels={joinedChannels} // Allow selection
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
    paddingBottom: 100, // Extra padding for FAB
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    zIndex: 50,
  },
  fabPressed: {
    backgroundColor: '#1D4ED8',
    transform: [{ scale: 0.95 }],
  },
});
