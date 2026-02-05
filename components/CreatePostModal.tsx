import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { postApi, Post } from '../src/api/posts';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  channelId?: string;
  groupId?: string;
  onPostCreated?: (post: Post.Post) => void;
}

export default function CreatePostModal({
  visible,
  onClose,
  channelId,
  groupId,
  onPostCreated,
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validation
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    if (content.length > 5000) {
      setError('Post content is too long (max 5000 characters)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await postApi.createPost({
        content: content.trim(),
        channelId,
        groupId,
      });

      if (response.data.success && response.data.data) {
        // Call the callback with the new post
        onPostCreated?.(response.data.data);
        
        // Reset and close
        setContent('');
        onClose();
        
        Alert.alert('Success', 'Post created successfully!');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create post';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={handleClose} disabled={isSubmitting}>
            <Text style={[styles.headerButton, isSubmitting && styles.disabled]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Pressable onPress={handleSubmit} disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text
                style={[
                  styles.headerButton,
                  styles.postButton,
                  (!content.trim() || isSubmitting) && styles.disabled,
                ]}
              >
                Post
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => setError(null)}>
                <Text style={styles.errorDismiss}>✕</Text>
              </Pressable>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={5000}
            value={content}
            onChangeText={(text) => {
              setContent(text);
              setError(null);
            }}
            autoFocus
            editable={!isSubmitting}
          />

          <Text style={styles.characterCount}>
            {content.length} / 5000
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
    minWidth: 60,
  },
  postButton: {
    fontWeight: '600',
    textAlign: 'right',
  },
  disabled: {
    opacity: 0.4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
});
