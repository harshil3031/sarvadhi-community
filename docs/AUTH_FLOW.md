# Authentication Flow - Implementation Guide

## Overview

The authentication flow uses Expo Router with automatic navigation based on auth state. No manual navigation needed in login screens - everything handled automatically by the root layout.

---

## Flow Diagram

```
App Launch (app/index.tsx)
    ↓
restoreSession() called
    ↓
Check AsyncStorage for token
    ↓
┌─────────────────────────────────────┐
│         Token exists?               │
└─────────────────────────────────────┘
    ↓                    ↓
   YES                  NO
    ↓                    ↓
Call GET /auth/me    Set isLoading=false
    ↓                    ↓
┌───────────────┐   Redirect to
│  Token valid? │   /(auth)/login
└───────────────┘
    ↓        ↓
   YES      NO
    ↓        ↓
Set user   Clear token
    ↓        ↓
Redirect   Redirect to
to tabs    /(auth)/login
```

---

## File Structure

```
app/
├── index.tsx          # Entry point, handles initial auth check
├── _layout.tsx        # Root layout, manages route protection
├── (auth)/
│   ├── login.tsx      # Login screen
│   └── register.tsx   # Register screen
└── (tabs)/
    └── channels.tsx   # Protected app screens
```

---

## Implementation Details

### 1. Entry Point (`app/index.tsx`)

**Purpose**: Initial screen shown on app launch.

**Responsibilities**:
- Call `restoreSession()` on mount
- Show loading screen during auth check
- Redirect based on auth status

**Key Code**:
```typescript
export default function Index() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession(); // Checks token & calls GET /auth/me
  }, []);

  if (isLoading) {
    return <LoadingScreen />; // Prevents flicker
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/channels" />;
  }

  return <Redirect href="/(auth)/login" />;
}
```

**Flow**:
1. Component mounts
2. `restoreSession()` called immediately
3. While loading: Show `LoadingScreen`
4. After loading: Redirect based on `isAuthenticated`

---

### 2. Root Layout (`app/_layout.tsx`)

**Purpose**: Manages navigation between auth and protected routes.

**Responsibilities**:
- Monitor auth state changes
- Protect routes (prevent unauthenticated access to tabs)
- Handle automatic navigation after login/logout

**Key Code**:
```typescript
export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login'); // Not logged in → login
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/channels'); // Logged in → app
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

**Navigation Logic**:
- User logs in → `isAuthenticated` becomes `true` → Auto-redirect to tabs
- User logs out → `isAuthenticated` becomes `false` → Auto-redirect to login
- User tries to access protected route → Check auth → Redirect if needed

---

### 3. Login Screen (`app/(auth)/login.tsx`)

**Purpose**: User authentication interface.

**Responsibilities**:
- Collect credentials
- Call `login()` from auth store
- Display errors
- **No manual navigation** - handled by root layout

**Key Code**:
```typescript
export default function LoginScreen() {
  const { login, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      clearError();
      
      await login(email, password);
      // Navigation happens automatically - no router.push needed!
      
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={handleLogin} disabled={isLoading} />
    </View>
  );
}
```

**Important**: No `router.push()` after successful login. The root layout watches `isAuthenticated` and navigates automatically.

---

### 4. Loading Screen (`components/LoadingScreen.tsx`)

**Purpose**: Prevents screen flicker during auth check.

**Why needed**: Without a loading screen, users would see a flash of the login screen before being redirected to tabs.

**Key Code**:
```typescript
export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}
```

---

## Auth State Flow

### On App Launch

```typescript
// 1. App starts
app/index.tsx mounts
  ↓
// 2. Restore session
useEffect(() => restoreSession())
  ↓
// 3. Loading state
isLoading = true → Show LoadingScreen
  ↓
// 4. Check AsyncStorage
token = await AsyncStorage.getItem('auth_token')
  ↓
// 5. Validate token
if (token) {
  response = await authApi.getCurrentUser() // GET /auth/me
  if (response.ok) {
    isAuthenticated = true
  } else {
    isAuthenticated = false
    clear AsyncStorage
  }
}
  ↓
// 6. Stop loading
isLoading = false
  ↓
// 7. Redirect
if (isAuthenticated) {
  <Redirect href="/(tabs)/channels" />
} else {
  <Redirect href="/(auth)/login" />
}
```

### On Login

```typescript
// 1. User enters credentials
handleLogin() called
  ↓
// 2. Call API
await authApi.login({ email, password })
  ↓
// 3. Store token
await AsyncStorage.setItem('auth_token', token)
await AsyncStorage.setItem('user', JSON.stringify(user))
  ↓
// 4. Update state
set({ isAuthenticated: true, user, token })
  ↓
// 5. Root layout detects change
useEffect in _layout.tsx fires
  ↓
// 6. Automatic navigation
router.replace('/(tabs)/channels')
```

### On Logout

```typescript
// 1. User clicks logout
await logout()
  ↓
// 2. Clear storage
await AsyncStorage.removeItem('auth_token')
await AsyncStorage.removeItem('user')
  ↓
// 3. Update state
set({ isAuthenticated: false, user: null, token: null })
  ↓
// 4. Root layout detects change
useEffect in _layout.tsx fires
  ↓
// 5. Automatic navigation
router.replace('/(auth)/login')
```

---

## API Integration

### Token Validation (`GET /auth/me`)

Called during `restoreSession()`:

```typescript
restoreSession: async () => {
  set({ isLoading: true });
  try {
    const token = await AsyncStorage.getItem('auth_token');
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    // Verify token is still valid
    const response = await authApi.getCurrentUser(); // GET /auth/me
    
    set({
      user: response.data.data,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  } catch (error) {
    // Token invalid or expired
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Session expired. Please login again.',
    });
  }
}
```

**Request**:
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (valid)**:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "employee"
  }
}
```

**Response (invalid)**:
```http
401 Unauthorized
```

---

## Preventing Screen Flicker

### Problem
Without proper loading states, users see:
1. Login screen (brief flash)
2. Redirect to tabs

### Solution
```typescript
// app/index.tsx
if (isLoading) {
  return <LoadingScreen />; // Block rendering until auth checked
}
```

**Timeline**:
```
0ms:   App launches
0ms:   LoadingScreen shown
50ms:  restoreSession() starts
100ms: GET /auth/me called
300ms: Response received
300ms: isLoading = false
300ms: Redirect to tabs (or login)
```

**Result**: User sees smooth transition from LoadingScreen to final screen.

---

## Route Protection

Routes are protected automatically by root layout:

```typescript
// User tries to access /(tabs)/channels
// Root layout checks:
if (!isAuthenticated && !inAuthGroup) {
  router.replace('/(auth)/login'); // Blocked!
}
```

**Protected routes**:
- `/(tabs)/*` - All tab screens
- Any route outside `/(auth)/*`

**Public routes**:
- `/(auth)/login`
- `/(auth)/register`

---

## Testing the Flow

### Test 1: Fresh Install (No Token)
```
1. Launch app
2. See LoadingScreen briefly
3. Redirect to login
4. Login with credentials
5. Auto-redirect to channels
```

### Test 2: Valid Token
```
1. Launch app
2. See LoadingScreen briefly
3. restoreSession() validates token
4. Auto-redirect to channels
```

### Test 3: Expired Token
```
1. Launch app
2. See LoadingScreen
3. restoreSession() fails validation
4. Token cleared from AsyncStorage
5. Auto-redirect to login
6. Error message shown: "Session expired"
```

### Test 4: Logout
```
1. User on channels screen
2. Click logout
3. Token cleared
4. Auto-redirect to login
5. No screen flicker
```

---

## Common Issues & Solutions

### Issue: Infinite Redirect Loop
**Cause**: Root layout keeps redirecting because `isLoading` never becomes `false`.

**Solution**: Ensure `restoreSession()` always sets `isLoading = false` in both success and error cases.

### Issue: Screen Flicker
**Cause**: Not showing loading screen during auth check.

**Solution**: Check `isLoading` in `app/index.tsx` and return `<LoadingScreen />`.

### Issue: Manual Navigation Not Working
**Cause**: Trying to `router.push()` after login instead of relying on automatic navigation.

**Solution**: Remove manual navigation. Let root layout handle it based on `isAuthenticated` state.

### Issue: 401 Response Doesn't Log Out
**Cause**: API interceptor not clearing token on 401.

**Solution**: Interceptor in `src/api/client.ts` should clear AsyncStorage on 401:
```typescript
if (error.response?.status === 401) {
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('user');
}
```

---

## Summary

✅ **Entry Point**: `app/index.tsx` - Calls `restoreSession()`, shows loading  
✅ **Route Protection**: `app/_layout.tsx` - Auto-navigation based on auth  
✅ **No Flicker**: LoadingScreen shown during auth check  
✅ **Automatic Navigation**: No manual `router.push()` needed  
✅ **Token Validation**: GET /auth/me called on app launch  
✅ **Secure**: Token cleared on 401, expired tokens handled  

**Result**: Clean, flicker-free authentication flow following React Native best practices.
