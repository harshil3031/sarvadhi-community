# Zustand Stores - Global State Management

## Overview

Global state management using Zustand with secure token persistence via AsyncStorage. All stores follow the same architecture pattern: **state only, no UI logic**.

## Store Architecture

```
Store (Zustand)
├── State (user, token, socket, etc.)
├── Actions (login, logout, connect, etc.)
└── Hooks (useAuthStore, useSocketStore, etc.)
     │
     └─→ React Components (consume state + dispatch actions)
```

**Key Principle:** Stores are pure state containers. All business logic stays in stores, all UI logic stays in components.

## Auth Store (`useAuthStore`)

Authentication state and user management with secure token persistence.

### State

```typescript
// State
user: Auth.User | null              // Currently authenticated user
token: string | null                // JWT auth token
isLoading: boolean                  // Loading flag (login/register/restore)
isAuthenticated: boolean            // Authentication status
error: string | null                // Last error message
```

### User Interface

```typescript
interface Auth.User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'moderator' | 'employee';
  authProvider: 'local' | 'google';
  createdAt: string;
  updatedAt: string;
}
```

### Actions

#### `login(email, password): Promise<void>`

Login with email and password.

```typescript
const { login, isLoading, error } = useAuthStore();

try {
  await login('user@example.com', 'password123');
  // User authenticated, token persisted
} catch (error) {
  console.error('Login failed:', error);
  // Check store.error for message
}
```

**What it does:**
1. Sends credentials to backend via `authApi.login()`
2. Receives token and user profile
3. Persists token to AsyncStorage (`auth_token`)
4. Persists user to AsyncStorage (`user`)
5. Updates store state
6. Automatically attached to all future API requests via interceptor

**Error Handling:**
- Validation errors → error in store.error
- Network errors → error in store.error
- Token invalid → error in store.error

---

#### `register(fullName, email, password): Promise<void>`

Register new user account.

```typescript
const { register, isLoading, error } = useAuthStore();

try {
  await register('John Doe', 'john@example.com', 'SecurePass123!');
  // Account created, user authenticated
} catch (error) {
  console.error('Registration failed:', error);
}
```

**What it does:**
1. Validates input on client side
2. Sends registration data to backend via `authApi.register()`
3. Receives token and user profile
4. Automatically logs in (same as login flow)
5. Persists token and user to AsyncStorage

---

#### `loginWithGoogle(idToken): Promise<void>`

OAuth login via Google.

```typescript
const { loginWithGoogle, isLoading } = useAuthStore();

// After getting idToken from Google auth library:
try {
  await loginWithGoogle(googleIdToken);
  // Account created or logged in
} catch (error) {
  console.error('Google login failed:', error);
}
```

**What it does:**
1. Sends Google idToken to backend
2. Backend verifies token with Google
3. Creates account if first-time user
4. Returns JWT token and user
5. Same persistence as email login

---

#### `logout(): Promise<void>`

Logout user and clear session.

```typescript
const { logout } = useAuthStore();

await logout();
// User logged out, token cleared, state reset
```

**What it does:**
1. Notifies backend of logout (optional, doesn't fail if backend error)
2. Removes token from AsyncStorage
3. Removes user from AsyncStorage
4. Clears all auth state in store
5. Resets socket connection (if connected)

**Note:** Logout clears local session even if backend call fails.

---

#### `restoreSession(): Promise<void>`

Restore session from AsyncStorage on app startup.

```typescript
// In root layout (app/_layout.tsx)
useEffect(() => {
  const { restoreSession } = useAuthStore();
  restoreSession();
}, []);
```

**What it does:**
1. Checks for token in AsyncStorage
2. If found, verifies token with backend via `authApi.getCurrentUser()`
3. If valid, restores user and token state
4. If invalid/expired, clears AsyncStorage and logs out
5. Sets isLoading=false so app can proceed

**Use case:** Called on app startup to check if user has existing session.

---

#### `setUser(user): void`

Update user object without API call.

```typescript
const { setUser } = useAuthStore();

// Update user after profile change elsewhere
setUser(updatedUserData);
```

**Use case:** When user updates profile in another screen, update local state.

---

#### `clearError(): void`

Clear error message from store.

```typescript
const { error, clearError } = useAuthStore();

if (error) {
  return <ErrorAlert message={error} onDismiss={clearError} />;
}
```

---

### Complete Example

```typescript
// screens/LoginScreen.tsx
import { useAuthStore } from '@/store';
import { useRouter } from 'expo-router';

export function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigation happens automatically in root layout
    } catch (error) {
      // Error already in store.error
    }
  };

  return (
    <Screen>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && (
        <ErrorAlert
          message={error}
          onDismiss={clearError}
        />
      )}

      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </Screen>
  );
}
```

---

## Socket Store (`useSocketStore`)

WebSocket connection management for real-time features like direct messages.

### State

```typescript
// State
socket: Socket | null              // Socket.IO instance
isConnected: boolean               // Connection status
isConnecting: boolean              // Connecting flag
error: string | null               // Connection error
```

### Actions

#### `connect(): Promise<void>`

Connect to WebSocket server.

```typescript
const { connect, isConnected } = useSocketStore();

useEffect(() => {
  connect();
}, []);

if (!isConnected) {
  return <Text>Connecting to server...</Text>;
}
```

**What it does:**
1. Retrieves auth token from AsyncStorage
2. Establishes Socket.IO connection with JWT auth
3. Configures automatic reconnection (5 attempts, exponential backoff)
4. Listens for connection events
5. Handles authentication errors
6. Updates store state

**Connection options:**
- `transports`: ['websocket', 'polling'] (websocket preferred)
- `reconnection`: true (auto-reconnect)
- `reconnectionDelay`: 1000ms (initial delay)
- `reconnectionDelayMax`: 5000ms (max delay)
- `reconnectionAttempts`: 5 (max attempts)

---

#### `disconnect(): Promise<void>`

Disconnect from WebSocket server.

```typescript
const { disconnect } = useSocketStore();

// On logout
await disconnect();
```

**What it does:**
1. Gracefully closes socket connection
2. Cleans up event listeners
3. Removes socket instance
4. Resets connection state

---

#### `emit(event, data?): void`

Send event to server.

```typescript
const { emit } = useSocketStore();

// Send message
emit('message:send', {
  conversationId: '123',
  text: 'Hello!'
});

// Send event with no data
emit('user:typing');
```

**Warning:** Checks connection before emitting. Warns if not connected.

---

#### `on(event, callback): void`

Listen to socket event.

```typescript
const { on } = useSocketStore();

useEffect(() => {
  const handleMessage = (message) => {
    console.log('Received:', message);
    // Update UI
  };

  on('message:received', handleMessage);

  return () => {
    // Remember to clean up in useEffect return!
  };
}, []);
```

**Use case:** Listen for real-time updates (new messages, typing indicators, etc.)

---

#### `off(event, callback?): void`

Stop listening to socket event.

```typescript
const { off } = useSocketStore();

// Remove specific listener
off('message:received', handleMessage);

// Remove all listeners for event
off('message:received');
```

---

### Socket Events Reference

**Common events to emit:**

```typescript
// Direct Messages
emit('message:send', { conversationId, text });
emit('user:typing', { conversationId });
emit('user:stopTyping', { conversationId });

// Notifications
emit('notification:read', { notificationId });

// Presence
emit('user:online');
emit('user:offline');
```

**Common events to listen:**

```typescript
// Direct Messages
on('message:received', (message) => { ... });
on('user:typing', (data) => { ... });
on('user:stopTyping', (data) => { ... });

// Notifications
on('notification:new', (notification) => { ... });

// Presence
on('user:joined', (user) => { ... });
on('user:left', (user) => { ... });
```

---

### Complete Example

```typescript
// screens/MessagesScreen.tsx
import { useSocketStore } from '@/store';

export function MessagesScreen() {
  const { connect, disconnect, emit, on } = useSocketStore();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect on mount
    connect();

    // Listen for messages
    const handleMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };
    on('message:received', handleMessage);

    // Cleanup on unmount
    return () => {
      off('message:received', handleMessage);
      // Don't disconnect here - socket persists across screens
    };
  }, []);

  const sendMessage = (text) => {
    emit('message:send', {
      conversationId: conversationId,
      text
    });
  };

  return (
    <Screen>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageItem message={item} />}
      />
      <MessageInput onSend={sendMessage} />
    </Screen>
  );
}
```

---

## Token Persistence

### How Token Persistence Works

1. **Login**: Token received → AsyncStorage.setItem('auth_token', token)
2. **Request**: Token from AsyncStorage → Attached to request header via interceptor
3. **Response**: Error 401 → Token removed from AsyncStorage by interceptor
4. **Logout**: AsyncStorage.removeItem('auth_token')
5. **App Restart**: restoreSession() retrieves token from AsyncStorage

### AsyncStorage Keys

```typescript
// From STORAGE_KEYS in config/constants.ts
'auth_token'   // JWT token
'user'         // User profile JSON
```

### Security Notes

- ✅ AsyncStorage used (encrypted on iOS, can be encrypted on Android)
- ✅ Token only sent to own backend (same-origin policy)
- ✅ Token auto-removed on 401 response
- ✅ Token auto-cleared on logout
- ✅ No sensitive data in state (only ID, name, email)

---

## Store Usage in Root Layout

```typescript
// app/_layout.tsx
import { useAuthStore } from '@/store';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const { restoreSession, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // On app startup, restore previous session
    restoreSession();
  }, []);

  useEffect(() => {
    // When auth state changes, navigate
    if (isLoading) return; // Wait for session restore

    if (isAuthenticated) {
      // User logged in → go to app
      router.replace('/(tabs)');
    } else {
      // User logged out → go to login
      router.replace('/(auth)');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Slot />
  );
}
```

---

## Selectors (Optimized Subscriptions)

Zustand allows selecting specific parts of state to avoid unnecessary re-renders:

```typescript
// Bad: Component re-renders on any state change
const { user, isLoading, error } = useAuthStore();

// Good: Component only re-renders if user changes
const user = useAuthStore((state) => state.user);
const isLoading = useAuthStore((state) => state.isLoading);

// Best: Memoize selector for shallow comparison
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

---

## Error Handling in Stores

All API errors automatically caught and stored in `store.error`:

```typescript
const { login, error } = useAuthStore();

try {
  await login(email, password);
} catch (e) {
  // Error details in store.error
  // e is raw axios error
}

// In component
if (error) {
  <Text>{error}</Text>  // User-friendly message from store
}
```

---

## Testing Stores

```typescript
// tests/auth.store.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/store';

describe('useAuthStore', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should handle login error', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.login('invalid@example.com', 'wrong');
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## Best Practices

✅ **DO:**
- Use stores for global state only
- Use stores for API calls and data persistence
- Clear errors before new actions
- Handle loading states in components
- Unsubscribe from socket events in useEffect cleanup
- Call restoreSession on app startup

❌ **DON'T:**
- Don't put UI state in stores (use component useState)
- Don't call stores directly in render (use hooks)
- Don't store sensitive data in state (passwords, credit cards)
- Don't make API calls directly in components
- Don't forget to cleanup socket event listeners
- Don't assume token is valid without restoreSession

---

## Debugging

### Enable Socket Debugging

```typescript
// In socket.store.ts, add:
newSocket.onAny((event, ...args) => {
  console.log('[Socket]', event, args);
});
```

### Check Store State

```typescript
// In any component
const state = useAuthStore();
console.log('Auth state:', state);

const socket = useSocketStore();
console.log('Socket state:', socket);
```

### Check AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('auth_token');
console.log('Token:', token);

const user = await AsyncStorage.getItem('user');
console.log('User:', JSON.parse(user || '{}'));
```

---

## Summary

| Store | Purpose | Key Actions |
|-------|---------|------------|
| **useAuthStore** | User authentication & profile | login, register, logout, restoreSession |
| **useSocketStore** | WebSocket connection | connect, disconnect, emit, on |
| **useChannelStore** | Channel data & operations | getChannels, joinChannel, etc. |
| **usePostStore** | Post data & feed | getPosts, createPost, etc. |

All stores follow Zustand patterns with automatic TypeScript typing, secure token persistence, and zero UI logic.
