/**
 * ChannelListScreen - List of all channels
 */

import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { BorderRadius } from '../theme/radius';
import { ScreenContainer } from '../components/base/ScreenContainer';
import { BaseInput } from '../components/base/BaseInput';
import { ChannelItem } from '../components/channel/ChannelItem';
import { EmptyState } from '../components/common/EmptyState';

interface Channel {
  id: string;
  name: string;
  description?: string;
  unreadCount?: number;
  lastActivity?: string;
  isPrivate?: boolean;
}

const MOCK_CHANNELS: Channel[] = [
  { id: '1', name: 'general', description: 'Company-wide announcements', unreadCount: 3, lastActivity: '10m ago' },
  { id: '2', name: 'engineering', description: 'Engineering discussions', unreadCount: 12, lastActivity: '5m ago' },
  { id: '3', name: 'design', description: 'Design team updates', lastActivity: '1h ago' },
  { id: '4', name: 'marketing', description: 'Marketing campaigns', lastActivity: '2h ago' },
];

export const ChannelListScreen: React.FC = () => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [channels] = useState<Channel[]>(MOCK_CHANNELS);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChannel: ListRenderItem<Channel> = ({ item }) => (
    <ChannelItem
      id={item.id}
      name={item.name}
      description={item.description}
      unreadCount={item.unreadCount}
      lastActivity={item.lastActivity}
      isPrivate={item.isPrivate}
      onPress={() => {}}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      paddingBottom: Spacing.md,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
    },
    createButtonText: {
      ...Typography.bodyBold,
      color: '#FFFFFF',
      marginLeft: Spacing.sm,
    },
  });

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <BaseInput
            placeholder="Search channels..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.createButton} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>➕</Text>
          <Text style={styles.createButtonText}>Create Channel</Text>
        </TouchableOpacity>
        <FlatList
          data={filteredChannels}
          renderItem={renderChannel}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="No channels found"
              description="Try adjusting your search"
            />
          }
        />
      </View>
    </ScreenContainer>
  );
};
