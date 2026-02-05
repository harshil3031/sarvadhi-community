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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { useAuthStore } from '../../src/store/auth.store';
import { authApi } from '../../src/api/auth';
import { Colors } from '../../constants/theme';

const ProfileScreenColors = {
  light: {
    background: '#f9fafb',
    cardBackground: '#fff',
    text: '#000',
    mutedText: '#666',
    border: '#ddd',
    danger: '#ef4444',
  },
  dark: {
    background: '#0a0a0a',
    cardBackground: '#1a1a1a',
    text: '#fff',
    mutedText: '#aaa',
    border: '#333',
    danger: '#f87171',
  },
};

interface ProfileFieldProps {
  icon: string;
  label: string;
  value: string | undefined;
  colors: typeof ProfileScreenColors['light'];
}

function ProfileField({ icon, label, value, colors }: ProfileFieldProps) {
  return (
    <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon as any} size={20} color="#2563EB" />
        <Text style={[styles.fieldLabel, { color: colors.mutedText }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.fieldValue, { color: colors.text }]}>
        {value || 'N/A'}
      </Text>
    </View>
  );
}

function RoleBadge({ role, colors }: { role?: string; colors: typeof ProfileScreenColors['light'] }) {
  const getRoleColor = () => {
    if (!role) return '#6b7280';
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'moderator':
        return '#ea580c';
      case 'employee':
        return '#0891b2';
      default:
        return '#6b7280';
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
  const colorScheme = useColorScheme();
  const colors = ProfileScreenColors[colorScheme ?? 'light'] as typeof ProfileScreenColors['light'];

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Refresh user data when screen mounts
  useEffect(() => {
    refreshUser();
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

  if (!user) {
    return (
      <View
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
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={[styles.headerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
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

        <Text style={[styles.userName, { color: colors.text }]}>  
          {user.fullName || 'User'}
        </Text>

        <RoleBadge role={user.role} colors={colors} />

        <Text style={[styles.userEmail, { color: colors.mutedText }]}>
          {user.email || 'No email'}
        </Text>
      </View>

      {/* Profile Information Section */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Account Information
        </Text>

        <ProfileField
          icon="person-outline"
          label="Full Name"
          value={user.fullName || 'N/A'}
          colors={colors}
        />

        <ProfileField
          icon="mail-outline"
          label="Email"
          value={user.email || 'N/A'}
          colors={colors}
        />

        <ProfileField
          icon="shield-checkmark-outline"
          label="Role"
          value={user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
          colors={colors}
        />

        <ProfileField
          icon="key-outline"
          label="Auth Provider"
          value={
            user.authProvider === 'local' ? 'Email & Password' : 'Google'
          }
          colors={colors}
        />

        <ProfileField
          icon="calendar-outline"
          label="Member Since"
          value={formatDate(user.createdAt)}
          colors={colors}
        />

        <View style={[styles.fieldContainer]}>
          <View style={styles.fieldHeader}>
            <Ionicons name="barcode-outline" size={20} color="#2563EB" />
            <Text style={[styles.fieldLabel, { color: colors.mutedText }]}>
              User ID
            </Text>
          </View>
          <Text
            style={[styles.fieldValue, { color: colors.text, fontFamily: 'Menlo' }]}
            numberOfLines={1}
          >
            {user.id}
          </Text>
        </View>
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
          <Text style={[styles.contactsCount, { color: colors.mutedText }]}>
            {deviceContacts.length} contacts loaded
          </Text>
        )}
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
        <Text style={[styles.helpText, { color: colors.mutedText }]}>
          Need help? Contact support at support@sarvadhi.com
        </Text>
        <Text style={[styles.versionText, { color: colors.mutedText }]}>
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
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
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
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={[styles.contactItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.contactAvatar}>
                    {item.imageAvailable && item.image ? (
                      <Image 
                        source={{ uri: item.image.uri }} 
                        style={styles.contactAvatarImage}
                      />
                    ) : (
                      <Ionicons name="person-circle-outline" size={40} color={colors.mutedText} />
                    )}
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text }]}>
                      {item.name || 'No Name'}
                    </Text>
                    {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                      <Text style={[styles.contactPhone, { color: colors.mutedText }]}>
                        📱 {item.phoneNumbers[0].number}
                      </Text>
                    )}
                    {item.emails && item.emails.length > 0 && (
                      <Text style={[styles.contactEmail, { color: colors.mutedText }]}>
                        ✉️ {item.emails[0].email}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                    No contacts found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
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
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
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
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
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
    fontSize: 16,
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
});
