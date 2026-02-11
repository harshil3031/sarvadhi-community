/**
 * HomeScreen - Main feed with posts
 */

import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { ScreenContainer } from '../components/base/ScreenContainer';
import { CreatePostCard } from '../components/feed/CreatePostCard';
import { PostCard } from '../components/feed/PostCard';
import { ReactionType } from '../components/feed/ReactionBar';

interface Post {
  id: string;
  avatar?: { uri: string };
  name: string;
  role: string;
  time: string;
  content: string;
  image?: { uri: string };
  tag?: 'Achievement' | 'Announcement';
  reactions?: Array<{
    type: ReactionType;
    count: number;
    userReacted?: boolean;
  }>;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Product Manager',
    time: '2 hours ago',
    content: 'Excited to announce our Q1 roadmap! We\'ve prioritized customer feedback and built amazing features. 🚀',
    tag: 'Announcement',
    reactions: [
      { type: '👍', count: 24, userReacted: true },
      { type: '❤️', count: 15 },
      { type: '🔥', count: 8 },
    ],
  },
  {
    id: '2',
    name: 'Alex Chen',
    role: 'Senior Developer',
    time: '5 hours ago',
    content: 'Just shipped the new authentication system! Huge thanks to the team. Performance improved by 40%.',
    tag: 'Achievement',
    reactions: [
      { type: '👍', count: 32 },
      { type: '🔥', count: 18, userReacted: true },
    ],
  },
];

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleReactionPress = (postId: string, reaction: ReactionType) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId && post.reactions) {
          const existing = post.reactions.find((r) => r.type === reaction);
          if (existing) {
            return {
              ...post,
              reactions: post.reactions.map((r) =>
                r.type === reaction
                  ? {
                      ...r,
                      count: r.userReacted ? r.count - 1 : r.count + 1,
                      userReacted: !r.userReacted,
                    }
                  : r
              ),
            };
          }
        }
        return post;
      })
    );
  };

  const renderPost: ListRenderItem<Post> = ({ item }) => (
    <PostCard
      id={item.id}
      avatar={item.avatar}
      name={item.name}
      role={item.role}
      time={item.time}
      content={item.content}
      image={item.image}
      tag={item.tag}
      reactions={item.reactions}
      onReactionPress={(reaction) => handleReactionPress(item.id, reaction)}
    />
  );

  const renderHeader = () => (
    <CreatePostCard userName="You" onPress={() => {}} />
  );

  const styles = StyleSheet.create({
    flatlist: {
      backgroundColor: colors.background,
    },
  });

  return (
    <ScreenContainer noPadding>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingHorizontal: Spacing.md }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        style={styles.flatlist}
      />
    </ScreenContainer>
  );
};
