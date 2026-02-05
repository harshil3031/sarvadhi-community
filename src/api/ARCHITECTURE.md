# API Architecture Guide

## Client Setup (src/api/client.ts)

Axios instance creation with request/response interceptors.

### Key Features
- Request interceptor: Attaches JWT token from AsyncStorage
- Response interceptor: Handles errors, clears token on 401
- Environment-based base URL
- Timeout: 30 seconds
- Error transformation to ApiErrorResponse

### Usage

```typescript
import { apiClient, ApiResponse, ApiErrorResponse } from '@/api';

// Directly if needed (avoid - use API modules instead)
const response = await apiClient.get('/some-endpoint');
```

## API Modules

Each module maps to a backend feature:

### auth.ts
- **Namespace**: Auth
- **Methods**: register, login, loginWithGoogle, getCurrentUser, refreshToken, logout
- **Types**: User, LoginRequest, RegisterRequest, AuthResponse

### channels.ts
- **Namespace**: Channel
- **Methods**: 13 channel operations (CRUD, join, invite, etc.)
- **Types**: Channel, CreateChannelRequest, JoinRequestResponse

### group.api.ts
- **Namespace**: Group
- **Methods**: 9 group operations
- **Types**: Group, CreateGroupRequest, GroupMember

### posts.ts
- **Namespace**: Post
- **Methods**: 8 post operations (create, get, update, delete, pin)
- **Types**: Post, CreatePostRequest

### comment.api.ts
- **Namespace**: Comment
- **Methods**: 5 comment operations
- **Types**: Comment, CreateCommentRequest

### dm.api.ts
- **Namespace**: DM
- **Methods**: 6 direct message operations
- **Types**: Message, Conversation, SendMessageRequest

### notification.api.ts
- **Namespace**: Notification
- **Methods**: 8 notification operations
- **Types**: Notification, NotificationPreferences

## Error Handling (errors.ts)

Centralized error utilities:

```typescript
import { handleApiError, ErrorType, HTTP_STATUS } from '@/api/errors';

try {
  const response = await authApi.login({ email, password });
} catch (error) {
  const apiError = handleApiError(error);
  switch (apiError.type) {
    case ErrorType.UNAUTHORIZED:
      // Handle 401
      break;
    case ErrorType.VALIDATION_ERROR:
      // Handle 422 with details
      break;
    case ErrorType.NETWORK_ERROR:
      // Handle connection issues
      break;
  }
}
```

## Barrel Export (index.ts)

Central export point for all API modules and types.

```typescript
import {
  // Client
  apiClient,
  type ApiErrorResponse,
  type ApiResponse,

  // APIs
  authApi,
  channelApi,
  groupApi,
  postApi,
  commentApi,
  dmApi,
  notificationApi,

  // Types
  type Auth,
  type Channel,
  type Group,
  type Post,
  type Comment,
  type DM,
  type Notification,
} from '@/api';
```

## Architecture Pattern

```
Component (UI)
   ↓
Zustand Store (useAuthStore, useChannelStore, etc.)
   ↓
API Module (authApi, channelApi, postApi, etc.)
   ↓
Axios Client (apiClient)
   ↓
HTTP Request + Interceptors
   ↓
Backend API
```

**Rule**: Never import axios or API client directly in components!

## Zustand Store Integration

Example: src/store/auth.store.ts

```typescript
import { create } from 'zustand';
import { authApi, handleApiError } from '@/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data.data!;
      
      set({
        user,
        token,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const apiError = handleApiError(error);
      set({
        error: apiError.message,
        isLoading: false
      });
      throw error;
    }
  }
}));
```

## Component Usage

```typescript
import { useAuthStore } from '@/store';

export function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      // Error already in store.error
    }
  };

  return (
    <>
      {error && <ErrorAlert message={error} />}
      <Button onPress={handleLogin} disabled={isLoading} />
    </>
  );
}
```

## Response Handling

All responses wrapped in ApiResponse<T>:

```typescript
const response = await authApi.login({ email, password });
// response.data is ApiResponse<Auth.AuthResponse>
// response.data.data is the actual Auth.AuthResponse
// response.data.data?.user is the User object

const user = response.data.data?.user;
const token = response.data.data?.token;
```

## Error Response Structure

When an error occurs, it's transformed to ApiErrorResponse:

```typescript
{
  statusCode: number,      // e.g., 401, 422, 500
  message: string,         // User-friendly message
  error?: string,          // Error type code
  details?: object         // Extra info (validation errors, etc.)
}
```

## Configuration

### Base URLs

**Development**: `http://localhost:3000/api`
**Production**: `https://api.sarvadhi.com/api`

Edit `src/api/client.ts` function `getApiBaseUrl()` to change.

### Automatic Features

- ✅ JWT token auto-attached to all requests via interceptor
- ✅ Token auto-saved to AsyncStorage after login
- ✅ Token auto-cleared on 401 response
- ✅ All errors automatically transformed to ApiErrorResponse
- ✅ Content-Type automatically set to application/json

## Total API Coverage

**55+ Endpoints Implemented**
- Authentication: 6 endpoints
- Channels: 13 endpoints
- Groups: 9 endpoints
- Posts: 8 endpoints
- Comments: 5 endpoints
- Direct Messages: 6 endpoints
- Notifications: 8 endpoints

All with:
- ✅ Full TypeScript type safety
- ✅ JSDoc documentation
- ✅ Request/response interfaces
- ✅ Proper error handling
- ✅ Pagination support (where applicable)
- ✅ Automatic JWT token management
- ✅ Environment-based configuration

## Next Steps

1. ✅ API layer complete
2. ✅ Zustand stores created (auth, socket)
3. → Build UI screens with API integration
4. → Add loading states to components
5. → Add error boundaries
6. → Test with actual backend
