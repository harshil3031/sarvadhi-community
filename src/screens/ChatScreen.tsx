/**
 * ChatScreen - Direct message conversation
 */

import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';

interface Message {
  id: string;
  message: string;
  isOwnMessage: boolean;
  timestamp: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', message: 'Hi! How are you?', isOwnMessage: false, timestamp: '10:30 AM' },
  { id: '2', message: 'I\'m good, thanks! How about you?', isOwnMessage: true, timestamp: '10:32 AM' },
  { id: '3', message: 'Great! Working on the new feature', isOwnMessage: false, timestamp: '10:33 AM' },
];

export const ChatScreen: React.FC = () => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isTyping] = useState(false);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message: text,
      isOwnMessage: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <MessageBubble
      message={item.message}
      isOwnMessage={item.isOwnMessage}
      timestamp={item.timestamp}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messagesList: {
      flex: 1,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: Spacing.md }}
        showsVerticalScrollIndicator={false}
        style={styles.messagesList}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />
      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
};
