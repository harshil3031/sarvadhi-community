import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DM } from '../src/api/dm.api';
import { formatMessageTime } from '../src/utils/date';

interface MessageBubbleProps {
  message: DM.Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      {!isOwn && message.sender && (
        <View style={styles.avatarContainer}>
          {message.sender.avatar ? (
            <Text style={styles.avatarText}>
              {message.sender.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
          ) : (
            <Ionicons name="person-circle" size={32} color="#ccc" />
          )}
        </View>
      )}

      <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bubbleOwn: {
    backgroundColor: '#3b82f6',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  timestampOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
