// Channels index route
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useChannelStore } from '@/store/channel.store';
import { Channel } from '@/api/channels';

export default function ChannelsScreen() {
  const { channels, isLoading, fetchChannels, joinChannel, leaveChannel } = useChannelStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joiningChannelId, setJoiningChannelId] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchChannels();
    setIsRefreshing(false);
  };

  const handleJoinLeave = async (channel: Channel.Channel) => {
    setJoiningChannelId(channel.id);
    try {
      if (channel.isMember) {
        await leaveChannel(channel.id);
        Alert.alert('Success', 'Left channel successfully');
      } else {
        await joinChannel(channel.id);
        Alert.alert('Success', 'Joined channel successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${channel.isMember ? 'leave' : 'join'} channel`;
      console.error('Join/Leave error:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setJoiningChannelId(null);
    }
  };

  const renderChannel = ({ item }: { item: Channel.Channel }) => {
    const isProcessing = joiningChannelId === item.id;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.channelCard,
          pressed && styles.channelCardPressed,
        ]}
        onPress={() => router.push(`/channels/${item.id}`)}
      >
        <View style={styles.channelInfo}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>{item.name}</Text>
            {item.type === 'private' && (
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>🔒 Private</Text>
              </View>
            )}
          </View>
          
          {item.description && (
            <Text style={styles.channelDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.channelFooter}>
            <Text style={styles.memberCount}>
              👥 {item.memberCount || 0} {item.memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.joinButton,
            item.isMember && styles.leaveButton,
            isProcessing && styles.joinButtonDisabled,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handleJoinLeave(item);
          }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.joinButtonText}>
              {item.isMember ? 'Leave' : 'Join'}
            </Text>
          )}
        </Pressable>
      </Pressable>
    );
  };

  if (isLoading && channels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading channels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={renderChannel}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No channels available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new channels to join
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  channelCardPressed: {
    opacity: 0.7,
  },
  channelInfo: {
    flex: 1,
    marginRight: 12,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  privateBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  privateBadgeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
  },
  channelDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  channelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
