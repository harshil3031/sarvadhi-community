import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { DM, dmApi } from '../../../src/api/dm.api';
import { useAuthStore } from '../../../src/store/auth.store';
import { useDMSocket } from '../../../src/hooks/useDMSocket';
import { useDMStore } from '../../../src/store/dm.store';
import DMCard from '../../../components/DMCard';
import { Stack } from 'expo-router';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { isConnected, addSocketListener, removeSocketListener, joinConversation } = useDMSocket();

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
        setConversations(response.data.data);
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

          const target = updated.find((c) => c.id === message.conversationId);
          if (!target) {
            fetchConversations();
            return updated;
          }

          return [target, ...updated.filter((c) => c.id !== message.conversationId)];
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
        <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Messages</Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'No conversations match your search'
            : 'Start a conversation to send messages'}
        </Text>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery) return null;
    if (isSearchingUsers) return <ActivityIndicator size="small" color="#3b82f6" style={{ margin: 16 }} />;

    if (searchResults.length === 0) {
      return (
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#999', textAlign: 'center' }}>No users found</Text>
        </View>
      );
    }

    return searchResults.map((userResult) => (
      <TouchableOpacity
        key={userResult.id}
        style={styles.userResult}
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
        <Text style={styles.userResultText}>{userResult.fullName}</Text>
      </TouchableOpacity>
    ));
  };

  const renderHeader = () => (
    <>
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text style={styles.connectionText}>Reconnecting...</Text>
        </View>
      )}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations or users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={{ padding: 8, marginRight: 8 }}
              onPress={() => setIsNewDMModalVisible(true)}
            >
              <Ionicons name="create-outline" size={24} color="#3b82f6" />
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        scrollEnabled={filteredConversations.length > 0 || searchQuery.length === 0}
      />

      {/* New DM Modal */}
      <Modal
        visible={isNewDMModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNewDMModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start New Conversation</Text>
              <TouchableOpacity onPress={() => setIsNewDMModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInputModal}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={{ marginTop: 8 }}>{renderSearchResults()}</View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    marginTop: 12,
    color: '#333',
  },
});
