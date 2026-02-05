import { View, Text, StyleSheet, Button, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useChannelStore } from "../../../src/store/channel.store";
import { usePostStore } from "../../../src/store/post.store";
import { Channel } from "../../../src/api/channels";
import { Post } from "../../../src/api/posts";
import ReactionBar from "../../../components/ReactionBar";


export default function ChannelDetailScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();

  const {
    channels,
    joinChannel,
  } = useChannelStore();

  const { posts } = usePostStore();

  const channel = channels.find((c: Channel.Channel) => c.id === channelId);
  const isJoined = channel?.isMember || false;

  const channelPosts = posts.filter(
    (post: Post.Post) => post.channelId === channelId
  );


  // ❌ Safety check (invalid route)
  if (!channel) {
    return (
      <View style={styles.center}>
        <Text>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>#{channel.name}</Text>

      {!isJoined && (
        <View style={styles.joinBox}>
          <Text style={styles.info}>
            You must join this channel to view posts.
          </Text>
          <Button
            title="Join Channel"
            onPress={() => joinChannel(channel.id)}
          />
        </View>
      )}

      {isJoined && (
        <View>
            {channelPosts.length === 0 ? (
            <Text style={styles.placeholder}>No posts yet</Text>
            ) : (
            channelPosts.map((post: Post.Post) => (
                <View key={post.id} style={styles.postCard}>
                <Text style={styles.author}>{post.author.fullName}</Text>
                <Text>{post.content}</Text>
                <ReactionBar
                    postId={post.id}
                    currentReaction={null}
                    reactionCount={post.reactionCount}
                    onReactionChange={() => {
                      // TODO: Implement reaction service
                      console.log("Reaction changed");
                    }}
                    />
                </View>
            ))
            )}
        </View>
        )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  joinBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
  },
  info: {
    marginBottom: 12,
    fontSize: 14,
  },
  postsBox: {
    marginTop: 20,
    alignItems: "center",
  },
  placeholder: {
    fontSize: 14,
    color: "#6B7280",
  },
  postCard: {
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  backgroundColor: "#E5E7EB",
},
author: {
  fontWeight: "600",
  marginBottom: 4,
},
});
