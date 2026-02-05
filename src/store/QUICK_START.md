# Store Usage Quick Reference

## Import

```typescript
import { useAuthStore, useSocketStore } from '@/store';
```

---

## Auth Store - Quick Actions

### Login
```typescript
const { login, isLoading, error } = useAuthStore();
await login('email@example.com', 'password123');
```

### Register
```typescript
const { register, isLoading, error } = useAuthStore();
await register('John Doe', 'john@example.com', 'SecurePass123!');
```

### Logout
```typescript
const { logout } = useAuthStore();
await logout();
```

### Restore Session (App Startup)
```typescript
const { restoreSession } = useAuthStore();
useEffect(() => {
  restoreSession();
}, []);
```

### Check Auth Status
```typescript
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const user = useAuthStore((state) => state.user);
```

### Display Error
```typescript
const { error, clearError } = useAuthStore();
if (error) {
  return <Alert message={error} onDismiss={clearError} />;
}
```

---

## Socket Store - Quick Actions

### Connect
```typescript
const { connect } = useSocketStore();
useEffect(() => {
  connect();
}, []);
```

### Send Message
```typescript
const { emit } = useSocketStore();
emit('message:send', { conversationId: '123', text: 'Hello!' });
```

### Listen for Messages
```typescript
const { on, off } = useSocketStore();

useEffect(() => {
  const handleMessage = (message) => {
    console.log('New message:', message);
  };
  
  on('message:received', handleMessage);
  
  return () => off('message:received', handleMessage);
}, []);
```

### Check Connection
```typescript
const isConnected = useSocketStore((state) => state.isConnected);
```

### Disconnect
```typescript
const { disconnect } = useSocketStore();
await disconnect();
```

---

## Common Patterns

### Login Screen
```typescript
export function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e) {
      // Error in store.error
    }
  };

  return (
    <View>
      {error && <ErrorBanner message={error} onClose={clearError} />}
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </View>
  );
}
```

### Protected Route
```typescript
export default function RootLayout() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  return <Slot />;
}
```

### Real-time Messages
```typescript
export function MessagesScreen() {
  const { connect, emit, on, off } = useSocketStore();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    connect();

    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    on('message:received', handleMessage);

    return () => off('message:received', handleMessage);
  }, []);

  const sendMessage = (text) => {
    emit('message:send', { conversationId, text });
  };

  return <MessageList messages={messages} onSend={sendMessage} />;
}
```

---

## State Selectors (Performance)

### ❌ Bad (re-renders on any change)
```typescript
const { user, token, isLoading } = useAuthStore();
```

### ✅ Good (re-renders only when specific field changes)
```typescript
const user = useAuthStore(state => state.user);
const isLoading = useAuthStore(state => state.isLoading);
```

### ✅ Best (memoized computed value)
```typescript
const userName = useAuthStore(state => state.user?.fullName ?? 'Guest');
const isAdmin = useAuthStore(state => state.user?.role === 'admin');
```

---

## Debugging

### Check Store State
```typescript
// Get current state without subscribing
const currentState = useAuthStore.getState();
console.log('Auth State:', currentState);

const socketState = useSocketStore.getState();
console.log('Socket State:', socketState);
```

### Check AsyncStorage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('auth_token');
console.log('Stored Token:', token);

const user = await AsyncStorage.getItem('user');
console.log('Stored User:', JSON.parse(user || '{}'));
```

### Check Socket Connection
```typescript
const { socket, isConnected } = useSocketStore.getState();
console.log('Connected:', isConnected);
console.log('Socket ID:', socket?.id);
```

---

## Error Handling

### Auth Errors
```typescript
try {
  await login(email, password);
} catch (error) {
  // Error details in store.error
  const { error: storeError } = useAuthStore.getState();
  
  if (storeError.includes('credentials')) {
    // Wrong email/password
  } else if (storeError.includes('network')) {
    // Connection issue
  }
}
```

### Socket Errors
```typescript
const { error } = useSocketStore();

if (error) {
  if (error.includes('Authentication')) {
    // Token invalid, re-login
  } else if (error.includes('Connection')) {
    // Network issue
  }
}
```

---

## Complete Example App Flow

```typescript
// 1. App starts → restore session
useEffect(() => {
  useAuthStore.getState().restoreSession();
}, []);

// 2. User logs in
await useAuthStore.getState().login(email, password);

// 3. Connect socket
await useSocketStore.getState().connect();

// 4. Listen for real-time updates
useSocketStore.getState().on('message:received', handleMessage);

// 5. User logs out
await useSocketStore.getState().disconnect();
await useAuthStore.getState().logout();
```
