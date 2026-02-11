import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { DM, dmApi } from '../../../src/api/dm.api';
import { useAuthStore } from '../../../src/store/auth.store';
import { useDMSocket } from '../../../src/hooks/useDMSocket';
import { useDMStore } from '../../../src/store/dm.store';
import DMCard from '../../../components/DMCard';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeContext';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { BaseInput } from '../../../src/components/base/BaseInput';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { isConnected, addSocketListener, removeSocketListener, joinConversation } = useDMSocket();
  const setDMUnreadCount = useDMStore((state) => state.setUnreadCount);
  const { colors } = useTheme();

  const [conversations, setConversations] = useState<DM.Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; fullName: string; avatar?: string }>>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isNewDMModalVisible, setIsNewDMModalVisible] = useState(false);

  // Fetch conversations
  const fetchConversations = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await dmApi.getConversations(50, 0);
      if (response.data.success && response.data.data) {
        // Sort by most recent first
        const sorted = response.data.data.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setConversations(sorted);
        const totalUnread = sorted.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setDMUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Real-time socket updates
  useFocusEffect(
    useCallback(() => {
      fetchConversations();

      const handleMessageReceived = (message: any) => {
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === message.conversationId) {
              const isOtherSender = message.senderId !== user?.id;
              return {
                ...conv,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: isOtherSender ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
              };
            }
            return conv;
          });

          // Sync with global store
          const totalUnread = updated.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          useDMStore.getState().setUnreadCount(totalUnread);

          // Sort by most recent first
          const sorted = updated.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });

          return sorted;
        });
      };

      const handleMessageRead = (data: any) => {
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === data.conversationId) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          });

          // Sync with global store
          const totalUnread = updated.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          useDMStore.getState().setUnreadCount(totalUnread);

          return updated;
        });
      };

      addSocketListener('dm:message_received', handleMessageReceived);
      addSocketListener('dm:message_read', handleMessageRead);

      return () => {
        removeSocketListener('dm:message_received', handleMessageReceived);
        removeSocketListener('dm:message_read', handleMessageRead);
      };
    }, [addSocketListener, removeSocketListener, user?.id])
  );

  const handleRefresh = () => fetchConversations(true);

  // Filter existing conversations by other participant
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const otherParticipant = conv.participants.find((p) => p.id !== user?.id);
    if (!otherParticipant?.fullName) return false;
    return otherParticipant.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Search for new users
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      setIsSearchingUsers(true);
      try {
        const response = await dmApi.searchUsers(searchQuery);
        if (response.data.success) {
          setSearchResults(response.data.data || []);
        }
      } catch (err) {
        console.error('User search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const renderConversation = ({ item }: { item: DM.Conversation }) => <DMCard conversation={item} />;

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="💬"
          title="No Messages"
          description={
            searchQuery
              ? 'No conversations match your search'
              : 'Start a conversation to send messages'
          }
        />
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery) return null;
    if (isSearchingUsers) return <ActivityIndicator size="small" color={colors.primary} style={{ margin: 16 }} />;

    if (searchResults.length === 0) {
      return (
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No users found</Text>
        </View>
      );
    }

    return searchResults.map((userResult) => (
      <TouchableOpacity
        key={userResult.id}
        style={[styles.userResult, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        onPress={async () => {
          try {
            const response = await dmApi.startConversation(userResult.id);
            if (response.data.success && response.data.data) {
              const conv = response.data.data;
              setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
              joinConversation(conv.id); // Join socket room
              setSearchQuery('');
              setIsNewDMModalVisible(false);
            }
          } catch (err) {
            console.error('Failed to start conversation:', err);
            Alert.alert('Error', 'Could not start conversation');
          }
        }}
      >
        <Text style={[styles.userResultText, { color: colors.text }]}>{userResult.fullName}</Text>
      </TouchableOpacity>
    ));
  };

  const renderHeader = () => (
    <>
      {!isConnected && (
        <View style={[styles.connectionBanner, { backgroundColor: `${colors.error}20`, borderBottomColor: `${colors.error}40` }] }>
          <Ionicons name="warning" size={16} color={colors.error} />
          <Text style={[styles.connectionText, { color: colors.error }]}>Reconnecting...</Text>
        </View>
      )}
      <View style={styles.searchContainer}>
        <BaseInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search conversations or users..."
          style={styles.searchInput}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={{ padding: 8, marginRight: 8 }}
              onPress={() => setIsNewDMModalVisible(true)}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Conversations / Search Results */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (searchQuery ? renderSearchResults() : renderEmpty())}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && searchQuery === '' && styles.listContentEmpty,
        ]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        scrollEnabled={filteredConversations.length > 0 || searchQuery.length === 0}
      />

      {/* New DM Modal */}
      <Modal
        visible={isNewDMModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNewDMModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Start New Conversation</Text>
              <TouchableOpacity onPress={() => setIsNewDMModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <BaseInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
              style={styles.searchInputModal}
            />
            <View style={{ marginTop: 8 }}>{renderSearchResults()}</View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#333' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  connectionText: { fontSize: 13, color: '#dc2626', fontWeight: '500' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 32, paddingTop: 4 },
  listContentEmpty: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  userResult: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  userResultText: { fontSize: 15, color: '#333' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  searchInputModal: {
    marginTop: 12,
  },
});
