import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DM, dmApi } from '../../../src/api/dm.api';
import { useAuthStore } from '../../../src/store/auth.store';
import { useDMSocket } from '../../../src/hooks/useDMSocket';
import MessageBubble from '../../../components/MessageBubble';
import TypingIndicator from '../../../components/TypingIndicator';

interface ConversationWithState extends DM.Conversation {
  typingUser?: string;
}

export default function DMChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { isConnected, addEventListener, sendMessage, sendTyping, stopTyping, markAsRead } =
    useDMSocket();

  const [conversation, setConversation] = useState<ConversationWithState | null>(null);
  const [messages, setMessages] = useState<DM.Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Conversation details are set from route params or conversations list
  // Backend doesn't have a single conversation endpoint

  const fetchMessages = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (isLoadingMore || !hasMore) return;
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const offset = isLoadMore ? messages.length : 0;
      const response = await dmApi.getConversationMessages(id!, 50, offset);

      if (response.data.success && response.data.data) {
        const newMessages = response.data.data;

        if (isLoadMore) {
          setMessages((prev) => [...prev, ...newMessages]);
        } else {
          setMessages(newMessages);
          // Scroll to bottom when loading initially
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }

        setHasMore(newMessages.length === 50);
      }

      // Mark conversation as read
      if (!isLoadMore) {
        markAsRead(id!);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMessages();
    }
  }, [id]);

  useEffect(() => {
    // Listen for real-time messages
    addEventListener('dm:message_received', (message: DM.Message) => {
      if (message.conversationId === id) {
        setMessages((prev) => [message, ...prev]);
      }
    });

    // Listen for typing indicators
    addEventListener('dm:user_typing', (data: any) => {
      if (data.conversationId === id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      }
    });

    // Listen for typing stop
    addEventListener('dm:typing_stop', (data: any) => {
      if (data.conversationId === id) {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    });
  }, [addEventListener, id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected || isSending) return;

    const text = messageText.trim();
    setMessageText('');

    // Stop typing indicator
    if (isTyping) {
      stopTyping(id!);
      setIsTyping(false);
    }

    setIsSending(true);

    try {
      // Create optimistic message
      const optimisticMessage: DM.Message = {
        id: `temp_${Date.now()}`,
        conversationId: id!,
        senderId: user?.id || '',
        sender: {
          id: user?.id || '',
          fullName: user?.fullName || 'You',
        },
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic message immediately
      setMessages((prev) => [optimisticMessage, ...prev]);

      // Send via API (also emits via WebSocket)
      const response = await dmApi.sendMessage({
        conversationId: id!,
        text,
      });

      if (response.data.success && response.data.data) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? response.data.data! : msg
          )
        );

        // Emit via socket for real-time delivery
        sendMessage(id!, text);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to send message';
      Alert.alert('Error', errorMsg);

      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith('temp_'))
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator if not already sent
    if (!isTyping && text.trim()) {
      sendTyping(id!);
      setIsTyping(true);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        stopTyping(id!);
        setIsTyping(false);
      }
    }, 2000) as unknown as NodeJS.Timeout;
  };

  const otherParticipant = conversation?.participants[0];

  const renderMessage = ({ item }: { item: DM.Message }) => (
    <MessageBubble message={item} isOwn={item.senderId === user?.id} />
  );

  const renderHeader = () => (
    <>
      {typingUsers.length > 0 && (
        <TypingIndicator userName={typingUsers[0]} />
      )}
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {otherParticipant?.fullName}
          </Text>
          <Text style={styles.headerStatus}>
            {isConnected ? 'Online' : 'Connecting...'}
          </Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.messagesList}
        inverted
        onEndReached={() => fetchMessages(true)}
        onEndReachedThreshold={0.5}
        scrollEnabled={messages.length > 0}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Ionicons name="warning" size={14} color="#dc2626" />
            <Text style={styles.connectionWarningText}>
              Reconnecting... Messages will be sent when connected
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={24} color="#3b82f6" />
          </TouchableOpacity>

          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
            editable={isConnected && !isSending}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || !isConnected || isSending) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || !isConnected || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={messageText.trim() ? '#3b82f6' : '#ccc'}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  messagesList: {
    paddingVertical: 16,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fcd34d',
  },
  connectionWarningText: {
    flex: 1,
    fontSize: 11,
    color: '#b45309',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
