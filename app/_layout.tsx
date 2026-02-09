// import { useEffect } from 'react';
// import { Stack, useRouter, useSegments } from 'expo-router';
// import { useAuthStore } from '../src/store/auth.store';

// /**
//  * Root Layout
//  * 
//  * Manages navigation between authenticated and unauthenticated routes.
//  * Uses Expo Router's navigation guards to protect routes.
//  */
// export default function RootLayout() {
//   const { isAuthenticated, isLoading } = useAuthStore();
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     // Don't navigate while loading or if segments are empty (not mounted yet)
//     if (isLoading || !segments.length) return;

//     // Get current route group (auth or tabs)
//     const inAuthGroup = segments[0] === '(auth)';

//     // Use setTimeout to ensure navigation happens after the component is mounted
//     const timeoutId = setTimeout(() => {
//       if (!isAuthenticated && !inAuthGroup) {
//         // User not authenticated, redirect to login
//         router.replace('/(auth)/login');
//       } else if (isAuthenticated && inAuthGroup) {
//         // User authenticated but on auth screen, redirect to app
//         router.replace('/(tabs)/channels');
//       }
//     }, 0);

//     return () => clearTimeout(timeoutId);
//   }, [isAuthenticated, isLoading, segments]);

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" />
//       <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//     </Stack>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import Constants from 'expo-constants';
import { Platform, View } from 'react-native';

import { useAuthStore } from '../src/store/auth.store';
import { registerAndroidPushToken, Notification } from '../src/api/notification.api';
import { handleNotificationNavigation } from '../src/utils/notificationNavigation';
import { useNotificationSocket } from '../src/hooks/useNotificationSocket';
import { useNotificationStore } from '../src/store/notification.store';
import { useDMStore } from '../src/store/dm.store';
import NotificationToast from '../components/NotificationToast';

// Detect if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const notificationListener = useRef<any>(null);

  // Real-time notifications
  const { addNotificationListener } = useNotificationSocket();
  const { incrementUnreadCount, fetchUnreadCount } = useNotificationStore();
  const { fetchTotalUnreadCount, incrementUnreadCount: incrementDMUnreadCount } = useDMStore();
  const [activeNotification, setActiveNotification] = useState<Notification.Notification | null>(null);

  /* -------------------- AUTH ROUTING -------------------- */
  useEffect(() => {
    if (isLoading || !segments.length) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timeoutId = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)/channels');
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, segments]);

  /* -------------------- PUSH TOKEN REGISTRATION -------------------- */
  useEffect(() => {
    // Only register push tokens for authenticated users in Dev / Production builds
    // Skip Expo Go and Web (not supported)
    if (!isAuthenticated || isExpoGo || Platform.OS === 'web') return;

    (async () => {
      try {
        const token = await registerAndroidPushToken();
        console.log('Push token registered:', token);
      } catch (err) {
        console.log('Failed to register push token:', err);
      }
    })();
  }, [isAuthenticated]);

  /* -------------------- REAL-TIME NOTIFICATION SOCKET -------------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial unread counts
    fetchUnreadCount();
    fetchTotalUnreadCount();

    // Listen for real-time notifications via socket
    addNotificationListener((notification) => {
      console.log('Received real-time notification:', notification);

      // Update global unread count
      incrementUnreadCount();

      // If it's a DM, also update DM badge
      if (notification.type === 'dm_message') {
        incrementDMUnreadCount();
      }

      // Show in-app toast
      setActiveNotification(notification);
    });
  }, [isAuthenticated, addNotificationListener, incrementUnreadCount, fetchUnreadCount, fetchTotalUnreadCount, incrementDMUnreadCount]);

  /* -------------------- PUSH NOTIFICATION LISTENER -------------------- */
  useEffect(() => {
    if (Platform.OS === 'web') return; // expo-notifications not fully supported on web

    (async () => {
      const Notifications = await import('expo-notifications');

      // Global handler for foreground notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Listener for when user interacts with notification
      notificationListener.current =
        Notifications.addNotificationResponseReceivedListener(response => {
          const data = response.notification.request.content.data;
          handleNotificationNavigation(data);
        });
    })();

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  /* -------------------- LAYOUT STACK -------------------- */
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <NotificationToast
        notification={activeNotification}
        onPress={(notification) => {
          // Handle navigation when toast is tapped
          const navigationData = {
            type: notification.type,
            referenceId: notification.referenceId,
          };
          handleNotificationNavigation(navigationData);
        }}
        onClose={() => setActiveNotification(null)}
      />
    </View>
  );
}
