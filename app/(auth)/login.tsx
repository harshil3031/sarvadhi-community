import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
// import * as AuthSession from 'expo-auth-session';
// import * as Google from 'expo-auth-session/providers/google';
// import Constants from 'expo-constants';
import { useAuthStore } from '../../src/store/auth.store';
import { BaseInput } from '../../src/components/base/BaseInput';
import { useTheme } from '../../src/theme/ThemeContext';

// Prompt user with browser UI
// WebBrowser.maybeCompleteAuthSession();

/**
 * Login Screen
 * 
 * Features:
 * - Email/password authentication
 * - Google OAuth login
 * - Form validation
 * - Loading states
 * - Error display
 * 
 * Navigation handled automatically by root layout based on auth state
 */
export default function LoginScreen() {
  const { login, loginWithGoogle, error, clearError, isLoading: storeLoading } = useAuthStore();
  const { colors } = useTheme();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // const projectNameForProxy = Constants.expoConfig?.owner && Constants.expoConfig?.slug
  //   ? `@${Constants.expoConfig.owner}/${Constants.expoConfig.slug}`
  //   : undefined;
  // const useProxy = Constants.appOwnership === 'expo' && !!projectNameForProxy;
  // const redirectUri = AuthSession.makeRedirectUri({
  //   scheme: 'sarvadhicommunity',
  //   path: 'auth',
  // });

  // // Google Auth setup - for Expo Go, only expoClientId is needed
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  //   iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
  //   androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
  // });

  // // Handle Google auth response
  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication, params } = response;
  //     const idToken = authentication?.idToken ?? (params as { id_token?: string })?.id_token;
  //     if (idToken) {
  //       handleGoogleLoginWithToken(idToken);
  //     } else {
  //       Alert.alert('Google Sign In Failed', 'No ID token returned from Google');
  //     }
  //   }
  // }, [response]);

  // Validate form
  const validateForm = (): boolean => {
    setValidationError('');
    
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email');
      return false;
    }

    if (!email.toLowerCase().endsWith('@sarvadhi.com')) {
      setValidationError('Email must be from @sarvadhi.com domain');
      return false;
    }
    
    if (!password) {
      setValidationError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  // Handle email/password login
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      clearError();
      
      await login(email.trim(), password);
      
      // Success - navigation handled automatically by root layout
      // No manual router.push needed
      router.push('/profile'); // Optional: can navigate to profile or just rely on root layout
      
    } catch (err: any) {
      // Error already in store.error
      console.error('[LoginScreen] Error caught:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.data?.message ||
                          err?.message || 
                          'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // // Handle Google login with token
  // const handleGoogleLoginWithToken = async (idToken: string) => {
  //   try {
  //     setIsLoading(true);
  //     clearError();
  //     
  //     // Send ID token to backend for verification
  //     await loginWithGoogle(idToken);
  //     // Success - navigation handled automatically by root layout
  //     
  //   } catch (error: any) {
  //     const errorMessage = error?.message || 'Google sign in failed';
  //     Alert.alert('Google Sign In Failed', errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Trigger Google auth flow
  // const handleGoogleLogin = async () => {
  //   try {
  //     const result = await promptAsync({
  //       useProxy,
  //       projectNameForProxy,
  //     });
  //     if (result?.type !== 'success') {
  //       console.log('Google sign in cancelled or failed');
  //     }
  //   } catch (error: any) {
  //     const errorMessage = error?.message || 'Could not start Google sign in';
  //     Alert.alert('Google Sign In Error', errorMessage);
  //   }
  // };

  const isButtonDisabled = isLoading || storeLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue to Sarvadhi Community</Text>
          </View>

          {/* Error Messages */}
          {(error || validationError) && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {validationError || error}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <BaseInput
              label="Email"
              containerStyle={{ marginBottom: 0 }}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError('');
                clearError();
              }}
              keyboardType="email-address"
              editable={!isButtonDisabled}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <BaseInput
              label="Password"
              containerStyle={{ marginBottom: 0 }}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationError('');
                clearError();
              }}
              secureTextEntry
              editable={!isButtonDisabled}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.surface }]}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          {/* <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View> */}

          {/* Google Login Button */}
          {/* <TouchableOpacity
            style={[styles.button, styles.googleButton, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isButtonDisabled}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity> */}

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={isButtonDisabled}>
                <Text style={[styles.link, { color: colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
