# Groups Feature - Quick Reference

## Quick Start

### Display Group List
```tsx
// app/(tabs)/groups/index.tsx
import { groupApi } from '@/api/group.api';
import GroupCard from '@/components/GroupCard';
import CreateGroupModal from '@/components/CreateGroupModal';

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const response = await groupApi.getMyGroups();
      setGroups(response.data.data);
    }, [])
  );

  return (
    <View>
      <FlatList
        data={groups}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onLeave={(id) => setGroups(groups.filter(g => g.id !== id))}
            onDelete={(id) => setGroups(groups.filter(g => g.id !== id))}
          />
        )}
      />
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={(g) => setGroups([g, ...groups])}
      />
    </View>
  );
}
```

### Display Group Feed
```tsx
// app/(tabs)/groups/[id].tsx
import { groupApi } from '@/api/group.api';
import { postApi } from '@/api/posts';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const gResponse = await groupApi.getGroup(id);
      setGroup(gResponse.data.data);
      
      const pResponse = await postApi.getPostsByGroup(id, 20, 0);
      setPosts(pResponse.data.data);
    }, [id])
  );

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View>
          <Text>{group?.name}</Text>
          <TouchableOpacity onPress={() => setShowCreatePost(true)}>
            <Text>Create Post</Text>
          </TouchableOpacity>
          {isCreator && (
            <TouchableOpacity onPress={() => setShowInviteUser(true)}>
              <Text>Invite Users</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
    />
  );
}
```

---

## Component Props

### CreateGroupModal
```typescript
<CreateGroupModal
  visible={boolean}              // Show/hide modal
  onClose={() => {}}             // Called when modal closes
  onGroupCreated={(group) => {}} // Called with new group object
/>
```

### InviteUserModal
```typescript
<InviteUserModal
  visible={boolean}           // Show/hide modal
  groupId={string}            // Group ID for invite
  onClose={() => {}}          // Called when modal closes
  onUserInvited={() => {}}    // Called after successful invite
/>
```

### GroupCard
```typescript
<GroupCard
  group={Group.Group}        // Group object
  onLeave={(id) => {}}       // Called when user leaves
  onDelete={(id) => {}}      // Called when group deleted
/>
```

---

## API Methods

### Get Groups
```typescript
// Get current user's groups
const response = await groupApi.getMyGroups();
const groups = response.data.data; // Group[]
```

### Get Group Details
```typescript
const response = await groupApi.getGroup(groupId);
const group = response.data.data; // Group
```

### Create Group
```typescript
const response = await groupApi.createGroup({
  name: 'Group Name',           // Required, max 100 chars
  description: 'Description'     // Optional, max 500 chars
});
const newGroup = response.data.data; // Group
```

### Invite User
```typescript
const response = await groupApi.inviteUser(groupId, userId);
// Returns: void (check response.data.success)
```

### Leave Group
```typescript
const response = await groupApi.leaveGroup(groupId);
// Returns: void (check response.data.success)
```

### Delete Group (Creator Only)
```typescript
const response = await groupApi.deleteGroup(groupId);
// Returns: void (check response.data.success)
```

### Get Group Posts
```typescript
const response = await postApi.getPostsByGroup(
  groupId,    // Group ID
  limit = 20, // Posts per page
  offset = 0  // Pagination offset
);
const posts = response.data.data; // Post[]
```

---

## Creator Actions Pattern

### Check If User Is Creator
```typescript
import { useAuthStore } from '@/store';

const { user } = useAuthStore();
const isCreator = user?.id === group.creatorId;
```

### Show Creator-Only Button
```typescript
{isCreator ? (
  // Creator sees delete button
  <TouchableOpacity onPress={handleDelete}>
    <Ionicons name="trash-outline" />
  </TouchableOpacity>
) : (
  // Non-creators see leave button
  <TouchableOpacity onPress={handleLeave}>
    <Ionicons name="exit-outline" />
  </TouchableOpacity>
)}
```

### Show Invite Button (Creator Only)
```typescript
{isCreator && (
  <TouchableOpacity onPress={() => setShowInviteUser(true)}>
    <Ionicons name="person-add" />
  </TouchableOpacity>
)}
```

---

## Common Patterns

### Refresh Data on Screen Focus
```typescript
useFocusEffect(
  useCallback(() => {
    fetchGroups();
  }, [])
);
```

### Add Item to List (Optimistic)
```typescript
const handleGroupCreated = (newGroup) => {
  setGroups(prev => [newGroup, ...prev]);
};
```

### Remove Item from List
```typescript
const handleGroupLeave = (groupId) => {
  setGroups(prev => prev.filter(g => g.id !== groupId));
};
```

### Confirmation Alert
```typescript
Alert.alert(
  'Leave Group',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Leave',
      style: 'destructive',
      onPress: async () => {
        await groupApi.leaveGroup(groupId);
        // Update UI
      }
    }
  ]
);
```

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

{isLoading ? (
  <ActivityIndicator size="large" color="#3b82f6" />
) : (
  <FlatList data={groups} />
)}
```

### Error Handling
```typescript
try {
  const response = await groupApi.createGroup(data);
  if (response.data.success) {
    // Success
    onGroupCreated?.(response.data.data);
  }
} catch (err) {
  const errorMsg = err.response?.data?.message || err.message;
  setError(errorMsg);
}
```

---

## File Structure

```
components/
├── CreateGroupModal.tsx      (Modal for creating groups)
├── InviteUserModal.tsx       (Modal for inviting users)
└── GroupCard.tsx             (Card component for group list)

app/(tabs)/groups/
├── index.tsx                 (Group list screen)
└── [id].tsx                  (Group feed screen)

src/api/
└── group.api.ts              (Group API client)
```

---

## Rules Enforced

### ✅ Creator Actions Only Visible to Creator
- Delete button only shows for creators
- Invite button only shows for creators
- Creator badge displays on group cards
- Leave button only shows for non-creators
- Backend enforces permissions on endpoints

### ✅ Post Creation in Groups
- Create post in group feed
- Posts belong to groupId
- Same post API used for channels and groups

### ✅ User Invitations
- Creator can invite users by ID
- Backend adds user to group
- Member count updates

### ✅ Leave Group
- Non-creators can leave
- Creators can only delete (full removal)
- Confirmation required

---

## Testing Examples

### Create & List Group
```typescript
// 1. Create group
const createResponse = await groupApi.createGroup({
  name: 'Test Group',
  description: 'Test description'
});
const groupId = createResponse.data.data.id;

// 2. Get my groups
const listResponse = await groupApi.getMyGroups();
const hasGroup = listResponse.data.data.some(g => g.id === groupId);
assert(hasGroup); // ✓
```

### Invite User & Check
```typescript
// 1. Invite user
await groupApi.inviteUser(groupId, userId);

// 2. Get group details
const response = await groupApi.getGroup(groupId);
const memberCount = response.data.data.memberCount;
assert(memberCount > 0); // ✓
```

### Create Post in Group
```typescript
// 1. Create post
const postResponse = await postApi.createPost({
  content: 'Group post content',
  groupId: groupId
});

// 2. Get group posts
const feedResponse = await postApi.getPostsByGroup(groupId);
const hasPost = feedResponse.data.data.some(
  p => p.id === postResponse.data.data.id
);
assert(hasPost); // ✓
```

---

## Summary

**Files Created**:
- `components/CreateGroupModal.tsx` - 190 lines
- `components/InviteUserModal.tsx` - 165 lines
- `components/GroupCard.tsx` - 235 lines
- `app/(tabs)/groups/index.tsx` - 195 lines
- `app/(tabs)/groups/[id].tsx` - 330 lines

**Total**: ~1115 lines of implementation

**Key Features**:
✅ Create groups with name/description
✅ Invite users to groups
✅ Leave groups (non-creators)
✅ Delete groups (creators only)
✅ Create posts in groups
✅ View group posts with pagination
✅ Creator-specific actions
✅ Optimistic UI updates
✅ Error handling with alerts
