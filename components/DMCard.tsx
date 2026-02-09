import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DM } from '../src/api/dm.api';
import { useAuthStore } from '../src/store/auth.store';
import { formatConversationTime } from '../src/utils/date';
import { useDMSocket } from '../src/hooks/useDMSocket';
import { LinearGradient } from 'expo-linear-gradient';

interface DMCardProps {
  conversation: DM.Conversation;
}

export default function DMCard({ conversation }: DMCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isConnected } = useDMSocket();

  const otherParticipant =
    conversation.participants.find((p) => p.id !== user?.id) ||
    conversation.participants[0];

  const handlePress = () => {
    // Tap bounce
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(`/(tabs)/messages/${conversation.id}` as any);
    });
  };

  const online = isConnected;
  const hasUnread = conversation.unreadCount > 0;

  // Animation for pulse
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasUnread) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.03,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [hasUnread, scaleAnim]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={hasUnread ? ['#dbeafe', '#bfdbfe'] : ['#fff', '#fff']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.container}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {otherParticipant.avatar ? (
              <Image
                source={{ uri: otherParticipant.avatar }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {otherParticipant.fullName?.charAt(0).toUpperCase() || '?'}
              </Text>
            )}
            {online && <View style={styles.onlineDot} />}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                style={[styles.name, hasUnread && styles.unreadMessage]}
                numberOfLines={1}
              >
                {otherParticipant.fullName || 'Unknown'}
              </Text>
              <Text style={styles.time}>
                {formatConversationTime(conversation.updatedAt)}
              </Text>
            </View>

            <View style={styles.messageRow}>
              <Text
                style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
                numberOfLines={1}
              >
                {conversation.lastMessage?.text || 'No messages yet'}
              </Text>

              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 52,
    height: 52,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#555' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34d399',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: { flex: 1, gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  lastMessage: { fontSize: 14, color: '#6b7280', flex: 1 },
  unreadMessage: { fontWeight: '700', color: '#111827' },
  time: { fontSize: 12, color: '#9ca3af', marginLeft: 8, flexShrink: 0 },
  messageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
