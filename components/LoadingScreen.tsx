import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../src/theme/ThemeContext';

/**
 * Loading Screen Component
 * 
 * Displayed during authentication check on app launch.
 * Prevents screen flicker by showing a consistent loading state.
 */
export default function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>Loading...</Text>
    </View>
  );
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
