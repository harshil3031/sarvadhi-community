import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../theme/ThemeContext';
import PostCard from '../../components/PostCard';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { Post } from '../api/posts';
import { useAuthStore } from '../store/auth.store';
import { PostSkeleton } from './skeletons/PostSkeleton';

interface PostFeedProps {
    onPostUpdated?: () => void;
}

export default function PostFeed({ onPostUpdated }: PostFeedProps) {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
        isRefetching
    } = useFeedPosts();

    const posts = data?.pages.flatMap(page => page.data || []) || [];

    const handleRefresh = useCallback(() => {
        refetch();
        onPostUpdated?.();
    }, [refetch, onPostUpdated]);

    const renderItem = useCallback(({ item }: { item: Post.Post }) => (
        <PostCard
            post={item}
            currentUserId={user?.id}
            currentUserRole={user?.role}
            onPostUpdated={handleRefresh}
            onPostDeleted={handleRefresh}
        />
    ), [user?.id, user?.role, handleRefresh]);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return <View style={{ height: 20 }} />;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }, [isFetchingNextPage, colors.primary]);

    if (isLoading) {
        return (
            <View style={styles.list}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <PostSkeleton key={i} />
                ))}
            </View>
        );
    }

    const renderEmpty = () => (
        <View style={styles.center}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🚀</Text>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 }}>No Posts Yet</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                Be the first to post in your channels!
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlashList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
