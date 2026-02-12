#!/usr/bin/env node

/**
 * Reset Onboarding Script
 * 
 * This script helps you test the onboarding flow by clearing the AsyncStorage flag.
 * 
 * Run this to see the onboarding screens again:
 * node scripts/reset-onboarding.js
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║                   RESET ONBOARDING FLAG                    ║
╚════════════════════════════════════════════════════════════╝

To test the onboarding flow, you need to clear the app's storage.

📱 iOS Simulator:
   1. Press Cmd+Shift+H (go to home)
   2. Long press the app icon
   3. Tap "Remove App" → "Delete App"
   4. Rebuild: npx expo run:ios

📱 Android Emulator:
   1. Long press the app icon
   2. Tap "App info"
   3. Tap "Storage & cache"
   4. Tap "Clear storage"
   5. Reopen the app

📱 Physical Device:
   1. Uninstall the app
   2. Rebuild: npx expo run:ios or npx expo run:android

Or run this command in your app's code (temporary):
   AsyncStorage.removeItem('onboarding_completed');

✨ After clearing storage, you'll see:
   1. Animated splash screen (2.5 seconds)
   2. Four onboarding slides
   3. "Get Started" button → Login screen

════════════════════════════════════════════════════════════

Check console logs in your app to debug:
   🔍 Onboarding status: null (first time) or 'true' (seen)
   ✨ First time user - showing onboarding
   🔐 User not authenticated - going to login

`);
