import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Pressable, Platform, TouchableOpacity, SafeAreaView } from "react-native";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChannelStore } from "../../src/store/channel.store";
import { usePostStore } from "../../src/store/post.store";
import { Post } from "../../src/api/posts";
import PostCard from "../../components/PostCard";
import CreatePostModal from "../../components/CreatePostModal";
import { useTheme } from "../../src/theme/ThemeContext";

export default function FeedScreen() {
  const router = useRouter();
  const { channels, fetchChannels, isLoading: channelsLoading } = useChannelStore();
  const { posts, fetchFeedPosts, isLoading: postsLoading } = usePostStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { colors } = useTheme();

  // Memoize joined channels to prevent recalculation
  const joinedChannels = useMemo(() => 
    channels.filter((c) => c.isMember),
    [channels]
  );

  const loadFeed = useCallback(async () => {
    try {
      await fetchChannels();
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  }, [fetchChannels]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    // When channels are loaded, fetch posts from joined channels
    if (joinedChannels.length > 0) {
      const channelIds = joinedChannels.map((c) => c.id);
      fetchFeedPosts(channelIds).catch(error => {
        console.error('Failed to load posts:', error);
      });
    }
  }, [joinedChannels.length]); // Only when count changes

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFeed();
    // Also re-fetch posts directly if we have channels
    if (joinedChannels.length > 0) {
      await fetchFeedPosts(joinedChannels.map(c => c.id));
    }
    setIsRefreshing(false);
  }, [loadFeed, joinedChannels, fetchFeedPosts]);

  const handlePostCreated = useCallback(() => {
    // Refresh posts explicitly
    if (joinedChannels.length > 0) {
      const channelIds = joinedChannels.map((c) => c.id);
      fetchFeedPosts(channelIds);
    }
  }, [joinedChannels, fetchFeedPosts]);

  // Calculate default channel ID (first joined public channel)
  const defaultChannelId = useMemo(() => 
    joinedChannels.length > 0 ? joinedChannels[0].id : undefined,
    [joinedChannels]
  );

  if (channelsLoading && channels.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerTitle: "Feed",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }}
      />

      {joinedChannels.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📢</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Join Channels to See Posts</Text>
          <Text style={[styles.info, { color: colors.textSecondary }]}>
            Join some channels to see posts in your feed.
          </Text>
        </View>
      ) : posts.length === 0 && !postsLoading ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🚀</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Posts Yet</Text>
          <Text style={[styles.info, { color: colors.textSecondary }]}>
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
              onPostUpdated={handleRefresh}
              onPostDeleted={handleRefresh}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={21}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          ListEmptyComponent={
            postsLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
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
            { backgroundColor: colors.primary },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
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
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
