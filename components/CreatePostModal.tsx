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
import { Channel } from '../src/api/channels';
import { postApi, Post } from '../src/api/posts';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  channelId?: string;
  groupId?: string;
  availableChannels?: Channel.Channel[];
  onPostCreated?: (post: Post.Post) => void;
}

export default function CreatePostModal({
  visible,
  onClose,
  channelId,
  groupId,
  availableChannels = [],
  onPostCreated,
}: CreatePostModalProps) {
  // Default to passed channelId, or first available channel
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>(
    channelId || (availableChannels.length > 0 ? availableChannels[0].id : undefined)
  );

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selected channel if props change
  React.useEffect(() => {
    if (channelId) {
      setSelectedChannelId(channelId);
    } else if (availableChannels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(availableChannels[0].id);
    }
  }, [channelId, availableChannels]);

  const handleSubmit = async () => {
    // Validation
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    if (!selectedChannelId && !groupId) {
      setError('Please select a channel to post in');
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
        channelId: selectedChannelId,
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
      console.error(err);
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

  const showChannelSelector = !groupId && availableChannels.length > 0;

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

          {/* Channel Selector */}
          {showChannelSelector && (
            <View style={styles.channelSelector}>
              <Text style={styles.channelLabel}>Posting to:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.channelScroll}>
                {availableChannels.map((channel) => (
                  <Pressable
                    key={channel.id}
                    style={[
                      styles.channelChip,
                      selectedChannelId === channel.id && styles.channelChipSelected
                    ]}
                    onPress={() => setSelectedChannelId(channel.id)}
                  >
                    <Text
                      style={[
                        styles.channelChipText,
                        selectedChannelId === channel.id && styles.channelChipTextSelected
                      ]}
                    >
                      # {channel.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
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
  channelSelector: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  channelLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  channelScroll: {
    paddingBottom: 4,
  },
  channelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  channelChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  channelChipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  channelChipTextSelected: {
    color: '#2563EB',
  },
});
