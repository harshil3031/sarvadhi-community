/**
 * ChannelDetailsScreen - Channel messages and details
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
import { ChannelHeader } from '../components/channel/ChannelHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';

interface Message {
  id: string;
  message: string;
  senderName: string;
  isOwnMessage: boolean;
  timestamp: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', message: 'Hey team! How is everyone doing?', senderName: 'Sarah', isOwnMessage: false, timestamp: '10:30 AM' },
  { id: '2', message: 'Great! Just finished the feature', senderName: 'You', isOwnMessage: true, timestamp: '10:32 AM' },
  { id: '3', message: 'Awesome work! 🎉', senderName: 'Alex', isOwnMessage: false, timestamp: '10:33 AM' },
];

export const ChannelDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isTyping] = useState(false);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message: text,
      senderName: 'You',
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
      senderName={!item.isOwnMessage ? item.senderName : undefined}
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
      <ChannelHeader
        name="engineering"
        memberCount={24}
        description="Engineering team discussions"
      />
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
