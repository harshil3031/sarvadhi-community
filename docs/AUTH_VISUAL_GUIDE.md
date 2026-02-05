# Authentication Flow - Quick Visual Guide

## File Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                     app/index.tsx                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Entry point on app launch                        │    │
│  │ • Calls restoreSession()                           │    │
│  │ • Shows LoadingScreen while checking auth          │    │
│  │ • Redirects based on isAuthenticated               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    app/_layout.tsx                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Wraps entire app                                 │    │
│  │ • Watches isAuthenticated changes                  │    │
│  │ • Automatically navigates on auth change           │    │
│  │ • Protects routes (blocks unauthenticated users)   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         ↓                                  ↓
┌──────────────────────┐         ┌──────────────────────┐
│   app/(auth)/*       │         │    app/(tabs)/*      │
│ ┌──────────────────┐ │         │ ┌──────────────────┐ │
│ │ • login.tsx      │ │         │ │ • channels.tsx   │ │
│ │ • register.tsx   │ │         │ │ • groups.tsx     │ │
│ │                  │ │         │ │ • profile.tsx    │ │
│ │ PUBLIC           │ │         │ │ PROTECTED        │ │
│ └──────────────────┘ │         │ └──────────────────┘ │
└──────────────────────┘         └──────────────────────┘
```

---

## State Flow

```
┌──────────────────────────────────────────────────────────┐
│              src/store/auth.store.ts                     │
│ ┌──────────────────────────────────────────────────┐    │
│ │ STATE:                                           │    │
│ │ • user: Auth.User | null                         │    │
│ │ • token: string | null                           │    │
│ │ • isAuthenticated: boolean                       │    │
│ │ • isLoading: boolean                             │    │
│ │ • error: string | null                           │    │
│ │                                                  │    │
│ │ ACTIONS:                                         │    │
│ │ • login(email, password)                         │    │
│ │ • logout()                                       │    │
│ │ • restoreSession() ← Called on app launch        │    │
│ └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  AsyncStorage                            │
│ ┌──────────────────────────────────────────────────┐    │
│ │ • 'auth_token': JWT token                        │    │
│ │ • 'user': User object JSON                       │    │
│ └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  src/api/client.ts                       │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Request Interceptor:                             │    │
│ │ • Gets token from AsyncStorage                   │    │
│ │ • Attaches as Bearer token                       │    │
│ │                                                  │    │
│ │ Response Interceptor:                            │    │
│ │ • On 401: Clear token from AsyncStorage          │    │
│ │ • Transform errors to ApiErrorResponse           │    │
│ └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    Backend API                           │
│ ┌──────────────────────────────────────────────────┐    │
│ │ GET /auth/me                                     │    │
│ │ • Validates JWT token                            │    │
│ │ • Returns user data if valid                     │    │
│ │ • Returns 401 if invalid/expired                 │    │
│ └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Complete App Launch Flow

```
┌─ App Launches ─────────────────────────────────────────────┐
│                                                             │
│  app/index.tsx mounts                                       │
│         ↓                                                   │
│  useEffect(() => restoreSession())                          │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ 1. Set isLoading = true                 │               │
│  │ 2. Get token from AsyncStorage          │               │
│  │ 3. If no token → isLoading = false      │               │
│  │ 4. If token exists → Call GET /auth/me  │               │
│  └─────────────────────────────────────────┘               │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │      Backend validates token             │               │
│  └─────────────────────────────────────────┘               │
│         ↓                        ↓                          │
│      Valid (200)            Invalid (401)                   │
│         ↓                        ↓                          │
│  ┌──────────────┐        ┌──────────────────┐              │
│  │ Set user     │        │ Clear token      │              │
│  │ isAuth=true  │        │ isAuth=false     │              │
│  │ isLoading=0  │        │ isLoading=false  │              │
│  └──────────────┘        └──────────────────┘              │
│         ↓                        ↓                          │
│  ┌──────────────┐        ┌──────────────────┐              │
│  │ Redirect to  │        │ Redirect to      │              │
│  │ /(tabs)      │        │ /(auth)/login    │              │
│  └──────────────┘        └──────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Login Flow

```
┌─ User Logs In ─────────────────────────────────────────────┐
│                                                             │
│  User enters email & password                               │
│         ↓                                                   │
│  handleLogin() called                                       │
│         ↓                                                   │
│  await login(email, password)                               │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ 1. Set isLoading = true                 │               │
│  │ 2. Call POST /auth/login                │               │
│  │ 3. Receive { token, user }              │               │
│  │ 4. Save to AsyncStorage                 │               │
│  │ 5. Set isAuthenticated = true           │               │
│  │ 6. Set isLoading = false                │               │
│  └─────────────────────────────────────────┘               │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ app/_layout.tsx detects change:         │               │
│  │ • isAuthenticated changed to true       │               │
│  │ • useEffect fires                       │               │
│  │ • router.replace('/(tabs)/channels')    │               │
│  └─────────────────────────────────────────┘               │
│         ↓                                                   │
│  User sees channels screen                                  │
│  NO manual navigation needed!                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Logout Flow

```
┌─ User Logs Out ────────────────────────────────────────────┐
│                                                             │
│  User clicks logout button                                  │
│         ↓                                                   │
│  await logout()                                             │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ 1. Call POST /auth/logout (optional)    │               │
│  │ 2. Remove token from AsyncStorage       │               │
│  │ 3. Remove user from AsyncStorage        │               │
│  │ 4. Set isAuthenticated = false          │               │
│  │ 5. Set user = null, token = null        │               │
│  └─────────────────────────────────────────┘               │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ app/_layout.tsx detects change:         │               │
│  │ • isAuthenticated changed to false      │               │
│  │ • useEffect fires                       │               │
│  │ • router.replace('/(auth)/login')       │               │
│  └─────────────────────────────────────────┘               │
│         ↓                                                   │
│  User sees login screen                                     │
│  NO manual navigation needed!                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen Flicker Prevention

### ❌ Without Loading Screen
```
0ms:   App starts
0ms:   Render login screen (FLASH!)
100ms: Token validated
100ms: Redirect to channels
User sees: Login → Channels (flicker!)
```

### ✅ With Loading Screen
```
0ms:   App starts
0ms:   Render LoadingScreen
100ms: Token validated
100ms: Redirect to channels
User sees: Loading → Channels (smooth!)
```

**Implementation**:
```typescript
// app/index.tsx
if (isLoading) {
  return <LoadingScreen />; // Blocks login/tabs render
}
```

---

## Route Protection Visual

```
┌─ User Navigation Attempt ──────────────────────────────────┐
│                                                             │
│  User tries to access /(tabs)/channels                      │
│         ↓                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │ app/_layout.tsx checks:                 │               │
│  │                                         │               │
│  │ const inTabsGroup = segments[0]==='(tabs)' │            │
│  │ const isAuthenticated = store.isAuth    │               │
│  │                                         │               │
│  │ if (!isAuthenticated && inTabsGroup) {  │               │
│  │   router.replace('/(auth)/login')       │               │
│  │ }                                       │               │
│  └─────────────────────────────────────────┘               │
│         ↓                        ↓                          │
│   Authenticated           Not Authenticated                 │
│         ↓                        ↓                          │
│  ┌──────────────┐        ┌──────────────────┐              │
│  │ Allow access │        │ Redirect to      │              │
│  │ to channels  │        │ login            │              │
│  └──────────────┘        └──────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Summary

```
User Action → Store Action → AsyncStorage → API Call → Backend
                ↓                                         ↓
           State Update ←──────────────── Response ←──────┘
                ↓
         Component Re-render
                ↓
          Root Layout
                ↓
       Automatic Navigation
```

---

## Key Principles

1. **Single Source of Truth**: `isAuthenticated` in auth store
2. **Automatic Navigation**: Root layout watches state, navigates automatically
3. **No Manual Routing**: Screens don't call `router.push()` after login
4. **Loading States**: Always show loading during async operations
5. **Error Handling**: Errors stored in state, displayed in UI
6. **Token Validation**: Always verify token on app launch
7. **Clean Separation**: Each file has one responsibility

---

**This visual guide shows the complete authentication flow from app launch to protected routes!**
