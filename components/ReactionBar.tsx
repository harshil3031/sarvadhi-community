import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { reactionApi, Reaction } from '../src/api/reaction.api';

interface ReactionBarProps {
  postId: string;
  currentReaction?: string | null;
  reactionCount: number;
  onReactionChange?: () => void;
}

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

export default function ReactionBar({
  postId,
  currentReaction,
  reactionCount,
  onReactionChange,
}: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(currentReaction || null);
  const [count, setCount] = useState(reactionCount);

  const handleReactionPress = async (emoji: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    const previousReaction = userReaction;
    const previousCount = count;

    try {
      if (userReaction === emoji) {
        // Remove reaction (same emoji clicked)
        setUserReaction(null);
        setCount(prev => Math.max(0, prev - 1));
        await reactionApi.removeReaction(postId);
      } else {
        // Add or update reaction
        const wasReacted = userReaction !== null;
        setUserReaction(emoji);
        setCount(prev => wasReacted ? prev : prev + 1);
        await reactionApi.addReaction(postId, { emoji });
      }
      
      // Refresh counts from parent
      onReactionChange?.();
      setShowPicker(false);
    } catch (error: any) {
      // Revert optimistic update on error
      setUserReaction(previousReaction);
      setCount(previousCount);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update reaction');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.reactionButton,
          userReaction && styles.reactionButtonActive,
          pressed && styles.reactionButtonPressed,
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.reactionEmoji}>
          {userReaction || '❤️'}
        </Text>
        <Text style={[styles.reactionCount, userReaction && styles.reactionCountActive]}>
          {count}
        </Text>
      </Pressable>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>React to this post</Text>
            <View style={styles.emojiGrid}>
              {REACTION_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={({ pressed }) => [
                    styles.emojiButton,
                    userReaction === emoji && styles.emojiButtonActive,
                    pressed && styles.emojiButtonPressed,
                  ]}
                  onPress={() => handleReactionPress(emoji)}
                  disabled={isUpdating}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            {userReaction && (
              <Pressable
                style={styles.removeButton}
                onPress={() => handleReactionPress(userReaction)}
                disabled={isUpdating}
              >
                <Text style={styles.removeButtonText}>Remove Reaction</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  reactionButtonActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  reactionButtonPressed: {
    opacity: 0.7,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reactionCountActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  emojiButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  emojiButtonText: {
    fontSize: 28,
  },
  removeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});
