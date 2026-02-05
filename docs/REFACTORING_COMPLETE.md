# Sarvadhi Community - Project Structure

## ✅ Completed Refactoring

The project has been successfully refactored into a clean, modular structure following best practices.

---

## Directory Structure

### `/app` - Expo Router Routes (File-based Routing)

```
app/
├── _layout.tsx              # Root navigation setup
├── (auth)/                  # Auth route group
│   ├── _layout.tsx         # Auth stack layout
│   ├── login.tsx           # Login screen
│   └── register.tsx        # Register screen
└── (tabs)/                 # Main app tab navigation
    ├── _layout.tsx         # Tab layout with navigation
    ├── index.tsx           # Default tab route
    ├── profile.tsx         # Profile screen
    ├── channels/           # Channels feature
    │   ├── index.tsx       # Channels list
    │   └── [id].tsx        # Channel detail
    ├── groups/             # Groups feature
    │   ├── index.tsx       # Groups list
    │   └── [id].tsx        # Group detail
    └── messages/           # Direct messages feature
        ├── index.tsx       # Conversations list
        └── [id].tsx        # Conversation detail
```

### `/src` - Application Logic

```
src/
├── api/                    # API Integration Layer
│   ├── client.ts          # Axios client with interceptors
│   ├── auth.ts            # Authentication endpoints
│   ├── channels.ts        # Channel API calls
│   ├── posts.ts           # Post API calls
│   ├── groups.ts          # Group API calls
│   ├── dms.ts             # Direct message API calls
│   └── index.ts           # Export all APIs
│
├── store/                 # Zustand Global State
│   ├── auth.store.ts      # Auth state management
│   ├── channel.store.ts   # Channel state management
│   └── post.store.ts      # Post state management
│
├── hooks/                 # Custom React Hooks
│   └── (ready for use)
│
├── components/            # Shared React Components
│   └── (ready for use)
│
├── types/                 # TypeScript Interfaces
│   ├── channel.ts
│   └── post.ts
│
├── utils/                 # Utility Functions
│   └── (ready for use)
│
└── config/                # Configuration
    └── constants.ts       # App-wide constants
```

---

## Key Improvements

### 1. **Modular API Layer** (`/src/api/`)
- Separated API clients by feature (auth, channels, posts, groups, dms)
- Axios client with JWT token interceptors
- Type-safe requests and responses
- No direct API calls from components

### 2. **Global State Management** (`/src/store/`)
- **Zustand** for scalable state (no Redux, no Context)
- Isolated concerns: auth, channels, posts
- Async actions for API calls
- Local caching to reduce network calls

### 3. **Clean Route Structure** (`/app/`)
- File-based routing with Expo Router
- Nested routes for features (channels, groups, messages)
- Dynamic routes with `[id]` parameters
- Route groups `(auth)` and `(tabs)` for layout organization

### 4. **Feature-Ready**
- All route skeletons in place
- No UI built yet (as requested)
- Ready for screen development

---

## Absolute Imports (`@/`)

All imports use the `@/` alias for cleaner paths:

```typescript
// ✅ Good
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api';

// ❌ Avoid  
import { useAuthStore } from '../../../store/auth.store';
```

Configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@/app/*` → `./app/*`
- `@/assets/*` → `./assets/*`

---

## Architecture Flow

```
User Interaction
    ↓
App Screen (UI Component)
    ↓
Zustand Store (useXxxStore)
    ↓
API Layer (apiClient / xxxApi)
    ↓
Backend (Axios → HTTP)
    ↓
Database (Source of Truth)
```

---

## Next Steps

1. **Build UI Screens** - Use the skeleton route files
2. **Add Custom Hooks** - Create reusable logic in `/src/hooks/`
3. **Build Shared Components** - Common UI elements in `/src/components/`
4. **Add Utilities** - Helper functions in `/src/utils/`
5. **Extend API** - Add more endpoints to `/src/api/` as needed

---

## Dependencies

✅ **Already installed:**
- `zustand` - State management
- `axios` - HTTP client
- `expo-router` - Routing
- `@react-native-async-storage/async-storage` - Local storage

---

## Notes

- **No React Context** - Use Zustand for all state
- **Backend is source of truth** - Don't mock data in production
- **Type-safe** - Strict TypeScript mode enabled
- **Modular** - Feature-based structure (ready to add new features)
