import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
// Import widget task handler registration as early as possible
import './widgets/AndroidWidgetEntry';

// Start the app with Expo Router
// This essentially mimics what "expo-router/entry" does, but allows us to pre-register the widget task
import { AppRegistry } from 'react-native';

// Fallback to standard entry if Expo Root isn't directly usable here
// (Usually importing 'expo-router/entry' is simpler but we need strict ordering)
import 'expo-router/entry';
