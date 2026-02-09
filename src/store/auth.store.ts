import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, Auth } from '../api/auth';
import { STORAGE_KEYS } from '../config/constants';

// Import socket store for managing DM connections
let socketStore: any = null;
const getSocketStore = () => {
  if (!socketStore) {
    socketStore = require('./socket.store').useSocketStore;
  }
  return socketStore;
};

interface AuthState {
  // State
  user: Auth.User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: Auth.User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  /**
   * Login with email and password
   * - Authenticates user with backend
   * - Persists token to AsyncStorage
   * - Connects WebSocket for DMs after successful login
   * - Updates auth state
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[Login] Starting login with email:', email);
      const response = await authApi.login({ email, password });
      console.log('[Login] Response received:', response.data);
      const { token, user } = response.data.data!;

      // Persist token securely
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Connect WebSocket for DMs after successful login
      const socketStore = getSocketStore();
      if (socketStore) {
        socketStore.getState().connect();
      }
    } catch (error: any) {
      console.log('[Login] Error:', error);
      const message = error?.response?.data?.message || 
                     error?.data?.message ||
                     error?.message || 
                     'Login failed. Please check your credentials.';
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Register new user with email and password
   * - Creates new user account
   * - Persists token to AsyncStorage
   * - Connects WebSocket for DMs after successful registration
   * - Automatically logs in after registration
   */
  register: async (fullName: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({
        fullName,
        email,
        password,
      });
      const { token, user } = response.data.data!;

      // Persist token securely
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Connect WebSocket for DMs after successful registration
      const socketStore = getSocketStore();
      if (socketStore) {
        socketStore.getState().connect();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Login or register with Google OAuth
   * - Creates or updates user account via Google
   * - Persists token to AsyncStorage
   * - Connects WebSocket for DMs after successful authentication
   */
  loginWithGoogle: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.loginWithGoogle({ idToken });
      const { token, user } = response.data.data!;

      // Persist token securely
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Connect WebSocket for DMs after successful login
      const socketStore = getSocketStore();
      if (socketStore) {
        socketStore.getState().connect();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Google login failed';
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Logout user
   * - Clears stored token and user data
   * - Disconnects WebSocket
   * - Resets auth state
   * - Cleans up AsyncStorage
   */
  logout: async () => {
    try {
      // Disconnect WebSocket before logout
      const socketStore = getSocketStore();
      if (socketStore) {
        socketStore.getState().disconnect();
      }

      // Notify backend of logout (optional)
      try {
        await authApi.logout();
      } catch (error) {
        // Logout from backend failed, but continue with client-side logout
        console.log('Backend logout failed, clearing local session');
      }

      // Clear local storage
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Restore session from AsyncStorage
   * - Retrieves stored token and user data
   * - Verifies token is still valid by fetching current user
   * - Connects WebSocket if valid
   * - Automatically logs out if token invalid
   */
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (!token || !userJson) {
        set({
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Verify token is still valid by fetching current user
      const response = await authApi.getCurrentUser();
      const userData = response.data.data;

      set({
        user: userData!,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Connect WebSocket after session restored
      const socketStore = getSocketStore();
      if (socketStore) {
        socketStore.getState().connect();
      }
    } catch (error) {
      // Token invalid or expired, clear storage
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please login again.',
      });
    }
  },

  /**
   * Set user without API call
   * - Used when user data updated elsewhere
   * - Does not persist token
   */
  setUser: (user: Auth.User) => {
    set({ user });
  },

  /**
   * Refresh current user data from server
   */
  refreshUser: async () => {
    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data.data;
      set({ user: userData });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
