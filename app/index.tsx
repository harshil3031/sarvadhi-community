import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '../components/LoadingScreen';
import { STORAGE_KEYS } from '@/config/constants';
import { useAuthStore } from '../src/store/auth.store';

/**
 * ONBOARDING ENTRY POINT
 * 
 * This is the FIRST screen shown when app launches.
 * It controls ONLY:
 * 1. Splash screen (1.2 seconds)
 * 2. Onboarding check (first time user?)
 * 3. Route to onboarding OR auth flow
 */
export default function Index() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useAuthStore();

  // STEP 1: Show splash for 3 seconds
  useEffect(() => {
    console.log('🎬 SPLASH: Starting 3-second splash...');
    const timer = setTimeout(() => {
      console.log('🎬 SPLASH: Done, hiding splash');
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // STEP 2: Check onboarding status - ONLY THIS
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        console.log('📋 ONBOARDING: Storage value =', completed);

        // Set to true if completed, false otherwise (including null)
        setHasSeenOnboarding(completed === 'true');
        console.log('📋 ONBOARDING: State set to', completed === 'true');
      } catch (error) {
        console.error('❌ ONBOARDING: Check failed', error);
        setHasSeenOnboarding(false);
      }
    };

    // Check immediately when component mounts
    checkOnboarding();
  }, []);

  // RENDERING LOGIC
  // 1. If splash is showing, show LoadingScreen
  if (showSplash) {
    console.log('⏳ RENDER: Showing splash...');
    return <LoadingScreen />;
  }

  // 2. If onboarding status is still being checked, show loading
  if (hasSeenOnboarding === null) {
    console.log('⏳ RENDER: Checking onboarding status...');
    return <LoadingScreen />;
  }

  // 3. If first time user (NOT seen onboarding), show onboarding
  if (hasSeenOnboarding === false) {
    console.log('📱 RENDER: Showing ONBOARDING');
    return <Redirect href="/onboarding" />;
  }

  // 4. If already seen onboarding, check auth status
  if (hasSeenOnboarding === true) {
    if (isAuthenticated) {
      console.log('✅ RENDER: Authenticated, routing to feed...');
      return <Redirect href="/(tabs)/channels" />;
    } else {
      console.log('🔒 RENDER: Not authenticated, routing to login...');
      return <Redirect href="/(auth)/login" />;
    }
  }

  // Fallback (should never reach here)
  console.log('⚠️ RENDER: Fallback route');
  return <LoadingScreen />;
}
