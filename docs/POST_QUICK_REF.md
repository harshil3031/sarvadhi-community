# Post Feature - Quick Reference

Fast copy-paste examples for post operations.

## 🚀 Quick Actions

### Show Create Post Modal
```typescript
const [showCreatePost, setShowCreatePost] = useState(false);

<Pressable onPress={() => setShowCreatePost(true)}>
  <Text>✍️ Create Post</Text>
</Pressable>

<CreatePostModal
  visible={showCreatePost}
  onClose={() => setShowCreatePost(false)}
  channelId={channelId}
  onPostCreated={(newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }}
/>
```

### Display Post Card
```typescript
<PostCard
  post={post}
  currentUserId={user?.id}
  onPostUpdated={(updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  }}
  onPostDeleted={(id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }}
  showActions={true}
/>
```

### Create Post (Manual API Call)
```typescript
import { postApi } from '@/api/posts';

const createPost = async () => {
  try {
    const response = await postApi.createPost({
      content: "Hello world!",
      channelId: "channel_123", // or groupId: "group_456"
    });
    
    if (response.data.success) {
      const newPost = response.data.data;
      // Add to posts list
      setPosts(prev => [newPost, ...prev]);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to create post');
  }
};
```

### Pin Post
```typescript
const pinPost = async (postId: string) => {
  try {
    await postApi.pinPost(postId);
    
    // Optimistic UI update
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, isPinned: true } : post
    ));
  } catch (error) {
    Alert.alert('Error', 'Failed to pin post');
  }
};
```

### Unpin Post
```typescript
const unpinPost = async (postId: string) => {
  try {
    await postApi.unpinPost(postId);
    
    // Optimistic UI update
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, isPinned: false } : post
    ));
  } catch (error) {
    Alert.alert('Error', 'Failed to unpin post');
  }
};
```

### Delete Post
```typescript
const deletePost = async (postId: string) => {
  Alert.alert(
    'Delete Post',
    'Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await postApi.deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]
  );
};
```

## 📦 Component Props

### CreatePostModal Props
```typescript
<CreatePostModal
  visible={boolean}                          // Required
  onClose={() => void}                       // Required
  channelId={string}                         // Optional (use channelId OR groupId)
  groupId={string}                           // Optional (use channelId OR groupId)
  onPostCreated={(post: Post.Post) => void}  // Optional callback
/>
```

### PostCard Props
```typescript
<PostCard
  post={Post.Post}                                    // Required
  currentUserId={string}                              // Optional (for author check)
  onPostUpdated={(updated: Post.Post) => void}        // Optional callback
  onPostDeleted={(postId: string) => void}            // Optional callback
  showActions={boolean}                               // Optional (default: true)
/>
```

## 🎯 Complete Integration Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, Pressable, Text } from 'react-native';
import { postApi, Post } from '@/api/posts';
import { useAuthStore } from '@/store';
import CreatePostModal from '@/components/CreatePostModal';
import PostCard from '@/components/PostCard';

export default function PostFeed({ channelId }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post.Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postApi.getPostsByChannel(channelId, 20, 0);
        if (response.data.success) {
          setPosts(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [channelId]);

  // Handlers
  const handlePostCreated = (newPost: Post.Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost: Post.Post) => {
    setPosts(prev => 
      prev.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Create Post Button */}
      <Pressable
        style={{ padding: 16, backgroundColor: '#3B82F6' }}
        onPress={() => setShowCreatePost(true)}
      >
        <Text style={{ color: '#FFFFFF' }}>✍️ Create Post</Text>
      </Pressable>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?.id}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        )}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        channelId={channelId}
        onPostCreated={handlePostCreated}
      />
    </View>
  );
}
```

## 🎨 Styling Snippets

### Create Post Button (Styled)
```typescript
const styles = StyleSheet.create({
  createPostButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

<Pressable 
  style={styles.createPostButton}
  onPress={() => setShowCreatePost(true)}
>
  <Text style={styles.createPostButtonText}>✍️ Create Post</Text>
</Pressable>
```

## 🔧 Common Patterns

### Optimistic UI Update Pattern
```typescript
// 1. Update UI immediately
setPosts(prev => prev.map(post =>
  post.id === targetId ? { ...post, isPinned: !post.isPinned } : post
));

// 2. Call API
try {
  await postApi.pinPost(targetId);
} catch (error) {
  // Error handling - UI already updated
  Alert.alert('Error', 'Failed to pin post');
}
```

### Permission Check Pattern
```typescript
const isAuthor = currentUserId === post.authorId;

{isAuthor && (
  <Pressable onPress={() => deletePost(post.id)}>
    <Text>🗑️ Delete</Text>
  </Pressable>
)}
```

### Error Handling Pattern
```typescript
try {
  const response = await postApi.createPost(data);
  if (response.data.success && response.data.data) {
    onPostCreated(response.data.data);
  }
} catch (err: any) {
  const message = err.response?.data?.message || 'Failed to create post';
  Alert.alert('Error', message);
}
```

## 📊 Data Types

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

### Create Post Request
```typescript
interface CreatePostRequest {
  content: string;        // Required
  channelId?: string;     // Optional (use channelId OR groupId)
  groupId?: string;       // Optional (use channelId OR groupId)
}
```

## 🐛 Troubleshooting

**Modal not showing:**
```typescript
// Make sure visible prop is controlled
const [visible, setVisible] = useState(false);
<CreatePostModal visible={visible} onClose={() => setVisible(false)} />
```

**Post not added to list:**
```typescript
// Check onPostCreated callback
onPostCreated={(newPost) => {
  console.log('New post:', newPost); // Debug
  setPosts(prev => [newPost, ...prev]);
}}
```

**Delete button not showing:**
```typescript
// Ensure currentUserId is passed
<PostCard 
  post={post} 
  currentUserId={user?.id}  // Must pass current user ID
/>
```

**Pin button not working:**
```typescript
// Check onPostUpdated callback
onPostUpdated={(updated) => {
  console.log('Updated post:', updated); // Debug
  setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
}}
```

## ⚡ Performance Tips

1. **Use keyExtractor** for FlatList
2. **Memoize callbacks** if needed with useCallback
3. **Limit posts per page** (default: 20)
4. **Implement pagination** for large lists
5. **Use optimistic UI** for instant feedback

## 📚 Related Files

- **API**: `src/api/posts.ts`
- **Components**: `components/CreatePostModal.tsx`, `components/PostCard.tsx`
- **Screens**: `app/(tabs)/channels/[id].tsx`
- **Store**: `src/store/auth.store.ts` (for currentUserId)
- **Types**: `Post.Post`, `Post.CreatePostRequest`
