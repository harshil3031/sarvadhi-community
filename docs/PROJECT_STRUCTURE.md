# Project Structure

## Overview
This is a React Native (Expo) app following modern architecture patterns with Zustand for state management and a clean service layer.

## Directory Structure

```
sarvadhi-community/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth flow (login, register)
│   ├── (tabs)/            # Main tab navigation
│   └── channels/          # Channel-specific screens
│
├── src/                   # Source code (use @ alias)
│   ├── config/           # Configuration & constants
│   ├── features/         # Feature modules (future)
│   ├── lib/              # Shared utilities
│   ├── services/         # API service layer
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript types
│
├── components/           # Shared React components
├── constants/           # App-wide constants (themes)
├── hooks/              # Custom React hooks
└── assets/            # Images, fonts, etc.
```

## Key Folders

### `/src/services/`
Backend API integration layer.
- `api-client.ts` - Axios instance with interceptors
- `auth.service.ts` - Authentication endpoints
- `channel.service.ts` - Channel CRUD operations
- `post.service.ts` - Post management

### `/src/store/`
Zustand global state management.
- `auth.store.ts` - User auth state
- `channel.store.ts` - Channel list & membership
- `post.store.ts` - Posts by channel/group

### `/src/types/`
TypeScript interfaces matching backend contracts.

### `/src/config/`
Configuration constants (API URLs, storage keys).

### `/src/features/` (Ready for use)
Feature-based modules. Each feature is self-contained:
```
features/
  auth/
    components/
    screens/
    hooks/
  channels/
    components/
    screens/
    hooks/
```

## Import Aliases

Use `@/` for cleaner imports:

```typescript
// ✅ Good
import { useAuthStore } from '@/store/auth.store';
import { postService } from '@/services/post.service';

// ❌ Avoid
import { useAuthStore } from '../../store/auth.store';
```

Configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@/app/*` → `./app/*`
- `@/assets/*` → `./assets/*`

## Architecture Principles

1. **No React Context for state** - Use Zustand
2. **Backend is source of truth** - No mock data in production
3. **Service layer handles API** - Components never call axios directly
4. **Feature-based modules** - Group related code together
5. **TypeScript strict mode** - Type safety everywhere

## Development Workflow

1. **Define types** in `/src/types/`
2. **Create service** in `/src/services/`
3. **Add Zustand store** in `/src/store/`
4. **Build UI** in `app/` or `src/features/`

## Next Steps

- Build feature modules in `/src/features/`
- Add screens in `/app/`
- Implement remaining backend services
- Add proper error boundaries
- Configure environment variables
