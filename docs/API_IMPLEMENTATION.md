# API Layer - Complete Implementation

## Overview

The API layer provides a centralized, type-safe interface for all backend communication. Every endpoint is mapped through dedicated API modules, with automatic JWT token attachment and centralized error handling.

---

## Files Structure

```
src/api/
├── client.ts              # Axios instance with interceptors
├── auth.ts                # Authentication endpoints
├── channels.ts            # Channel management endpoints
├── group.api.ts           # Group management endpoints
├── posts.ts               # Post operations endpoints
├── comment.api.ts         # Comment operations endpoints
├── dm.api.ts              # Direct messages endpoints
├── notification.api.ts    # Notification endpoints
├── errors.ts              # Error handling & types
├── index.ts               # Central export point
└── README.md              # Usage guide
```

---

## Key Features

### ✅ 1. Automatic JWT Token Attachment
All requests automatically include the JWT token from AsyncStorage:

```typescript
// No manual token handling needed!
const response = await channelApi.getPublicChannels();
// Token is attached via request interceptor
```

### ✅ 2. Environment-Based Configuration
Base URL automatically set from environment:

- **Development**: `http://localhost:3000/api` (or device IP)
- **Production**: `https://api.sarvadhi.com/api`

### ✅ 3. Centralized Error Handling
All errors caught and transformed to `ApiErrorResponse`:

```typescript
interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
}
```

### ✅ 4. HTTP Status Mapping
Automatic user-friendly error messages for each status code.

### ✅ 5. Type Safety
Full TypeScript support with namespaced types:

```typescript
// Type-safe requests
const response = await authApi.login({
  email: 'user@example.com',
  password: 'password'
});

// Type-safe response
const user: Auth.User = response.data.data?.user;
```

---

## API Modules

### Auth (`auth.ts`)
```typescript
authApi.register(data)
authApi.login(data)
authApi.loginWithGoogle(data)
authApi.getCurrentUser()
authApi.refreshToken()
authApi.logout()
```

### Channels (`channels.ts`)
```typescript
channelApi.getPublicChannels()
channelApi.getChannel(id)
channelApi.createChannel(data)
channelApi.updateChannel(id, data)
channelApi.deleteChannel(id)
channelApi.joinChannel(id)
channelApi.leaveChannel(id)
channelApi.requestJoinPrivate(id)
channelApi.approveJoinRequest(channelId, userId)
channelApi.rejectJoinRequest(channelId, userId)
channelApi.inviteUser(channelId, userId)
channelApi.getChannelMembers(id)
channelApi.removeMember(channelId, userId)
```

### Groups (`group.api.ts`)
```typescript
groupApi.getMyGroups()
groupApi.getGroup(id)
groupApi.createGroup(data)
groupApi.updateGroup(id, data)
groupApi.deleteGroup(id)
groupApi.inviteUser(groupId, userId)
groupApi.leaveGroup(id)
groupApi.removeUser(groupId, userId)
groupApi.getGroupMembers(id)
```

### Posts (`posts.ts`)
```typescript
postApi.createPost(data)
postApi.getPostsByChannel(channelId, limit, offset)
postApi.getPostsByGroup(groupId, limit, offset)
postApi.getPost(id)
postApi.updatePost(id, data)
postApi.deletePost(id)
postApi.pinPost(id)
postApi.unpinPost(id)
```

### Comments (`comment.api.ts`)
```typescript
commentApi.createComment(postId, data)
commentApi.getComments(postId, limit, offset)
commentApi.getComment(id)
commentApi.updateComment(id, data)
commentApi.deleteComment(id)
```

### Direct Messages (`dm.api.ts`)
```typescript
dmApi.getConversations(limit, offset)
dmApi.getConversationMessages(conversationId, limit, offset)
dmApi.sendMessage(data)
dmApi.markAsRead(conversationId)
dmApi.getConversation(conversationId)
dmApi.startConversation(userId)
```

### Notifications (`notification.api.ts`)
```typescript
notificationApi.getNotifications(limit, offset)
notificationApi.getUnreadCount()
notificationApi.markAsRead(notificationId)
notificationApi.markAllAsRead()
notificationApi.deleteNotification(notificationId)
notificationApi.deleteAllNotifications()
notificationApi.getPreferences()
notificationApi.updatePreferences(data)
```

---

## Usage Pattern

### ✅ Correct: Via Zustand Store

```typescript
import { useChannelStore } from '@/store/channel.store';

export function ChannelsList() {
  const { channels, fetchChannels, isLoading } = useChannelStore();

  useEffect(() => {
    fetchChannels();
  }, []);

  // Use channels...
}
```

### ✅ Correct: In Zustand Store

```typescript
import { create } from 'zustand';
import { channelApi } from '@/api';

export const useChannelStore = create((set) => ({
  fetchChannels: async () => {
    try {
      const response = await channelApi.getPublicChannels();
      set({ channels: response.data.data });
    } catch (error) {
      // Handle error
    }
  }
}));
```

### ❌ Wrong: Direct axios in components

```typescript
// DON'T DO THIS
import axios from 'axios';
const response = await axios.get('/channels/public');
```

---

## Error Handling

### Response Interceptor
- Automatically clears auth on 401 (Unauthorized)
- Transforms errors to `ApiErrorResponse`
- Maps HTTP status codes to user-friendly messages

### Error Handling in Stores

```typescript
import { handleApiError } from '@/api/errors';

export const useAuthStore = create((set) => ({
  login: async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      set({ user: response.data.data?.user });
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
      set({ error: apiError });
    }
  }
}));
```

---

## Response Structure

All API endpoints return wrapped responses:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

**Example:**
```typescript
const response = await authApi.login({ email, password });
const user = response.data.data?.user;  // Double destructure
```

---

## Configuration

### Base URL
Edit in `src/api/client.ts`:

```typescript
function getApiBaseUrl(): string {
  if (__DEV__) {
    // Local development
    return 'http://localhost:3000/api';
    // For physical device, use: 'http://YOUR_MACHINE_IP:3000/api'
  }
  // Production
  return 'https://api.sarvadhi.com/api';
}
```

### Timeout
Default: 30 seconds (adjustable in `client.ts`)

### Headers
Content-Type automatically set to `application/json`

---

## Best Practices

1. **Never import axios in components**
   - Use Zustand stores instead

2. **Use namespaced types**
   - `Auth.User`, `Channel.Channel`, `Post.Post`

3. **Handle errors properly**
   - Use `handleApiError()` for consistent error messages
   - Show user-friendly alerts

4. **Pagination**
   - Use `limit` and `offset` parameters
   - Default: 20-50 items per page

5. **Environment variables**
   - Base URL is environment-aware
   - No hardcoding required

---

## Troubleshooting

### 401 Unauthorized
Token expired or invalid → Auto-redirected to login (handle in store)

### 422 Validation Error
Check `error.details` for field-specific errors

### Network Error
Can't reach backend → Check API URL and server status

### CORS Issues
Backend must allow origins with proper CORS headers

---

## Next Steps

1. ✅ API layer complete
2. → Update Zustand stores to use new API modules
3. → Build screens with proper error handling
4. → Add loading states
5. → Add request/response logging for debugging
