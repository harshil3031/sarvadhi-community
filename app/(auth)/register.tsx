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
  Image,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
// import * as AuthSession from 'expo-auth-session';
// import * as Google from 'expo-auth-session/providers/google';
// import Constants from 'expo-constants';
import { useAuthStore } from '../../src/store/auth.store';

// Prompt user with browser UI
// WebBrowser.maybeCompleteAuthSession();

/**
 * Register Screen
 * 
 * Features:
 * - Email/password registration
 * - Google OAuth registration
 * - Form validation
 * - Loading states
 * - Error display
 * 
 * Navigation handled automatically by root layout based on auth state
 */
export default function RegisterScreen() {
  const { register, loginWithGoogle, error, clearError, isLoading: storeLoading } = useAuthStore();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  // const googleConfig: any = {
  //   expoClientId: '24980858525-fpjqqn80c54ee7gkecb6hesoalc3q9c9.apps.googleusercontent.com',
  //   // For Expo Go on Android, use this with package: host.exp.exponent and SHA-1: 9C:5C:1A:1F:48:B1:D7:97:15:5E:2F:C3:1B:1E:96:7C:7F:2E:94:37
  //   androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'CREATE_ANDROID_CLIENT_IN_GOOGLE_CLOUD',
  //   responseType: AuthSession.ResponseType.IdToken,
  //   redirectUri,
  //   scopes: ['profile', 'email'],
  // };

  // // Add iOS client ID if NOT in Expo Go (for dev builds/standalone)
  // if (Constants.appOwnership !== 'expo' && process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
  //   googleConfig.iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  // }

  // const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  // // Handle Google auth response
  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication, params } = response;
  //     const idToken = authentication?.idToken ?? (params as { id_token?: string })?.id_token;
  //     if (idToken) {
  //       handleGoogleRegisterWithToken(idToken);
  //     } else {
  //       Alert.alert('Google Sign Up Failed', 'No ID token returned from Google');
  //     }
  //   }
  // }, [response]);

  // Validate form
  const validateForm = (): boolean => {
    setValidationError('');
    
    if (!fullName.trim()) {
      setValidationError('Full name is required');
      return false;
    }
    
    if (fullName.trim().length < 2) {
      setValidationError('Full name must be at least 2 characters');
      return false;
    }
    
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
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      clearError();
      
      await register(fullName.trim(), email.trim(), password);
      
      // Success - navigation handled automatically by root layout
      // User is automatically logged in after registration
      
    } catch (err: any) {
      // Error already in store.error
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // // Handle Google registration with token
  // const handleGoogleRegisterWithToken = async (idToken: string) => {
  //   try {
  //     setIsLoading(true);
  //     clearError();
  //     
  //     // Call loginWithGoogle which will handle registration via backend
  //     await loginWithGoogle(idToken);

  //     // Success - navigation handled automatically by root layout
  //   } catch (err: any) {
  //     const errorMessage = err?.message || 'Could not sign up with Google';
  //     Alert.alert('Google Sign Up Failed', errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Trigger Google auth flow
  // const handleGoogleRegister = async () => {
  //   try {
  //     const result = await promptAsync({
  //       useProxy,
  //       projectNameForProxy,
  //     });
  //     if (result?.type !== 'success') {
  //       console.log('Google sign up cancelled or failed');
  //     }
  //   } catch (error: any) {
  //     const errorMessage = error?.message || 'Could not start Google sign up';
  //     Alert.alert('Google Sign Up Error', errorMessage);
  //   }
  // };

  const isButtonDisabled = isLoading || storeLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Sarvadhi Community today</Text>
          </View>

          {/* Error Messages */}
          {(error || validationError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {validationError || error}
              </Text>
            </View>
          )}

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setValidationError('');
                clearError();
              }}
              editable={!isButtonDisabled}
            />
          </View>

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
              keyboardType="email-address"
              editable={!isButtonDisabled}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password (min 6 characters)"
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

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setValidationError('');
                clearError();
              }}
              secureTextEntry
              editable={!isButtonDisabled}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          {/* <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View> */}

          {/* Google Register Button */}
          {/* <TouchableOpacity
            style={[styles.button, styles.googleButton, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleGoogleRegister}
            disabled={isButtonDisabled}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity> */}

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity disabled={isButtonDisabled}>
                <Text style={styles.link}>Sign In</Text>
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
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
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
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
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
    color: '#2563EB',
    fontWeight: '600',
  },
});
