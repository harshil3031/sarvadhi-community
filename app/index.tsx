import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import LoadingScreen from '..//components/LoadingScreen';

/**
 * App Entry Point
 * 
 * This is the first screen shown when the app launches.
 * It handles:
 * 1. Restoring user session from AsyncStorage
 * 2. Validating token with backend (GET /auth/me)
 * 3. Redirecting to appropriate screen based on auth status
 * 
 * Flow:
 * - On launch → restoreSession()
 * - Loading → Show LoadingScreen (no flicker)
 * - Valid token → Redirect to /(tabs)/channels
 * - Invalid/no token → Redirect to /(auth)/login
 */
export default function Index() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    // Restore session on app launch
    // This calls GET /auth/me to verify token
    restoreSession();
  }, []);

  // Show loading screen while checking auth
  // Prevents screen flicker
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/channels" />;
  }

  return <Redirect href="/(auth)/login" />;
}
