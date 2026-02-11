/**
 * EditProfileScreen - Edit user profile information
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { ScreenContainer } from '../components/base/ScreenContainer';
import { Avatar } from '../components/common/Avatar';
import { BaseInput } from '../components/base/BaseInput';
import { BaseButton } from '../components/base/BaseButton';

export const EditProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const [name, setName] = useState('John Doe');
  const [role, setRole] = useState('Senior Product Manager');
  const [email, setEmail] = useState('john.doe@company.com');
  const [bio, setBio] = useState('Product manager passionate about building great user experiences.');

  const handleSave = () => {
    // Save logic here
    console.log('Profile saved');
  };

  const styles = StyleSheet.create({
    scrollContent: {
      paddingBottom: Spacing.xl,
    },
    header: {
      alignItems: 'center',
      paddingVertical: Spacing.lg,
    },
    changePhotoButton: {
      marginTop: Spacing.md,
    },
    changePhotoText: {
      ...Typography.body,
      color: colors.primary,
    },
    formContainer: {
      marginTop: Spacing.lg,
    },
    buttonContainer: {
      marginTop: Spacing.lg,
    },
  });

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar size="xl" initials="JD" />
          <TouchableOpacity style={styles.changePhotoButton} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <BaseInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <BaseInput
            label="Role"
            value={role}
            onChangeText={setRole}
            placeholder="Enter your role"
          />

          <BaseInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <BaseInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            maxLength={200}
          />
        </View>

        <View style={styles.buttonContainer}>
          <BaseButton
            label="Save Changes"
            variant="primary"
            fullWidth
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
