import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { reactionApi } from '../src/api/reaction.api';

interface ReactionBarProps {
  postId: string;
  currentReaction?: string | null;
  reactionCount: number;
  onReactionChange?: () => void;
}

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

const EMOJI_SIZE = 48;
const EMOJI_GAP = 8;
const POPOVER_PADDING = 12;
const SCREEN_PADDING = 12;

export default function ReactionBar({
  postId,
  currentReaction,
  reactionCount,
  onReactionChange,
}: ReactionBarProps) {
  const buttonRef = useRef<View>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(
    currentReaction || null
  );
  const [count, setCount] = useState(reactionCount);

  const [anchor, setAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [popoverHeight, setPopoverHeight] = useState(0);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const { width: screenWidth } = Dimensions.get('window');

  /* ------------------ POPOVER WIDTH (AUTO) ------------------ */
  const contentWidth =
    REACTION_EMOJIS.length * EMOJI_SIZE +
    (REACTION_EMOJIS.length - 1) * EMOJI_GAP +
    POPOVER_PADDING * 2;

  const POPOVER_WIDTH = Math.min(
    contentWidth,
    screenWidth - SCREEN_PADDING * 2
  );

  /* ------------------ MEASURE BUTTON ------------------ */
  const measureButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setShowPicker(true);
    });
  };

  /* ------------------ REACTION HANDLER ------------------ */
  const handleReactionPress = async (emoji: string) => {
    if (isUpdating) return;

    Haptics.selectionAsync();
    setIsUpdating(true);

    const prevReaction = userReaction;
    const prevCount = count;

    try {
      if (userReaction === emoji) {
        setUserReaction(null);
        setCount(prev => Math.max(0, prev - 1));
        await reactionApi.removeReaction(postId);
      } else {
        const wasReacted = userReaction !== null;
        setUserReaction(emoji);
        setCount(prev => (wasReacted ? prev : prev + 1));
        await reactionApi.addReaction(postId, { emoji });
      }

      onReactionChange?.();
      setShowPicker(false);
    } catch {
      setUserReaction(prevReaction);
      setCount(prevCount);
      Alert.alert('Error', 'Failed to update reaction');
    } finally {
      setIsUpdating(false);
    }
  };

  /* ------------------ OPEN ANIMATION ------------------ */
  useEffect(() => {
    if (showPicker) {
      scale.setValue(0.9);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPicker]);

  /* ------------------ POSITION ------------------ */
  const popoverStyle = anchor
    ? (() => {
        const centerX = anchor.x + anchor.width / 2;

        const left = Math.min(
          screenWidth - POPOVER_WIDTH - SCREEN_PADDING,
          Math.max(SCREEN_PADDING, centerX - POPOVER_WIDTH / 2)
        );

        const aboveTop = anchor.y - popoverHeight - 10;
        const top =
          aboveTop > SCREEN_PADDING
            ? aboveTop
            : anchor.y + anchor.height + 10;

        return { top, left };
      })()
    : { top: 0, left: 0 };

  /* ------------------ ARROW POSITION ------------------ */
  const arrowLeft = anchor
    ? Math.min(
        POPOVER_WIDTH - 24,
        Math.max(
          24,
          anchor.x + anchor.width / 2 - popoverStyle.left
        )
      )
    : POPOVER_WIDTH / 2;

  /* ------------------ MEASURE HEIGHT ------------------ */
  const onPopoverLayout = (e: LayoutChangeEvent) => {
    setPopoverHeight(e.nativeEvent.layout.height);
  };

  return (
    <View style={styles.container}>
      <Pressable
        ref={buttonRef}
        style={({ pressed }) => [
          styles.reactionButton,
          userReaction && styles.reactionButtonActive,
          pressed && styles.reactionButtonPressed,
        ]}
        onPress={() => {
          if (userReaction) {
            handleReactionPress(userReaction);
          }
        }}
        onLongPress={measureButton}
        delayLongPress={200}
      >
        {userReaction ? (
          <>
            <Text style={styles.reactionEmoji}>{userReaction}</Text>
            <Text style={styles.reactionCountActive}>{count}</Text>
          </>
        ) : (
          <>
            <Text style={styles.reactionEmoji}>🤍</Text>
            <Text style={styles.reactionCount}>React</Text>
          </>
        )}
      </Pressable>

      <Modal transparent visible={showPicker} animationType="none">
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <Animated.View
            onLayout={onPopoverLayout}
            style={[
              styles.popover,
              { width: POPOVER_WIDTH },
              popoverStyle,
              { opacity, transform: [{ scale }] },
            ]}
          >
            <View style={styles.emojiRow}>
              {REACTION_EMOJIS.map(emoji => {
                const isHovered = hoveredEmoji === emoji;

                return (
                  <Pressable
                    key={emoji}
                    onPressIn={() => {
                      setHoveredEmoji(emoji);
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                      );
                    }}
                    onPressOut={() => setHoveredEmoji(null)}
                    onPress={() => handleReactionPress(emoji)}
                    style={[
                      styles.emojiButton,
                      isHovered && styles.emojiHover,
                      hoveredEmoji && !isHovered && styles.emojiDim,
                    ]}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>

            {userReaction && (
              <Pressable
                style={styles.removeButton}
                onPress={() => handleReactionPress(userReaction)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}

            <View style={[styles.arrow, { left: arrowLeft }]} />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },

  reactionButton: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  reactionButtonActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  reactionButtonPressed: { opacity: 0.7 },

  reactionEmoji: { fontSize: 18 },
  reactionCount: { color: '#6B7280', fontWeight: '500' },
  reactionCountActive: { color: '#3B82F6', fontWeight: '600' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  popover: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: POPOVER_PADDING,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },

  emojiRow: {
    flexDirection: 'row',
    gap: EMOJI_GAP,
  },

  emojiButton: {
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    borderRadius: EMOJI_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },

  emojiHover: {
    transform: [{ translateY: -10 }, { scale: 1.25 }],
    backgroundColor: '#DBEAFE',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  emojiDim: {
    transform: [{ scale: 0.9 }],
    opacity: 0.7,
  },

  emojiText: { fontSize: 30 },

  removeButton: { marginTop: 6, alignItems: 'center' },
  removeText: { fontSize: 13, color: '#6B7280' },

  arrow: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
});
