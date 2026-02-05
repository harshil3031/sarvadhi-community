import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useAuthStore } from '../../src/store/auth.store';

// Prompt user with browser UI
WebBrowser.maybeCompleteAuthSession();

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
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const projectNameForProxy = Constants.expoConfig?.owner && Constants.expoConfig?.slug
    ? `@${Constants.expoConfig.owner}/${Constants.expoConfig.slug}`
    : undefined;
  const useProxy = Constants.appOwnership === 'expo' && !!projectNameForProxy;
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'sarvadhicommunity',
    path: 'auth',
  });

  // Google Auth setup - for Expo Go, only expoClientId is needed
  const googleConfig: any = {
    expoClientId: '24980858525-fpjqqn80c54ee7gkecb6hesoalc3q9c9.apps.googleusercontent.com',
    // For Expo Go on Android, use this with package: host.exp.exponent and SHA-1: 9C:5C:1A:1F:48:B1:D7:97:15:5E:2F:C3:1B:1E:96:7C:7F:2E:94:37
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '24980858525-keak2hradb58ul46q18rmrc808s071qa.apps.googleusercontent.com',
    responseType: AuthSession.ResponseType.IdToken,
    redirectUri,
    scopes: ['profile', 'email'],
  };

  // Add iOS client ID if NOT in Expo Go (for dev builds/standalone)
  if (Constants.appOwnership !== 'expo' && process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
    googleConfig.iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  }

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication, params } = response;
      const idToken = authentication?.idToken ?? (params as { id_token?: string })?.id_token;
      if (idToken) {
        handleGoogleLoginWithToken(idToken);
      } else {
        Alert.alert('Google Sign In Failed', 'No ID token returned from Google');
      }
    }
  }, [response]);

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
      
    } catch (err: any) {
      // Error already in store.error
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login with token
  const handleGoogleLoginWithToken = async (idToken: string) => {
    try {
      setIsLoading(true);
      clearError();
      
      // Send ID token to backend for verification
      await loginWithGoogle(idToken);
      // Success - navigation handled automatically by root layout
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Google sign in failed';
      Alert.alert('Google Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Google auth flow
  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync({
        useProxy,
        projectNameForProxy,
      });
      if (result?.type !== 'success') {
        console.log('Google sign in cancelled or failed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Could not start Google sign in';
      Alert.alert('Google Sign In Error', errorMessage);
    }
  };

  const isButtonDisabled = isLoading || storeLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Sarvadhi Community</Text>
          </View>

          {/* Error Messages */}
          {(error || validationError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {validationError || error}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError('');
                clearError();
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isButtonDisabled}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationError('');
                clearError();
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isButtonDisabled}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.googleButton, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isButtonDisabled}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={isButtonDisabled}>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
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
    backgroundColor: '#dddddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  googleButtonText: {
    color: '#000000',
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
    color: '#666666',
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
