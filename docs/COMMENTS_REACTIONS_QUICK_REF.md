# Comments & Reactions - Quick Reference

Fast copy-paste examples for comments and reactions.

## 🚀 Quick Usage

### Add Reaction Bar to Post
```typescript
import ReactionBar from '@/components/ReactionBar';

<ReactionBar
  postId={post.id}
  currentReaction={null}
  reactionCount={post.reactionCount}
  onReactionChange={() => {
    // Optional: refresh post data
  }}
/>
```

### Show Comment List
```typescript
import CommentList from '@/components/CommentList';

const [commentCount, setCommentCount] = useState(post.commentCount);

<CommentList
  postId={post.id}
  commentCount={commentCount}
  onCommentCountChange={(newCount) => setCommentCount(newCount)}
/>
```

### Use Updated PostCard (All-in-One)
```typescript
import PostCard from '@/components/PostCard';

<PostCard
  post={post}
  currentUserId={user?.id}
  onPostUpdated={(updated) => setPosts(prev => 
    prev.map(p => p.id === updated.id ? updated : p)
  )}
  onPostDeleted={(id) => setPosts(prev => 
    prev.filter(p => p.id !== id)
  )}
/>
// Includes reactions + comment button + comment modal
```

## 📦 API Calls

### Reaction API

**Add Reaction:**
```typescript
import { reactionApi } from '@/api/reaction.api';

await reactionApi.addReaction(postId, { emoji: '❤️' });
```

**Remove Reaction:**
```typescript
await reactionApi.removeReaction(postId);
```

**Get All Reactions:**
```typescript
const response = await reactionApi.getReactions(postId);
const reactions = response.data.data;
```

**Get Reaction Summary:**
```typescript
const response = await reactionApi.getReactionsSummary(postId);
// Returns: [{ emoji: '❤️', count: 15, userReacted: true }, ...]
```

### Comment API

**Create Comment:**
```typescript
import { commentApi } from '@/api/comment.api';

const response = await commentApi.createComment(postId, {
  content: 'Great post!'
});
```

**Get Comments:**
```typescript
const response = await commentApi.getComments(postId, 20, 0);
const comments = response.data.data;
```

**Delete Comment:**
```typescript
await commentApi.deleteComment(commentId);
```

## 🎯 Common Patterns

### Reaction with Optimistic UI
```typescript
const [userReaction, setUserReaction] = useState<string | null>(null);
const [count, setCount] = useState(post.reactionCount);

const handleReact = async (emoji: string) => {
  const previous = { reaction: userReaction, count };
  
  try {
    // Optimistic update
    if (userReaction === emoji) {
      setUserReaction(null);
      setCount(c => Math.max(0, c - 1));
      await reactionApi.removeReaction(postId);
    } else {
      setUserReaction(emoji);
      setCount(c => userReaction ? c : c + 1);
      await reactionApi.addReaction(postId, { emoji });
    }
  } catch (error) {
    // Revert on error
    setUserReaction(previous.reaction);
    setCount(previous.count);
    Alert.alert('Error', 'Failed to update reaction');
  }
};
```

### Comment with Count Update
```typescript
const [comments, setComments] = useState([]);
const [count, setCount] = useState(0);

const handleAddComment = async (content: string) => {
  try {
    const response = await commentApi.createComment(postId, { content });
    
    // Add to list
    setComments(prev => [response.data.data, ...prev]);
    
    // Update count
    setCount(prev => prev + 1);
  } catch (error) {
    Alert.alert('Error', 'Failed to add comment');
  }
};
```

### Delete Comment with Confirmation
```typescript
const handleDeleteComment = (commentId: string) => {
  Alert.alert(
    'Delete Comment',
    'Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentApi.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
            setCount(prev => Math.max(0, prev - 1));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]
  );
};
```

## 📊 Data Types

### Reaction Types
```typescript
interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ReactionSummary {
  emoji: string;
  count: number;
  userReacted: boolean;
}
```

### Comment Types
```typescript
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  content: string;
  reactionCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Customization Examples

### Custom Reaction Emojis
```typescript
// In ReactionBar.tsx
const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];
// Change to your preferred emojis
```

### Custom Comment Input Placeholder
```typescript
// In CommentList.tsx
<TextInput
  placeholder="Write a comment..."  // Customize this
  placeholderTextColor="#9CA3AF"
/>
```

### Custom Validation
```typescript
// In CommentList.tsx
if (content.length > 2000) {  // Change max length
  Alert.alert('Error', 'Comment is too long');
  return;
}
```

## 🔧 Integration Examples

### In Channel Feed
```typescript
import PostCard from '@/components/PostCard';

function ChannelFeed({ channelId }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          currentUserId={user?.id}
          onPostUpdated={(updated) => 
            setPosts(prev => prev.map(p => 
              p.id === updated.id ? updated : p
            ))
          }
          onPostDeleted={(id) => 
            setPosts(prev => prev.filter(p => p.id !== id))
          }
        />
      )}
    />
  );
}
```

### Standalone Comment Section
```typescript
import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import CommentList from '@/components/CommentList';

function MyComponent({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  return (
    <>
      <Pressable onPress={() => setShowComments(true)}>
        <Text>💬 {commentCount} Comments</Text>
      </Pressable>

      <Modal
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
      >
        <CommentList
          postId={post.id}
          commentCount={commentCount}
          onCommentCountChange={setCommentCount}
        />
      </Modal>
    </>
  );
}
```

## 🐛 Troubleshooting

**Reaction not updating:**
```typescript
// Make sure onReactionChange is called
<ReactionBar
  onReactionChange={() => {
    console.log('Reaction changed!');  // Debug
    // Refresh post or counts here
  }}
/>
```

**Comment count out of sync:**
```typescript
// Use callback to keep count in sync
<CommentList
  onCommentCountChange={(newCount) => {
    console.log('New count:', newCount);  // Debug
    setCommentCount(newCount);
  }}
/>
```

**Modal not closing:**
```typescript
// Check onRequestClose handler
<Modal
  visible={showComments}
  onRequestClose={() => {
    console.log('Closing modal');  // Debug
    setShowComments(false);
  }}
>
```

## ⚡ Performance Tips

1. **Use FlatList for comments** (built-in, handles pagination)
2. **Implement pagination** (20 comments per page)
3. **Optimistic UI** for instant feedback
4. **useCallback** for handlers if needed
5. **Memoize** comment items if expensive

## 📝 Validation Helpers

```typescript
// Validate comment content
const validateComment = (content: string): boolean => {
  const trimmed = content.trim();
  if (!trimmed) {
    Alert.alert('Error', 'Comment cannot be empty');
    return false;
  }
  if (trimmed.length > 2000) {
    Alert.alert('Error', 'Comment is too long (max 2000 characters)');
    return false;
  }
  return true;
};

// Validate emoji
const VALID_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];
const isValidEmoji = (emoji: string): boolean => {
  return VALID_EMOJIS.includes(emoji);
};
```

## 🎯 Rules Checklist

- [x] Flat comments only (no nesting)
- [x] One reaction per user
- [x] Refresh counts after action
- [x] Optimistic UI updates
- [x] Error handling with alerts
- [x] Keyboard-aware comment input
- [x] Author-only comment deletion
- [x] Pagination for comments

## 📚 Related Files

- **API**: `src/api/reaction.api.ts`, `src/api/comment.api.ts`
- **Components**: `components/ReactionBar.tsx`, `components/CommentList.tsx`, `components/PostCard.tsx`
- **Usage**: All post feed screens (channels, groups)
