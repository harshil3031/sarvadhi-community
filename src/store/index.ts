/**
 * Global State Store - Zustand Stores
 *
 * Central location for all global state management using Zustand.
 * This file provides barrel exports for all stores.
 *
 * Architecture:
 * - No UI logic inside stores
 * - Stores only manage state and API calls
 * - Components use hooks to access store state
 * - Token persistence handled via AsyncStorage
 */

export { useAuthStore } from './auth.store';
export { useSocketStore } from './socket.store';
export { useChannelStore } from './channel.store';
export { usePostStore } from './post.store';
