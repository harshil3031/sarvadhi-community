# Notifications Quick Reference

## Overview
The Notifications feature displays a list of backend-generated notifications to users. The frontend handles display and marking notifications as read. The backend is responsible for creating notifications.

## API Endpoints

All endpoints require authentication via JWT token.

### Get Notifications
```typescript
notificationApi.getNotifications(limit = 50, offset = 0)
// Returns: ApiResponse<Notification.Notification[]>
```

### Get Unread Count
```typescript
notificationApi.getUnreadCount()
// Returns: ApiResponse<{ count: number }>
```

### Mark Single Notification as Read
```typescript
notificationApi.markAsRead(notificationId: string)
// Returns: ApiResponse<void>
```

### Mark All Notifications as Read
```typescript
notificationApi.markAllAsRead()
// Returns: ApiResponse<void>
```

### Delete Notification
```typescript
notificationApi.deleteNotification(notificationId: string)
// Returns: ApiResponse<void>
```

### Delete All Notifications
```typescript
notificationApi.deleteAllNotifications()
// Returns: ApiResponse<void>
```

### Get Notification Preferences
```typescript
notificationApi.getPreferences()
// Returns: ApiResponse<Notification.NotificationPreferences>
```

### Update Notification Preferences
```typescript
notificationApi.updatePreferences(data: Partial<Notification.NotificationPreferences>)
// Returns: ApiResponse<Notification.NotificationPreferences>
```

## Data Types

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'reaction' | 'comment' | 'message' | 'channel_invite' | 'group_invite';
  title: string;
  message: string;
  data?: Record<string, any>;  // Additional data related to the notification
  isRead: boolean;
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

### Notification Types & Icons
| Type | Icon | Example |
|------|------|---------|
| mention | @icon | User mentioned you in a post |
| reaction | heart | User reacted to your post |
| comment | chat bubble | User commented on your post |
| message | mail | New direct message |
| channel_invite | chat bubbles | Invited to a channel |
| group_invite | people | Invited to a group |

## Components

### NotificationCard

Displays individual notification with automatic mark-as-read functionality.

**Location**: `components/NotificationCard.tsx`

**Props**:
```typescript
interface NotificationCardProps {
  notification: Notification.Notification;
  onMarkAsRead: (id: string) => Promise<void>;
}
```

**Features**:
- Type-specific icon display
- Read/unread visual distinction (background color, bold text)
- Unread indicator dot (blue dot on right side)
- Relative timestamp ("5m ago", "yesterday", etc.)
- Loading state during mark-as-read operation
- Tap to mark as read (if unread)

**Usage**:
```typescript
<NotificationCard
  notification={notification}
  onMarkAsRead={handleMarkAsRead}
/>
```

## Screens

### Notifications List Screen

**Location**: `app/(tabs)/notifications/index.tsx`

**Features**:
- FlatList of all notifications
- Pull-to-refresh functionality
- Unread count badge in header
- "Mark all as read" button (only visible if unread count > 0)
- "Delete All" button in footer
- Empty state with icon and message
- Optimistic UI updates for mark-as-read and delete operations

**State Management**:
```typescript
const [notifications, setNotifications] = useState<Notification.Notification[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isRefreshing, setIsRefreshing] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);
```

**Key Functions**:
- `fetchNotifications()` - Load all notifications and calculate unread count
- `handleMarkAsRead()` - Mark single notification as read with optimistic update
- `handleMarkAllAsRead()` - Mark all notifications as read with confirmation
- `handleDeleteNotification()` - Delete individual notification with optimistic update
- `handleDeleteAllNotifications()` - Delete all notifications with confirmation alert

## Usage Patterns

### Fetch and Display Notifications
```typescript
const [notifications, setNotifications] = useState<Notification.Notification[]>([]);
const [isLoading, setIsLoading] = useState(true);

useFocusEffect(
  useCallback(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationApi.getNotifications(50, 0);
        if (response.data.success && response.data.data) {
          setNotifications(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [])
);
```

### Mark as Read with Optimistic Update
```typescript
const handleMarkAsRead = async (notificationId: string) => {
  // Optimistic update - update UI immediately
  setNotifications((prev) =>
    prev.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    )
  );

  try {
    // Confirm with backend
    await notificationApi.markAsRead(notificationId);
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    // Revert on error
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: false }
          : notification
      )
    );
    throw err;
  }
};
```

### Delete Notification with Optimistic Update
```typescript
const handleDeleteNotification = async (notificationId: string) => {
  // Optimistic update
  const previousNotifications = notifications;
  setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

  try {
    await notificationApi.deleteNotification(notificationId);
  } catch (err) {
    console.error('Failed to delete notification:', err);
    // Revert on error
    setNotifications(previousNotifications);
    throw err;
  }
};
```

### Track Unread Count
```typescript
const [unreadCount, setUnreadCount] = useState(0);

// When fetching notifications
const unread = response.data.data.filter((n) => !n.isRead).length;
setUnreadCount(unread);

// When marking as read
setUnreadCount((prev) => Math.max(0, prev - 1));

// When deleting unread notification
if (deletedNotification && !deletedNotification.isRead) {
  setUnreadCount((prev) => Math.max(0, prev - 1));
}
```

## Testing

### Test Mark Notification as Read
```typescript
describe('Notification.markAsRead', () => {
  it('should mark notification as read', async () => {
    const notificationId = 'test-notification-123';
    const response = await notificationApi.markAsRead(notificationId);
    expect(response.data.success).toBe(true);
  });

  it('should update local state on success', async () => {
    const notification: Notification.Notification = {
      id: '1',
      userId: 'user-123',
      type: 'mention',
      title: 'You were mentioned',
      message: 'User mentioned you in #general',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { result } = renderHook(() => useState<Notification.Notification[]>([notification]));
    const [notifications, setNotifications] = result.current;

    await act(async () => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    });

    expect(notifications[0].isRead).toBe(true);
  });
});
```

### Test Delete All Notifications
```typescript
describe('Delete all notifications', () => {
  it('should show confirmation alert', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    // Trigger delete all
    
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete All Notifications',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('should clear notifications list on confirm', async () => {
    const { result } = renderHook(() => useState<Notification.Notification[]>([...]));
    
    // Confirm delete
    
    expect(result.current[0].length).toBe(0);
  });
});
```

## Integration Points

### Tab Navigation
The Notifications screen is registered as a tab in `app/(tabs)/_layout.tsx`:
```typescript
<Tabs.Screen
  name="notifications"
  options={{
    title: "Notifications",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="notifications-outline" size={size} color={color} />
    ),
  }}
/>
```

### Color Scheme Support
Uses `useColorScheme()` hook for light/dark theme support:
```typescript
const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? 'light'];
```

## Backend Integration Notes

1. **Notification Creation**: Backend must create notifications when:
   - User is mentioned in post/comment
   - User's post/comment receives reaction
   - User's post receives comment
   - Direct message received
   - User is invited to channel/group

2. **Required Fields**: Ensure notifications include:
   - `type` - one of the supported types
   - `title` - short notification title (max 100 chars)
   - `message` - detailed message content
   - `userId` - recipient user ID
   - `data` - optional metadata for navigation

3. **Soft Delete**: Recommended to use soft delete (flag instead of removing) for audit trail

## Performance Considerations

1. **Pagination**: Use `limit` and `offset` parameters for large notification lists
2. **Refresh Rate**: Avoid excessive polling; use WebSocket for real-time updates if backend supports
3. **Optimistic UI**: All mutation operations (mark read, delete) use optimistic updates with error reversion
4. **Memory**: Clear old notifications periodically on backend (auto-archive after 30 days)

## Common Issues

| Issue | Solution |
|-------|----------|
| Mark as read not working | Verify auth token is valid and notification ID exists |
| Optimistic update shows wrong state | Check that notification ID matches exactly |
| Empty state showing incorrectly | Ensure `isLoading` is set to false after fetch |
| Styling doesn't match theme | Verify `useColorScheme()` hook is returning correct value |

## File Structure
```
components/
  NotificationCard.tsx          - Individual notification card component
app/(tabs)/
  notifications/
    index.tsx                   - Notifications list screen
  _layout.tsx                   - Updated with notifications tab
src/api/
  notification.api.ts           - Existing API endpoints (already created)
```

## Key Features Summary

✅ Display backend-generated notifications  
✅ Mark individual notification as read  
✅ Mark all notifications as read  
✅ Delete individual notifications  
✅ Delete all notifications  
✅ Unread count badge  
✅ Type-specific icons  
✅ Relative timestamps  
✅ Optimistic UI updates  
✅ Pull-to-refresh  
✅ Empty state handling  
✅ Dark mode support  
✅ Error handling with alerts  
✅ Loading states  
