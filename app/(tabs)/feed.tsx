import { View, Text, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChannelStore } from "../../src/store/channel.store";
import { useAuthStore } from "../../src/store/auth.store";
import PostFeed from "../../src/components/PostFeed";
import CreatePostModal from "../../components/CreatePostModal";
import { useTheme } from "../../src/theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedScreen() {
  const router = useRouter();
  const { channels, fetchChannels, isLoading: channelsLoading } = useChannelStore();
  const { user } = useAuthStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { colors } = useTheme();

  // Memoize joined channels to prevent recalculation
  const joinedChannels = useMemo(() =>
    channels.filter((c) => c.isMember),
    [channels]
  );

  // Need to force update PostFeed when new post created
  const [feedVersion, setFeedVersion] = useState(0);

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

  const handlePostCreated = useCallback(() => {
    setFeedVersion(v => v + 1);
  }, []);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
      ) : (
        <PostFeed key={feedVersion} />
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
    flex: 1,
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
