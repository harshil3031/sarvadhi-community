// --- imports remain the same ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { DM, dmApi } from '../../../src/api/dm.api';
import { useAuthStore } from '../../../src/store/auth.store';
import { useDMSocket } from '../../../src/hooks/useDMSocket';
import MessageBubble from '../../../components/MessageBubble';
import { BaseInput } from '../../../src/components/base/BaseInput';
import { useTheme } from '../../../src/theme/ThemeContext';

export default function DMChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const {
    isConnected,
    addSocketListener,
    removeSocketListener,
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
    joinConversation,
    leaveConversation,
  } = useDMSocket();

  const [messages, setMessages] = useState<DM.Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  // ------------------- Fetch Messages -------------------
  const fetchMessages = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await dmApi.getConversationMessages(id, 50, 0);
      if (response.data.success && response.data.data) {
        setMessages(response.data.data);
        setTimeout(() => scrollToBottom(false), 100);

        // Mark as read via API
        await dmApi.markAsRead(id);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // ------------------- Join / Leave Conversation -------------------
  useEffect(() => {
    if (id) {
      fetchMessages();
      joinConversation(id);
    }
    return () => {
      if (id) leaveConversation(id);
    };
  }, [id, fetchMessages, joinConversation, leaveConversation]);

  // ------------------- Keyboard Handling -------------------
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      scrollToBottom();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ------------------- Scroll -------------------
  const scrollToBottom = (animated = true) => {
    if (!flatListRef.current || messages.length === 0) return;
    flatListRef.current.scrollToEnd({ animated });
  };

  // ------------------- Socket Listeners -------------------
  useEffect(() => {
    const handleMessageReceived = (message: DM.Message) => {
      if (message.conversationId !== id) return;
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;

        // If message is from me, double check if it replaces an optimistic one
        // (Usually handled in handleSendMessage, but safe to check here)
        return [...prev, message];
      });
      scrollToBottom();
      dmApi.markAsRead(id!);
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === id) {
        setTypingUsers((prev) => (prev.includes(data.userName) ? prev : [...prev, data.userName]));
      }
    };

    const handleTypingStop = (data: any) => {
      if (data.conversationId === id) {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    };

    const handleMessageRead = (data: any) => {
      if (data.conversationId === id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === user?.id && !msg.readAt ? { ...msg, readAt: new Date().toISOString() } : msg
          )
        );
      }
    };

    addSocketListener('dm:message_received', handleMessageReceived);
    addSocketListener('dm:user_typing', handleUserTyping);
    addSocketListener('dm:typing_stop', handleTypingStop);
    addSocketListener('dm:message_read', handleMessageRead);

    return () => {
      removeSocketListener('dm:message_received', handleMessageReceived);
      removeSocketListener('dm:user_typing', handleUserTyping);
      removeSocketListener('dm:typing_stop', handleTypingStop);
      removeSocketListener('dm:message_read', handleMessageRead);
    };
  }, [addSocketListener, removeSocketListener, id, user?.id]);

  useEffect(() => {
    Animated.timing(typingAnim, {
      toValue: typingUsers.length > 0 ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [typingUsers]);

  // ------------------- Typing Handler -------------------
  const handleTyping = (text: string) => {
    setMessageText(text);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (text.trim()) sendTyping(id!);
    typingTimeoutRef.current = setTimeout(() => stopTyping(id!), 2000) as unknown as NodeJS.Timeout;
  };

  // ------------------- Send Message -------------------
  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    const optimisticMessage: DM.Message = {
      id: `temp_${Date.now()}`,
      conversationId: id!,
      senderId: user?.id || '',
      sender: { id: user?.id || '', fullName: user?.fullName || 'You' },
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const response = await dmApi.sendMessage({ conversationId: id!, text });
      if (response.data.success && response.data.data) {
        const sentMessage = response.data.data;
        setMessages((prev) => {
          // If socket already added this message (real ID), just remove temp one
          if (prev.find((m) => m.id === sentMessage.id)) {
            return prev.filter((m) => m.id !== optimisticMessage.id);
          }
          // Otherwise replace temp with real message
          return prev.map((msg) => (msg.id === optimisticMessage.id ? sentMessage : msg));
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const otherParticipant = messages.find((msg) => msg.senderId !== user?.id)?.sender;

  // ------------------- Hardware Back Handling -------------------
  const handleGoBack = () => {
    router.back();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true; // prevent default behavior
      };

      const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandlerSubscription.remove();
    }, [])
  );

  if (isLoading)
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <Stack.Screen
        options={{
          headerTitleAlign: 'left',
          headerTitle: () => (
            <TouchableOpacity onPress={() => otherParticipant?.id && router.push(`/user/${otherParticipant.id}`)}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                {otherParticipant?.fullName || 'Conversation'}
              </Text>
              <Text style={{ fontSize: 12, color: isConnected ? colors.success : colors.textSecondary }}>
                {isConnected ? 'Online' : 'Connecting...'}
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => otherParticipant?.id && router.push(`/user/${otherParticipant.id}`)}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )
        }}
      />


      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <AnimatedMessageBubble message={item} isOwn={item.senderId === user?.id} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 16 + keyboardHeight,
          flexGrow: 1,
          justifyContent: messages.length === 0 ? 'center' : 'flex-end',
        }}
        keyboardShouldPersistTaps="handled"
      />

      {/* Typing indicator */}
      <Animated.View style={[styles.typingContainer, { opacity: typingAnim }]}> 
        {typingUsers.length > 0 && (
          <Text style={[styles.typingText, { color: colors.textSecondary }] }>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Text>
        )}
      </Animated.View>

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          {
            marginBottom: keyboardHeight,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            shadowColor: colors.text,
          },
        ]}
      >
        {!isConnected && (
          <View style={[styles.connectionWarning, { backgroundColor: `${colors.warning}20`, borderBottomColor: `${colors.warning}60` }] }>
            <Ionicons name="warning" size={14} color={colors.warning} />
            <Text style={[styles.connectionWarningText, { color: colors.warning }]}>
              Reconnecting... Messages will be sent when connected
            </Text>
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity style={[styles.attachButton, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
          <BaseInput
            containerStyle={styles.messageInputContainer}
            inputWrapperStyle={[
              styles.messageInputWrapper, 
              { 
                borderColor: colors.border, 
                backgroundColor: '#FFFFFF',
              }
            ]}
            inputTextStyle={[
              styles.messageInputText, 
              { 
                color: '#000000',
                fontSize: 16,
              }
            ]}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
            editable={!isSending}
            placeholderTextColor="#999999"
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primaryLight }, (!messageText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="send" size={20} color={messageText.trim() ? colors.primary : colors.disabled} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------- Animated Message Bubble -------------------
function AnimatedMessageBubble({ message, isOwn }: { message: DM.Message; isOwn: boolean }) {
  const slideAnim = useRef(new Animated.Value(isOwn ? 50 : -50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }], opacity: opacityAnim }}>
      <MessageBubble message={message} isOwn={isOwn} />
    </Animated.View>
  );
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerInfo: { flex: 1, marginHorizontal: 12 },
  headerName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerStatus: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#fcd34d',
    borderRadius: 8,
    marginBottom: 4,
  },
  connectionWarningText: { flex: 1, fontSize: 12, color: '#b45309' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  attachButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  messageInputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    minHeight: 44,
  },
  messageInputText: {
    fontSize: 15,
    color: '#111827',
    maxHeight: 120,
    paddingVertical: 10,
    minHeight: 44,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  typingContainer: { paddingHorizontal: 16, paddingVertical: 4 },
  typingText: { fontSize: 13, color: '#6b7280', fontStyle: 'italic' },
});
