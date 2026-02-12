import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  Image,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { useAuthStore } from '../../src/store/auth.store';
import { authApi } from '../../src/api/auth';
import { notificationApi } from '../../src/api/notification.api';
import Toast from 'react-native-toast-message';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { BaseInput } from '../../src/components/base/BaseInput';

interface ProfileFieldProps {
  icon: string;
  label: string;
  value: string | undefined;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.fieldValue, { color: colors.text }]}>
        {value || 'N/A'}
      </Text>
    </View>
  );
}

function RoleBadge({ role }: { role?: string }) {
  const { colors } = useTheme();
  
  const getRoleColor = () => {
    if (!role) return colors.textSecondary;
    switch (role) {
      case 'admin':
        return colors.error;
      case 'moderator':
        return colors.warning;
      case 'employee':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getRoleLabel = () => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <View
      style={[
        styles.roleBadge,
        { backgroundColor: getRoleColor() + '20' },
      ]}
    >
      <Text
        style={[
          styles.roleBadgeText,
          { color: getRoleColor() },
        ]}
      >
        {getRoleLabel()}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading, refreshUser } = useAuthStore();
  const { colors } = useTheme();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(user?.fullName || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [isSendingTestPush, setIsSendingTestPush] = useState(false);

  // Refresh user data when screen mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await refreshUser();
        console.log('Profile - User data loaded:', user);
      } catch (error) {
        console.error('Profile - Failed to refresh user:', error);
      }
    };
    loadUserData();
  }, []);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        console.log('Camera or library permissions not granted');
      }
    })();
  }, []);

  const loadDeviceContacts = async () => {
    try {
      setLoadingContacts(true);
      
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant contacts permission to import contacts from your device.'
        );
        return;
      }

      // Get all contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data.length > 0) {
        setDeviceContacts(data);
        setShowContacts(true);
      } else {
        Alert.alert('No Contacts', 'No contacts found on this device.');
      }
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setLoadingContacts(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const uploadToCloudinary = async (uri: string): Promise<string> => {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    }

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleImageUpload = async (source: 'camera' | 'gallery') => {
    try {
      setUploadingImage(true);

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(imageUri);
        
        // Update profile with new photo URL
        await authApi.updateProfile({ avatar: cloudinaryUrl });
        
        Alert.alert('Success', 'Profile photo uploaded successfully!');
        await refreshUser();
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImageUpload('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleImageUpload('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              // Navigation will be handled by root layout based on auth state
            } catch (err) {
              setIsLoggingOut(false);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSendTestPush = async () => {
    if (isSendingTestPush) return;
    setIsSendingTestPush(true);
    try {
      await notificationApi.sendTestPush('Test Notification', 'This is a test push from Profile');
      Toast.show({
        type: 'success',
        text1: 'Sent',
        text2: 'Test push notification sent',
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to send test push',
        visibilityTime: 3000,
      });
    } finally {
      setIsSendingTestPush(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={showImagePickerOptions}
          disabled={uploadingImage}
        >
          <View style={styles.avatar}>
            {user.profilePhotoUrl ? (
              <Image 
                source={{ uri: user.profilePhotoUrl }} 
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={40} color="#2563EB" />
            )}
          </View>
          <View style={styles.cameraIconContainer}>
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={16} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.fullName || 'User'}
          </Text>

          <TouchableOpacity
            onPress={() => {
              setFullNameInput(user.fullName || '');
              setEditNameVisible(true);
            }}
          >
            <Ionicons name="pencil" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>


        <RoleBadge role={user.role} />
      </View>

      {/* Profile Information Section */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Account Information
        </Text>

        <ProfileField
          icon="person-outline"
          label="Full Name"
          value={user.fullName || 'N/A'}
        />

        <ProfileField
          icon="mail-outline"
          label="Email"
          value={user.email || 'N/A'}
        />

        <ProfileField
          icon="shield-checkmark-outline"
          label="Role"
          value={user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
        />

        <ProfileField
          icon="key-outline"
          label="Auth Provider"
          value={
            user.authProvider === 'local' ? 'Email & Password' : 'Google'
          }
        />

        <ProfileField
          icon="calendar-outline"
          label="Member Since"
          value={formatDate(user.createdAt)}
        />
      </View>

      {/* Device Contacts Section */}
      <View style={styles.contactsSection}>
        <TouchableOpacity
          onPress={loadDeviceContacts}
          disabled={loadingContacts}
          style={[styles.contactsButton, loadingContacts && styles.contactsButtonDisabled]}
        >
          {loadingContacts ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <>
              <Ionicons name="people-outline" size={20} color="#2563EB" />
              <Text style={styles.contactsButtonText}>Import Device Contacts</Text>
            </>
          )}
        </TouchableOpacity>
        
        {deviceContacts.length > 0 && (
          <Text style={[styles.contactsCount, { color: colors.textSecondary }]}>
            {deviceContacts.length} contacts loaded
          </Text>
        )}
      </View>

      {/* Test Push Section */}
      <View style={styles.testPushSection}>
        <TouchableOpacity
          onPress={handleSendTestPush}
          disabled={isSendingTestPush}
          style={[styles.testPushButton, isSendingTestPush && styles.testPushButtonDisabled]}
        >
          {isSendingTestPush ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <>
              <Ionicons name="notifications-outline" size={20} color="#2563EB" />
              <Text style={styles.testPushButtonText}>Send Test Push</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <View style={[styles.helpSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          Need help? Contact support at support@sarvadhi.com
        </Text>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          App Version 1.0.0
        </Text>
      </View>

      {/* Contacts Modal */}
      <Modal
        visible={showContacts}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContacts(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Device Contacts ({deviceContacts.length})
              </Text>
              <TouchableOpacity onPress={() => setShowContacts(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={deviceContacts}
              keyExtractor={(item, index) => `contact-${index}`}
              renderItem={({ item }) => (
                <View style={[styles.contactItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.contactAvatar}>
                    {item.imageAvailable && item.image ? (
                      <Image 
                        source={{ uri: item.image.uri }} 
                        style={styles.contactAvatarImage}
                      />
                    ) : (
                      <Ionicons name="person-circle-outline" size={40} color={colors.textSecondary} />
                    )}
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text }]}>
                      {item.name || 'No Name'}
                    </Text>
                    {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                      <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                        📱 {item.phoneNumbers[0].number}
                      </Text>
                    )}
                    {item.emails && item.emails.length > 0 && (
                      <Text style={[styles.contactEmail, { color: colors.textSecondary }]}>
                        ✉️ {item.emails[0].email}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No contacts found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={editNameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditNameVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editModalOverlay}
        >
          <View style={[styles.editModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>
              Update Full Name
            </Text>

            <BaseInput
              containerStyle={styles.inputWrapper}
              value={fullNameInput}
              onChangeText={setFullNameInput}
              placeholder="Enter full name"
              autoFocus
              inputWrapperStyle={{ borderRadius: 8 }}
              inputTextStyle={{ color: colors.text }}
            />

            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => setEditNameVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={updatingName || !fullNameInput.trim()}
                onPress={async () => {
                  try {
                    setUpdatingName(true);
                    await authApi.updateProfile({ fullName: fullNameInput.trim() });
                    await refreshUser();
                    setEditNameVisible(false);
                  } catch {
                    Alert.alert('Error', 'Failed to update name');
                  } finally {
                    setUpdatingName(false);
                  }
                }}
                style={[
                  styles.saveBtn,
                  (!fullNameInput.trim() || updatingName) && { opacity: 0.6 },
                ]}
              >
                {updatingName ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height - 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  fieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 28,
  },
  contactsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  contactsButton: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  contactsButtonDisabled: {
    opacity: 0.6,
  },
  contactsButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsCount: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  testPushSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  testPushButton: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  testPushButtonDisabled: {
    opacity: 0.6,
  },
  testPushButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  contactAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModal: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

});
