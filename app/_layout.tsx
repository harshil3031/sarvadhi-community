import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';

/**
 * Root Layout
 * 
 * Manages navigation between authenticated and unauthenticated routes.
 * Uses Expo Router's navigation guards to protect routes.
 */
export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't navigate while loading or if segments are empty (not mounted yet)
    if (isLoading || !segments.length) return;

    // Get current route group (auth or tabs)
    const inAuthGroup = segments[0] === '(auth)';

    // Use setTimeout to ensure navigation happens after the component is mounted
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        // User not authenticated, redirect to login
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        // User authenticated but on auth screen, redirect to app
        router.replace('/(tabs)/channels');
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
