# Groups Feature - Complete Documentation

## Overview
Full-featured Groups module with group list, group feed, create group, invite users, and leave group functionality. All creator-specific actions are only visible to group creators.

---

## Screens

### 1. Group List (`app/(tabs)/groups/index.tsx`)
**Route**: `/groups`

**Features**:
- Display list of user's groups
- Create new group button
- Pull-to-refresh
- Empty state with create button
- Optimistic UI updates

**Components**:
- `GroupCard`: Displays individual group with name, description, member count
- `CreateGroupModal`: Modal for creating new groups

**Actions**:
- **Create Group**: Opens modal, adds new group to top of list
- **Leave Group**: Shows confirmation, removes group from list (non-creators only)
- **Delete Group**: Shows confirmation, removes group from list (creators only)
- **Navigate to Group**: Tap any group card to view feed

### 2. Group Feed (`app/(tabs)/groups/[id].tsx`)
**Route**: `/groups/:id`

**Features**:
- Display group details (name, description, member count)
- List all group posts
- Create post button
- Invite users button (creator only)
- Leave group button (non-creators only)
- Pull-to-refresh
- Infinite scroll pagination
- Empty state

**Components**:
- `PostCard`: Displays individual post with reactions and comments
- `CreatePostModal`: Modal for creating posts in group
- `InviteUserModal`: Modal for inviting users (creator only)

**Actions**:
- **Create Post**: Opens modal, adds post to top of feed
- **Invite Users**: Opens modal with user ID input (creator only)
- **Leave Group**: Shows confirmation, navigates back
- **View Post**: Tap to see full post with reactions/comments

---

## Components

### CreateGroupModal (`components/CreateGroupModal.tsx`)
Modal for creating new groups.

**Props**:
```typescript
interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: (group: Group.Group) => void;
}
```

**Features**:
- Name input (required, max 100 chars)
- Description input (optional, max 500 chars)
- Character counters
- Validation with error banner
- Loading state with spinner
- Keyboard-aware layout

**Usage**:
```tsx
<CreateGroupModal
  visible={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onGroupCreated={(newGroup) => setGroups([newGroup, ...groups])}
/>
```

### InviteUserModal (`components/InviteUserModal.tsx`)
Modal for inviting users to group (creator only).

**Props**:
```typescript
interface InviteUserModalProps {
  visible: boolean;
  groupId: string;
  onClose: () => void;
  onUserInvited?: () => void;
}
```

**Features**:
- User ID input field
- Validation with error banner
- Success alert on invite
- Loading state with spinner
- Auto-close on success

**Usage**:
```tsx
{isCreator && (
  <InviteUserModal
    visible={showInviteUser}
    groupId={groupId}
    onClose={() => setShowInviteUser(false)}
    onUserInvited={fetchGroup} // Refresh member count
  />
)}
```

**Note**: Currently uses User ID input. Can be enhanced with user search when user search API is available.

### GroupCard (`components/GroupCard.tsx`)
Card component displaying group in list.

**Props**:
```typescript
interface GroupCardProps {
  group: Group.Group;
  onLeave?: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
}
```

**Features**:
- Group icon with people symbol
- Name, description, member count
- Creator badge (for group creators)
- Leave button (non-creators)
- Delete button (creators only)
- Confirmation alerts for destructive actions
- Loading states
- Tap to navigate to group feed

**Conditional Rendering**:
```tsx
// Creator sees delete button
{isCreator && (
  <TouchableOpacity onPress={handleDelete}>
    <Text>Delete</Text>
  </TouchableOpacity>
)}

// Non-creators see leave button
{!isCreator && (
  <TouchableOpacity onPress={handleLeave}>
    <Text>Leave</Text>
  </TouchableOpacity>
)}
```

---

## API Integration

### Group API (`src/api/group.api.ts`)

**Endpoints Used**:

1. **Get My Groups**
   ```typescript
   groupApi.getMyGroups()
   // GET /groups/my
   // Returns: Group[]
   ```

2. **Get Group Details**
   ```typescript
   groupApi.getGroup(id)
   // GET /groups/:id
   // Returns: Group
   ```

3. **Create Group**
   ```typescript
   groupApi.createGroup({ name, description })
   // POST /groups
   // Body: { name: string, description?: string }
   // Returns: Group
   ```

4. **Invite User**
   ```typescript
   groupApi.inviteUser(groupId, userId)
   // POST /groups/:id/invite
   // Body: { userId: string }
   // Returns: void
   ```

5. **Leave Group**
   ```typescript
   groupApi.leaveGroup(id)
   // POST /groups/:id/leave
   // Returns: void
   ```

6. **Delete Group** (creator only)
   ```typescript
   groupApi.deleteGroup(id)
   // DELETE /groups/:id
   // Returns: void
   ```

### Post API (`src/api/posts.ts`)

**Endpoint Used**:
```typescript
postApi.getPostsByGroup(groupId, limit, offset)
// GET /posts?groupId=:id&limit=20&offset=0
// Returns: Post[]
```

---

## Rules Implementation

### Rule: Creator Actions Only Visible to Creator

**Implementation**:
```typescript
const { user } = useAuthStore();
const isCreator = user?.id === group.creatorId;

// In GroupCard
{isCreator ? (
  <TouchableOpacity onPress={handleDelete}>
    <Ionicons name="trash-outline" />
    <Text>Delete</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity onPress={handleLeave}>
    <Ionicons name="exit-outline" />
    <Text>Leave</Text>
  </TouchableOpacity>
)}

// In Group Feed
{isCreator && (
  <TouchableOpacity onPress={() => setShowInviteUser(true)}>
    <Ionicons name="person-add" />
    <Text>Invite</Text>
  </TouchableOpacity>
)}
```

**Creator-Specific Actions**:
- ✅ Delete Group (GroupCard)
- ✅ Invite Users (Group Feed)
- ✅ Creator badge displayed (GroupCard)

**Non-Creator Actions**:
- ✅ Leave Group (GroupCard and Group Feed)

**Backend Enforcement**: Backend enforces permissions on DELETE /groups/:id and POST /groups/:id/invite endpoints. Frontend conditionally renders UI based on user role.

---

## Data Flow

### Creating a Group
1. User clicks "Create Group" button
2. `CreateGroupModal` opens with name/description inputs
3. User fills form and clicks "Create"
4. Validation runs (name required, length limits)
5. API call: `groupApi.createGroup({ name, description })`
6. On success:
   - New group returned from backend
   - `onGroupCreated` callback fires
   - New group added to top of list
   - Modal closes
7. On error: Error banner displays

### Inviting Users (Creator Only)
1. Creator clicks "Invite" button in group feed
2. `InviteUserModal` opens with user ID input
3. Creator enters user ID and clicks "Invite"
4. API call: `groupApi.inviteUser(groupId, userId)`
5. On success:
   - Success alert displays
   - `onUserInvited` callback fires
   - Group details refresh (member count updates)
   - Modal closes
6. On error: Error banner displays

### Leaving a Group
1. Non-creator clicks "Leave" button
2. Confirmation alert: "Are you sure you want to leave?"
3. User confirms
4. API call: `groupApi.leaveGroup(groupId)`
5. On success:
   - `onLeave` callback fires
   - Group removed from list (if in list view)
   - Navigate back (if in feed view)
6. On error: Error alert displays

### Deleting a Group (Creator Only)
1. Creator clicks "Delete" button
2. Confirmation alert: "Are you sure? This cannot be undone."
3. Creator confirms
4. API call: `groupApi.deleteGroup(groupId)`
5. On success:
   - `onDelete` callback fires
   - Group removed from list
6. On error: Error alert displays

### Viewing Group Feed
1. User taps group card
2. Navigation: `router.push(/groups/${group.id})`
3. Group feed screen loads:
   - Fetch group details: `groupApi.getGroup(id)`
   - Fetch posts: `postApi.getPostsByGroup(id, 20, 0)`
4. Display group header with actions
5. Display posts in scrollable list
6. Infinite scroll: On scroll to bottom, fetch more posts with offset

---

## Optimistic UI Patterns

### Create Group
```typescript
const handleGroupCreated = (newGroup: Group.Group) => {
  // Add to top immediately
  setGroups((prev) => [newGroup, ...prev]);
};
```

### Leave/Delete Group
```typescript
const handleGroupLeave = (groupId: string) => {
  // Remove immediately
  setGroups((prev) => prev.filter((g) => g.id !== groupId));
};
```

### Create Post in Group
```typescript
const handlePostCreated = (newPost: Post.Post) => {
  // Add to top immediately
  setPosts((prev) => [newPost, ...prev]);
};
```

**No Reversion**: Since backend enforces permissions and returns immediate success, we don't implement error reversion. All failures show error alerts but don't corrupt state.

---

## Styling

### Design System
- **Primary Color**: `#3b82f6` (blue)
- **Background**: `#f9fafb` (light gray)
- **Cards**: `#fff` (white) with shadows
- **Border Radius**: 8-12px
- **Spacing**: 8-16-24px increments

### Component Styles

**GroupCard**:
- Horizontal layout with icon + content
- 56x56 icon with blue background
- Creator badge: gold/amber color
- Shadow elevation for depth
- Action buttons: Light gray (leave) or light red (delete)

**Group Header** (in feed):
- 64x64 icon
- Large group name (24px)
- Stats with person icon
- Invite button: Blue outline
- Leave button: Gray background
- Create Post button: Full-width blue

**Empty States**:
- Centered icon (64px)
- Title + description
- Call-to-action button

---

## Error Handling

### Network Errors
```typescript
try {
  const response = await groupApi.createGroup(data);
  // Success handling
} catch (err: any) {
  const errorMsg = err.response?.data?.message || err.message || 'Failed to create group';
  setError(errorMsg);
}
```

### Validation Errors
```typescript
if (!name.trim()) {
  setError('Group name is required');
  return;
}

if (name.length > 100) {
  setError('Group name must be 100 characters or less');
  return;
}
```

### Permission Errors
Backend returns 403 for unauthorized actions. Frontend shows error alert:
```typescript
Alert.alert('Error', errorMsg);
```

---

## State Management

### Local State (No Global Store)
All group state is local to screens:
- `groups` array in list screen
- `group` object in feed screen
- `posts` array in feed screen
- Modal visibility toggles

**Rationale**: Groups are contextual to screens. Using `useFocusEffect` to refresh on screen focus ensures data is always fresh without complex global state management.

### Refresh Strategy
```typescript
useFocusEffect(
  useCallback(() => {
    fetchGroups();
  }, [])
);
```

Refreshes data when:
- Screen mounts
- Screen comes into focus (after navigating back)
- User pulls to refresh

---

## Navigation

### Routes
```
/groups                    → Group list
/groups/[id]              → Group feed
```

### Navigation Examples
```typescript
// Navigate to group feed
router.push(`/(tabs)/groups/${group.id}` as any);

// Navigate back after leaving
router.back();
```

---

## Testing Checklist

### Group List Screen
- [ ] Empty state displays when no groups
- [ ] Groups load and display correctly
- [ ] Create button opens modal
- [ ] Pull-to-refresh works
- [ ] Tapping group navigates to feed
- [ ] Leave button works (non-creators)
- [ ] Delete button works (creators)
- [ ] Creator badge shows for created groups

### Group Feed Screen
- [ ] Group details load correctly
- [ ] Posts load and display
- [ ] Empty state when no posts
- [ ] Create post button works
- [ ] Invite button visible only to creator
- [ ] Leave button visible only to non-creators
- [ ] Pull-to-refresh works
- [ ] Infinite scroll loads more posts

### CreateGroupModal
- [ ] Opens and closes correctly
- [ ] Name required validation
- [ ] Length limit validation (100/500)
- [ ] Character counters update
- [ ] Error banner displays/dismisses
- [ ] Loading state shows spinner
- [ ] Success adds group to list

### InviteUserModal
- [ ] Opens and closes correctly
- [ ] User ID required validation
- [ ] Success shows alert
- [ ] Error banner displays
- [ ] Member count updates after invite

### GroupCard
- [ ] Displays all group info
- [ ] Creator badge shows correctly
- [ ] Leave button for non-creators
- [ ] Delete button for creators
- [ ] Confirmation alerts work
- [ ] Navigation works on tap

---

## Future Enhancements

### User Search for Invites
Replace User ID input with searchable user list:
```typescript
// When user search API available
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

const handleSearch = async (query: string) => {
  const results = await userApi.searchUsers(query);
  setSearchResults(results);
};

<FlatList
  data={searchResults}
  renderItem={({ item }) => (
    <UserRow user={item} onInvite={() => handleInvite(item.id)} />
  )}
/>
```

### Group Members List
Add screen to view/manage members:
```typescript
// GET /groups/:id/members
const members = await groupApi.getGroupMembers(groupId);

// Display members with roles
members.map(member => (
  <MemberCard
    member={member}
    canRemove={isCreator && member.role !== 'creator'}
  />
));
```

### Group Settings
Add settings screen for creators:
```typescript
// Update group name/description
await groupApi.updateGroup(groupId, { name, description });

// Assign admin roles
await groupApi.assignRole(groupId, userId, 'admin');
```

### Group Categories/Tags
Add categorization:
```typescript
interface Group {
  // ... existing fields
  category?: string;
  tags?: string[];
}
```

---

## Summary

**What We Built**:
- ✅ Group list screen with create/leave/delete
- ✅ Group feed screen with posts
- ✅ Create group modal
- ✅ Invite user modal (creator only)
- ✅ Group card component
- ✅ Creator-specific action visibility
- ✅ Optimistic UI updates
- ✅ Pull-to-refresh
- ✅ Infinite scroll pagination
- ✅ Error handling with alerts
- ✅ Confirmation dialogs for destructive actions

**Key Features**:
- Creator badge and role-based UI
- Seamless navigation between list and feed
- Post creation within groups
- User invitations
- Leave/delete with confirmations

**Code Quality**:
- TypeScript strict typing
- Modular component architecture
- Consistent error handling
- Responsive layouts
- Loading and empty states
