import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DM } from '../src/api/dm.api';
import { formatMessageTime } from '../src/utils/date';

interface MessageBubbleProps {
  message: DM.Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const slideAnim = useRef(new Animated.Value(isOwn ? 100 : -100)).current; // x-axis start
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        isOwn && styles.containerOwn,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      {/* Avatar for others */}
      {!isOwn && message.sender && (
        <View style={styles.avatarContainer}>
          {message.sender.avatar ? (
            <Text style={styles.avatarText}>
              {message.sender.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
          ) : (
            <Ionicons name="person-circle" size={36} color="#ccc" />
          )}
        </View>
      )}

      {/* Bubble */}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && message.sender && (
          <Text style={styles.senderName}>{message.sender.fullName}</Text>
        )}
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
          {message.text}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
            {formatMessageTime(message.createdAt)}
          </Text>
          {isOwn && message.readAt && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color="#60a5fa"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },

  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  // Modern chat bubble with "smooth tail" effect using border radius
  bubbleOwn: {
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleOther: {
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  timestampOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
