import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

/**
 * Loading Screen Component
 * 
 * Displayed during authentication check on app launch.
 * Prevents screen flicker by showing a consistent loading state.
 */
export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
