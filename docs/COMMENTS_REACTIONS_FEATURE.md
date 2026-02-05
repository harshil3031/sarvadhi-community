# Comments & Reactions Feature

Complete implementation of comments and reactions with flat comments and one reaction per user.

## ✅ Implementation Summary

### Files Created
1. **`src/api/reaction.api.ts`** - Reaction API types and endpoints
2. **`components/ReactionBar.tsx`** (220 lines) - Reaction picker and display
3. **`components/CommentList.tsx`** (335 lines) - Comment list with add/delete
4. **Updated `components/PostCard.tsx`** - Integrated reactions and comments

### Features Implemented
✅ Add reaction to post (one per user)  
✅ Change reaction (updates existing)  
✅ Remove reaction  
✅ Visual reaction picker with 6 emojis  
✅ Add comment to post  
✅ List comments with pagination  
✅ Delete own comments  
✅ Flat comments only (no nesting)  
✅ Refresh counts after actions  
✅ Optimistic UI updates  

## 📦 Components

### ReactionBar

**Purpose:** Interactive reaction button with emoji picker

**Props:**
```typescript
interface ReactionBarProps {
  postId: string;                    // Post to react to
  currentReaction?: string | null;   // User's current reaction emoji
  reactionCount: number;             // Total reaction count
  onReactionChange?: () => void;     // Callback when reaction changes
}
```

**Features:**
- 🎯 One reaction per user (per requirements)
- 😊 6 emoji options: ❤️ 👍 😂 😮 😢 🔥
- 🔄 Tap to open picker
- ✨ Optimistic UI updates
- 🔁 Change reaction (replaces existing)
- ❌ Remove reaction (tap same emoji)
- 📊 Real-time count updates

**UI Flow:**
1. Shows current reaction or default ❤️
2. Tap button → Opens picker modal
3. Select emoji → Updates reaction
4. Select same emoji → Removes reaction
5. UI updates immediately

### CommentList

**Purpose:** Full-featured comment section with add, list, delete

**Props:**
```typescript
interface CommentListProps {
  postId: string;                           // Post to show comments for
  commentCount: number;                     // Initial comment count
  onCommentCountChange?: (newCount: number) => void;  // Count change callback
}
```

**Features:**
- ✍️ Text input for new comments
- 📝 Max 2000 characters
- 📋 Flat comment list (no nesting per requirements)
- ♾️ Pagination (20 comments per page)
- 🗑️ Delete own comments
- 👤 Author info with avatar
- ⏰ Formatted timestamps
- 🔄 Optimistic UI updates
- ⌨️ Keyboard-aware layout

**UI Components:**
- Input bar with avatar, text field, send button
- Comment cards with author, time, content, delete button
- Loading states
- Empty state messaging
- Pagination footer

### Updated PostCard

**New Features:**
- Reaction bar integrated
- Comment count button
- Opens comment modal
- Counts update after actions

## 🎯 Rules Implementation

### 1. Flat Comments Only ✅

**Implementation:**
- Comments are NOT nested/threaded
- Single-level comment list
- No "reply to comment" feature
- All comments at same hierarchy level

**Code:**
```typescript
// CommentList renders flat array
<FlatList
  data={comments}  // Flat array, no children
  renderItem={({ item }) => (
    <CommentCard comment={item} />  // No nesting
  )}
/>
```

### 2. One Reaction Per User ✅

**Implementation:**
- User can only have ONE reaction per post
- Changing reaction replaces previous
- Backend enforces this rule
- Frontend shows current reaction

**Code:**
```typescript
if (userReaction === emoji) {
  // Remove reaction (same emoji clicked)
  await reactionApi.removeReaction(postId);
} else {
  // Add or update reaction (replaces existing)
  await reactionApi.addReaction(postId, { emoji });
}
```

**Backend Behavior:**
```typescript
// Backend checks for existing reaction
const existingReaction = await PostReaction.findOne({
  where: { postId, userId }
});

if (existingReaction) {
  // Update emoji (doesn't create duplicate)
  existingReaction.emoji = emoji;
  await existingReaction.save();
} else {
  // Create new reaction
  await PostReaction.create({ postId, userId, emoji });
}
```

### 3. Refresh Counts After Action ✅

**Implementation:**
- Optimistic UI updates counts immediately
- Parent component callback refreshes if needed
- Counts stay in sync

**Reaction Count:**
```typescript
// ReactionBar updates count optimistically
const handleReactionPress = async (emoji: string) => {
  if (userReaction === emoji) {
    // Removing: decrement
    setCount(prev => Math.max(0, prev - 1));
  } else {
    // Adding: increment if new, keep same if changing
    setCount(prev => wasReacted ? prev : prev + 1);
  }
  
  // Call parent callback
  onReactionChange?.();
};
```

**Comment Count:**
```typescript
// CommentList updates count via callback
const handleAddComment = async () => {
  // Add comment...
  onCommentCountChange?.(commentCount + 1);
};

const handleDeleteComment = async () => {
  // Delete comment...
  onCommentCountChange?.(Math.max(0, commentCount - 1));
};
```

## 🎨 UI Design

### Reaction Bar (Closed)
```
┌──────────────┐
│ ❤️ 15        │  ← Current reaction + count
└──────────────┘
```

### Reaction Bar (Active/Reacted)
```
┌──────────────┐
│ 😂 15        │  ← Blue border/background
└──────────────┘
```

### Reaction Picker Modal
```
┌─────────────────────────────┐
│   React to this post        │
├─────────────────────────────┤
│                             │
│   ❤️   👍   😂             │
│                             │
│   😮   😢   🔥             │
│                             │
│  [Remove Reaction]          │  ← Only if already reacted
└─────────────────────────────┘
```

### Comment Input
```
┌─────────────────────────────┐
│ 👤 [Write a comment...] Send│
└─────────────────────────────┘
```

### Comment Card
```
┌─────────────────────────────┐
│ 👤 John Doe          🗑️     │  ← Delete (author only)
│    Jan 15, 2:30 PM          │
│                             │
│ This is my comment text...  │
└─────────────────────────────┘
```

### Post Card with Interactions
```
┌─────────────────────────────────┐
│ 👤 Jane Smith      📌 Pinned    │
│    Jan 15, 3:00 PM              │
│                                 │
│ Check out this amazing post!    │
│ ─────────────────────────       │
│ ❤️ 15   💬 8                    │  ← Interactions
│                                 │
│ [📌 Unpin]  [🗑️ Delete]         │  ← Actions
└─────────────────────────────────┘
```

## 🔌 API Integration

### Reaction Endpoints

**Add/Update Reaction:**
```typescript
POST /posts/:postId/reactions
Body: { emoji: string }
Response: Reaction
```

**Remove Reaction:**
```typescript
DELETE /posts/:postId/reactions
Response: void
```

**Get Reactions:**
```typescript
GET /posts/:postId/reactions
Response: Reaction[]
```

**Get Reaction Summary:**
```typescript
GET /posts/:postId/reactions/summary
Response: ReactionSummary[]  // { emoji, count, userReacted }
```

### Comment Endpoints

**Create Comment:**
```typescript
POST /posts/:postId/comments
Body: { content: string }
Response: Comment
```

**Get Comments:**
```typescript
GET /posts/:postId/comments?limit=20&offset=0
Response: Comment[]
```

**Delete Comment:**
```typescript
DELETE /comments/:id
Response: void
```

## 📱 Usage Examples

### Add Reaction to Post

```typescript
import ReactionBar from '@/components/ReactionBar';

<ReactionBar
  postId={post.id}
  currentReaction={null}  // or user's current reaction
  reactionCount={post.reactionCount}
  onReactionChange={() => {
    // Refresh post data if needed
    console.log('Reaction changed!');
  }}
/>
```

### Show Comments for Post

```typescript
import CommentList from '@/components/CommentList';

const [commentCount, setCommentCount] = useState(post.commentCount);

<CommentList
  postId={post.id}
  commentCount={commentCount}
  onCommentCountChange={(newCount) => setCommentCount(newCount)}
/>
```

### Full Integration in PostCard

```typescript
import PostCard from '@/components/PostCard';

<PostCard
  post={post}
  currentUserId={user?.id}
  onPostUpdated={(updated) => {
    // Handle post updates
  }}
  onPostDeleted={(id) => {
    // Handle post deletion
  }}
  showActions={true}
/>

// PostCard automatically includes:
// - ReactionBar
// - Comment count button
// - Comment modal (opens on tap)
```

## 🔄 Data Flow

### Reaction Flow
```
1. User taps reaction button
   ↓
2. Picker modal opens
   ↓
3. User selects emoji
   ↓
4. Optimistic UI update (count +/- 1)
   ↓
5. API call (add/remove/update)
   ↓
6. Callback to parent (onReactionChange)
   ↓
7. Parent can refresh post if needed
```

### Comment Flow
```
1. User types comment
   ↓
2. User taps Send
   ↓
3. Validation (not empty, max 2000 chars)
   ↓
4. API call (create comment)
   ↓
5. Add to comment list (top)
   ↓
6. Update count via callback
   ↓
7. Clear input field
```

## ⚡ Optimistic UI

All actions use optimistic updates for instant feedback:

**Add Reaction:**
```typescript
// Update UI first
setUserReaction(emoji);
setCount(prev => prev + 1);

// Then call API
await reactionApi.addReaction(postId, { emoji });

// On error, revert
if (error) {
  setUserReaction(previousReaction);
  setCount(previousCount);
}
```

**Add Comment:**
```typescript
// Call API
const response = await commentApi.createComment(postId, { content });

// Add to list immediately
setComments(prev => [response.data.data, ...prev]);

// Update count
onCommentCountChange(commentCount + 1);
```

**Remove Reaction:**
```typescript
// Update UI first
setUserReaction(null);
setCount(prev => Math.max(0, prev - 1));

// Then call API
await reactionApi.removeReaction(postId);
```

## 🎯 Validation Rules

### Reactions
- ✅ Must select valid emoji from picker
- ✅ One reaction per user (backend enforced)
- ✅ Can change reaction (replaces existing)
- ✅ Can remove reaction (tap same emoji)

### Comments
- ✅ Content cannot be empty (after trim)
- ✅ Max length: 2000 characters
- ✅ Must be authenticated
- ✅ Can only delete own comments

## 🧪 Testing Scenarios

**Reactions:**
- [ ] Add reaction (count increases)
- [ ] Change reaction (count stays same)
- [ ] Remove reaction (count decreases)
- [ ] Reaction persists across app restarts
- [ ] One reaction per user enforced
- [ ] All 6 emojis work

**Comments:**
- [ ] Add comment (appears at top)
- [ ] Delete own comment
- [ ] Cannot delete others' comments
- [ ] Empty comment rejected
- [ ] Long comment (2000 chars) accepted
- [ ] Too long comment (>2000) rejected
- [ ] Pagination loads more comments
- [ ] Comment count updates correctly

**Integration:**
- [ ] Reaction count updates in PostCard
- [ ] Comment count updates in PostCard
- [ ] Modal opens on comment button tap
- [ ] Modal closes properly
- [ ] Keyboard handling works
- [ ] Optimistic UI updates work
- [ ] Error recovery works

## 🔍 Error Handling

**Reaction Errors:**
```typescript
try {
  await reactionApi.addReaction(postId, { emoji });
} catch (error) {
  // Revert optimistic update
  setUserReaction(previousReaction);
  setCount(previousCount);
  Alert.alert('Error', 'Failed to update reaction');
}
```

**Comment Errors:**
```typescript
try {
  await commentApi.createComment(postId, { content });
} catch (error) {
  Alert.alert('Error', error.response?.data?.message || 'Failed to add comment');
}
```

## 📊 Performance

**Optimizations:**
- Optimistic UI for instant feedback
- Pagination (20 comments per page)
- Efficient FlatList rendering
- No nested comments (simpler rendering)
- Count updates via callbacks (no full refresh)

## 🚀 Future Enhancements

- [ ] Reaction summary (group by emoji)
- [ ] Show who reacted
- [ ] Edit comments
- [ ] Comment reactions
- [ ] Rich text comments
- [ ] Mention users in comments
- [ ] Comment notifications
- [ ] Sort comments (newest/oldest)
- [ ] More emoji options
- [ ] Custom reactions

## 📝 Notes

- **Flat comments only** - No threading/nesting per requirements
- **One reaction per user** - Backend enforces, frontend reflects
- **Counts refresh** - Optimistic UI + callbacks ensure sync
- Comments shown in reverse chronological (newest first)
- All modals use pageSheet presentation on iOS
- Keyboard-aware layouts for comment input
- Avatar shows first letter of user name
