# Channel Module - Quick Reference

Fast copy-paste examples for common channel operations.

## 🚀 Quick Actions

### Navigate to Channel List
```typescript
import { router } from 'expo-router';

router.push('/(tabs)/channels');
```

### Navigate to Channel Feed
```typescript
router.push(`/channels/${channelId}`);
```

### Join a Channel
```typescript
import { useChannelStore } from '@/store/channel.store';

const { joinChannel } = useChannelStore();
await joinChannel(channelId);
```

### Leave a Channel
```typescript
const { leaveChannel } = useChannelStore();
await leaveChannel(channelId);
```

### Fetch Channel Posts (Local State)
```typescript
import { useState, useEffect } from 'react';
import { postApi } from '@/api/posts';

const [posts, setPosts] = useState([]);
const [offset, setOffset] = useState(0);
const LIMIT = 20;

useEffect(() => {
  const fetchPosts = async () => {
    const response = await postApi.getPostsByChannel(channelId, LIMIT, offset);
    if (response.data.success) {
      setPosts(response.data.data);
    }
  };
  fetchPosts();
}, [channelId]);
```

### Pagination (Load More)
```typescript
const loadMore = async () => {
  const response = await postApi.getPostsByChannel(
    channelId,
    LIMIT,
    offset + LIMIT
  );
  
  if (response.data.success) {
    setPosts(prev => [...prev, ...response.data.data]);
    setOffset(prev => prev + LIMIT);
  }
};

// In FlatList
<FlatList
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### Pull to Refresh
```typescript
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  const response = await postApi.getPostsByChannel(channelId, LIMIT, 0);
  if (response.data.success) {
    setPosts(response.data.data);
    setOffset(LIMIT);
  }
  setRefreshing(false);
};

// In FlatList
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  }
/>
```

## 📊 Data Structures

### Channel Type
```typescript
interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  creatorId: string;
  memberCount?: number;
  isMember?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Post Type
```typescript
interface Post {
  id: string;
  content: string;
  channelId?: string;
  groupId?: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  isPinned: boolean;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Component Snippets

### Channel Card
```tsx
<Pressable
  style={styles.channelCard}
  onPress={() => router.push(`/channels/${item.id}`)}
>
  <View style={styles.channelInfo}>
    <Text style={styles.channelName}>{item.name}</Text>
    <Text style={styles.channelDescription}>{item.description}</Text>
    <Text style={styles.memberCount}>👥 {item.memberCount} members</Text>
  </View>
  <Button title={item.isMember ? "Leave" : "Join"} />
</Pressable>
```

### Post Card
```tsx
<View style={styles.postCard}>
  <View style={styles.postHeader}>
    <Text style={styles.authorName}>{post.author.fullName}</Text>
    <Text style={styles.postTime}>
      {new Date(post.createdAt).toLocaleDateString()}
    </Text>
  </View>
  <Text style={styles.postContent}>{post.content}</Text>
  <View style={styles.postStats}>
    <Text>❤️ {post.reactionCount} reactions</Text>
    <Text>💬 {post.commentCount} comments</Text>
  </View>
</View>
```

### Empty State
```tsx
<View style={styles.emptyContainer}>
  <Text style={styles.emptyText}>No posts yet</Text>
  <Text style={styles.emptySubtext}>
    Be the first to post in this channel!
  </Text>
</View>
```

### Loading Footer
```tsx
{isLoadingMore && (
  <View style={styles.footerLoader}>
    <ActivityIndicator size="small" color="#3B82F6" />
    <Text>Loading more...</Text>
  </View>
)}
```

## 🔧 Common Patterns

### With Error Handling
```typescript
const handleJoin = async (channelId: string) => {
  try {
    await joinChannel(channelId);
  } catch (error: any) {
    Alert.alert(
      'Error',
      error.response?.data?.message || 'Failed to join channel'
    );
  }
};
```

### With Loading State
```typescript
const [isJoining, setIsJoining] = useState(false);

const handleJoin = async (channelId: string) => {
  setIsJoining(true);
  try {
    await joinChannel(channelId);
  } catch (error) {
    // handle error
  } finally {
    setIsJoining(false);
  }
};
```

### Stop Multiple Requests
```typescript
const [isLoading, setIsLoading] = useState(false);

const loadMore = async () => {
  if (isLoading || !hasMore) return; // Prevent multiple requests
  
  setIsLoading(true);
  // ... fetch data
  setIsLoading(false);
};
```

## 📱 Screen Flow

```
Channels Tab
    ↓
Channel List (index.tsx)
    ↓ (tap channel)
Channel Feed ([id].tsx)
    ↓ (show posts)
Individual Posts
```

## ⚡ Performance Tips

1. **Use keyExtractor** on FlatList for better performance
2. **Set onEndReachedThreshold** to 0.5 for smooth pagination
3. **Store posts locally** (not in global store) to avoid memory issues
4. **Limit posts per page** to 20 for optimal load times
5. **Use memo** for expensive renders if needed

## 🐛 Common Issues

**Issue:** Posts not loading
- Check if channelId is valid
- Verify API endpoint is correct
- Check network request in debugger

**Issue:** Pagination not working
- Ensure `hasMore` flag is updated correctly
- Check if `offset` is incrementing
- Verify `onEndReached` is firing

**Issue:** Join/Leave not updating UI
- Check if store is updating state
- Verify API response is successful
- Ensure component is subscribed to store

## 📚 Related Files

- API: `src/api/channels.ts`, `src/api/posts.ts`
- Store: `src/store/channel.store.ts`
- Screens: `app/(tabs)/channels/index.tsx`, `app/(tabs)/channels/[id].tsx`
- Types: `Channel.Channel`, `Post.Post`
