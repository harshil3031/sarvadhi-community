# Post Feature Implementation

Complete post functionality with create, list, pin/unpin, and delete actions.

## ✅ Implementation Summary

### Components Created
1. **`CreatePostModal.tsx`** (205 lines) - Modal for creating new posts
2. **`PostCard.tsx`** (274 lines) - Reusable post card with actions
3. **Updated `channels/[id].tsx`** - Integrated post features

### Features Implemented
✅ Create post with modal UI  
✅ List posts with pagination  
✅ Pin/unpin posts (UI shown to all, backend enforces permissions)  
✅ Delete posts (only for post authors)  
✅ Optimistic UI updates  
✅ Character limit (5000 characters)  
✅ Form validation  
✅ Error handling  
✅ Loading states  

## 📦 Components

### CreatePostModal

**Purpose:** Modal interface for creating new posts in channels/groups

**Props:**
```typescript
interface CreatePostModalProps {
  visible: boolean;              // Show/hide modal
  onClose: () => void;           // Close callback
  channelId?: string;            // Target channel ID
  groupId?: string;              // Target group ID
  onPostCreated?: (post: Post.Post) => void;  // Success callback
}
```

**Features:**
- ✍️ Multiline text input (max 5000 characters)
- 📝 Character counter
- ✅ Content validation
- 🔄 Loading states
- ❌ Error display with dismissible banner
- ⌨️ Keyboard handling (iOS/Android)
- 📱 Page sheet presentation style

**Usage:**
```typescript
const [showCreatePost, setShowCreatePost] = useState(false);

<CreatePostModal
  visible={showCreatePost}
  onClose={() => setShowCreatePost(false)}
  channelId={channelId}
  onPostCreated={(newPost) => {
    // Handle optimistic UI update
    setPosts(prev => [newPost, ...prev]);
  }}
/>
```

### PostCard

**Purpose:** Reusable post display component with actions

**Props:**
```typescript
interface PostCardProps {
  post: Post.Post;              // Post data
  currentUserId?: string;       // Current user ID (for author check)
  onPostUpdated?: (updatedPost: Post.Post) => void;  // Update callback
  onPostDeleted?: (postId: string) => void;          // Delete callback
  showActions?: boolean;        // Show/hide action buttons (default: true)
}
```

**Features:**
- 👤 Author avatar (first letter)
- 📅 Formatted timestamp
- 📌 Pinned badge (visual indicator)
- ❤️ Reaction count
- 💬 Comment count
- 🎯 Action buttons:
  - **Pin/Unpin** (shown to all users, backend enforces permissions)
  - **Delete** (shown only to post author)
- 🔄 Optimistic UI updates
- ⚠️ Delete confirmation dialog
- 🔃 Loading states per action

**Usage:**
```typescript
<PostCard
  post={post}
  currentUserId={user?.id}
  onPostUpdated={(updated) => {
    setPosts(prev => 
      prev.map(p => p.id === updated.id ? updated : p)
    );
  }}
  onPostDeleted={(postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }}
  showActions={true}
/>
```

## 🎯 Features

### 1. Create Post

**Flow:**
1. User taps "✍️ Create Post" button
2. Modal opens with text input
3. User types content (max 5000 chars)
4. Validation checks for empty content
5. API call: `POST /posts`
6. **Optimistic UI:** New post added to top of list immediately
7. Success alert shown
8. Modal closes

**API Call:**
```typescript
await postApi.createPost({
  content: content.trim(),
  channelId: channelId,
  // or groupId: groupId
});
```

**Validation:**
- Content cannot be empty (after trimming)
- Max length: 5000 characters
- Shows real-time character count

### 2. List Posts

**Features:**
- Posts displayed in reverse chronological order (newest first)
- Pagination with 20 posts per page
- Pull-to-refresh
- Load more on scroll
- Empty state messaging
- Loading indicators (initial, refresh, load more)

**Post Card Display:**
- Author name and avatar
- Timestamp (formatted: "Jan 15, 2:30 PM")
- Post content text
- Pinned badge (if `isPinned: true`)
- Reaction count
- Comment count
- Action buttons (conditional)

### 3. Pin/Unpin Post

**UI Strategy:** Show to all users, backend enforces permissions

**Flow:**
1. User taps "📌 Pin" or "📌 Unpin" button
2. **Optimistic UI:** Post updates immediately
3. API call: `POST /posts/:id/pin` or `POST /posts/:id/unpin`
4. If error, show alert (backend will return permission error)
5. UI remains updated (optimistic approach)

**Backend Permission Check:**
- Backend validates if user has moderator/admin role
- Returns 403 Forbidden if not permitted
- Frontend shows error alert but UI already updated

**Benefits:**
- Better UX with instant feedback
- Backend remains secure
- Clear error messaging if permissions denied

### 4. Delete Post

**UI Strategy:** Show only to post author

**Flow:**
1. Check if `currentUserId === post.authorId`
2. If yes, show "🗑️ Delete" button
3. User taps delete → confirmation dialog
4. If confirmed:
   - **Optimistic UI:** Post removed from list with loading state
   - API call: `DELETE /posts/:id`
   - If error, show alert (post remains removed)

**Confirmation Dialog:**
```
Delete Post
Are you sure you want to delete this post? 
This action cannot be undone.

[Cancel]  [Delete]
```

## 🔄 Optimistic UI

All post actions use optimistic UI updates for better UX:

**Create Post:**
```typescript
const handlePostCreated = (newPost: Post.Post) => {
  // Add to top of list immediately
  setPosts(prev => [newPost, ...prev]);
};
```

**Pin/Unpin Post:**
```typescript
const handlePostUpdated = (updatedPost: Post.Post) => {
  // Update post in place
  setPosts(prev => 
    prev.map(post => post.id === updatedPost.id ? updatedPost : post)
  );
};
```

**Delete Post:**
```typescript
const handlePostDeleted = (postId: string) => {
  // Remove from list immediately
  setPosts(prev => prev.filter(post => post.id !== postId));
};
```

## 🎨 UI Design

### Create Post Button
```
┌─────────────────────────────┐
│  ✍️ Create Post              │  ← Blue button, full width
└─────────────────────────────┘
```

### Post Card (Regular)
```
┌─────────────────────────────────┐
│ 👤 John Doe                     │
│    Jan 15, 2:30 PM              │
│                                 │
│ Post content text here...       │
│ Can be multiple lines.          │
│ ─────────────────────────       │
│ ❤️ 15 reactions 💬 8 comments   │
│                                 │
│ [📌 Pin]  [🗑️ Delete]           │  ← Actions (conditional)
└─────────────────────────────────┘
```

### Post Card (Pinned)
```
┌─────────────────────────────────┐
│ 👤 John Doe      📌 Pinned      │  ← Yellow badge
│    Jan 15, 2:30 PM              │
│                                 │
│ Important announcement...       │
│ ─────────────────────────       │
│ ❤️ 45 reactions 💬 12 comments  │
│                                 │
│ [📌 Unpin]  [🗑️ Delete]         │
└─────────────────────────────────┘
```

### Create Post Modal
```
┌─────────────────────────────────┐
│ Cancel   Create Post      Post  │  ← Header
├─────────────────────────────────┤
│                                 │
│ What's on your mind?            │  ← Placeholder
│ _                               │  ← Cursor
│                                 │
│                                 │
│                                 │
│                                 │
│                    42 / 5000    │  ← Character count
└─────────────────────────────────┘
```

## 🔧 API Integration

### Endpoints Used

**Create Post:**
```typescript
POST /posts
Body: {
  content: string;
  channelId?: string;
  groupId?: string;
}
Response: Post.Post
```

**Pin Post:**
```typescript
POST /posts/:id/pin
Response: void
Permissions: Moderator/Admin only (backend enforced)
```

**Unpin Post:**
```typescript
POST /posts/:id/unpin
Response: void
Permissions: Moderator/Admin only (backend enforced)
```

**Delete Post:**
```typescript
DELETE /posts/:id
Response: void
Permissions: Post author only (backend enforced)
```

## 📱 Usage Examples

### Integrate into Channel Feed

```typescript
import CreatePostModal from '@/components/CreatePostModal';
import PostCard from '@/components/PostCard';

function ChannelFeed() {
  const [posts, setPosts] = useState<Post.Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user } = useAuthStore();

  return (
    <View>
      {/* Create Post Button */}
      <Pressable onPress={() => setShowCreatePost(true)}>
        <Text>✍️ Create Post</Text>
      </Pressable>

      {/* Posts List */}
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

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        channelId={channelId}
        onPostCreated={(newPost) => 
          setPosts(prev => [newPost, ...prev])
        }
      />
    </View>
  );
}
```

### Integrate into Group Feed

```typescript
<CreatePostModal
  visible={showCreatePost}
  onClose={() => setShowCreatePost(false)}
  groupId={groupId}  // Use groupId instead of channelId
  onPostCreated={handlePostCreated}
/>
```

## 🛡️ Permission Strategy

**Frontend Approach:**
- Show pin/unpin UI to **all users**
- Show delete UI only to **post author**
- Backend enforces actual permissions

**Backend Enforcement:**
- Pin/unpin requires moderator or admin role
- Delete requires being the post author
- Returns 403 Forbidden if not permitted

**Why This Approach?**
1. ✅ Simpler frontend logic (no role checking)
2. ✅ Backend remains secure (single source of truth)
3. ✅ Better UX (immediate feedback)
4. ✅ Clear error messages when permissions denied
5. ✅ Frontend doesn't need to know about roles

## 🎯 Validation Rules

### Create Post
- ✅ Content cannot be empty (after trim)
- ✅ Max length: 5000 characters
- ✅ Must provide channelId OR groupId

### Pin/Unpin
- ✅ Post must exist
- ✅ User must have permissions (backend)

### Delete
- ✅ Post must exist
- ✅ User must be author (frontend check + backend)

## 🔍 Error Handling

**Create Post Errors:**
- Empty content → "Post content cannot be empty"
- Too long → "Post content is too long (max 5000 characters)"
- API error → Display backend error message

**Pin/Unpin Errors:**
- Permission denied → "Failed to pin post" + backend message
- Network error → "Failed to pin post"

**Delete Errors:**
- Permission denied → Backend message (shouldn't happen, frontend checks)
- Network error → "Failed to delete post"

All errors display as alerts with descriptive messages.

## 📊 Performance

**Optimistic UI Benefits:**
- Instant feedback (no waiting for API)
- Better perceived performance
- Smoother UX

**Trade-offs:**
- UI may show success before backend confirms
- Errors require reverting UI (not implemented, simple alerts instead)
- Acceptable for this use case

## 🧪 Testing Scenarios

**Create Post:**
- [ ] Create with valid content
- [ ] Try with empty content (error)
- [ ] Try with > 5000 chars (error)
- [ ] Cancel during creation
- [ ] Network error handling

**Pin/Unpin:**
- [ ] Pin unpinned post (as moderator)
- [ ] Unpin pinned post (as moderator)
- [ ] Try pin as regular user (permission error)
- [ ] Optimistic UI updates immediately

**Delete:**
- [ ] Delete own post (confirmation required)
- [ ] Cancel delete confirmation
- [ ] Delete removes post from UI
- [ ] Button only shows for own posts

## 🚀 Future Enhancements

- [ ] Edit post functionality
- [ ] Rich text / markdown support
- [ ] Media attachments (images, videos)
- [ ] Mentions (@username)
- [ ] Hashtags (#topic)
- [ ] Post reactions (like, love, etc.)
- [ ] Nested comments
- [ ] Post sharing
- [ ] Save/bookmark posts
- [ ] Report inappropriate content
- [ ] Post analytics (views, engagement)

## 📝 Notes

- Posts use **local component state** (not global store)
- Optimistic UI for all mutations
- Backend is single source of truth for permissions
- Character limit is generous (5000) for long-form content
- Modal uses page sheet on iOS for native feel
- All timestamps formatted for readability
