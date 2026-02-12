import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../src/theme/ThemeContext';
import SplashScreen from './SplashScreen';

/**
 * Loading Screen Component
 * 
 * Displayed during authentication check on app launch.
 * Shows beautiful animated splash screen while loading.
 */
export default function LoadingScreen() {
  const { colors } = useTheme();
  
  // Use the animated splash screen for better UX
  return <SplashScreen />;
  
  // Fallback simple loading (uncomment if you prefer simple loading)
  // return (
  //   <View style={[styles.container, { backgroundColor: colors.background }]}>
  //     <ActivityIndicator size="large" color={colors.primary} />
  //     <Text style={[styles.text, { color: colors.textSecondary }]}>Loading...</Text>
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
