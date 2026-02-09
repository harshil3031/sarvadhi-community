import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { userApi, UserApi } from '../../src/api/user.api';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{
        users: UserApi.UserProfile[];
        channels: any[];
        groups: any[];
    }>({ users: [], channels: [], groups: [] });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const performSearch = async (text: string) => {
        if (text.trim().length === 0) {
            setResults({ users: [], channels: [], groups: [] });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const [usersRes, channelsRes, groupsRes] = await Promise.all([
                userApi.searchUsers(text),
                userApi.searchChannels(text),
                userApi.searchGroups(text)
            ]);

            setResults({
                users: usersRes.data?.data || [],
                channels: channelsRes.data?.data || [],
                groups: groupsRes.data?.data || []
            });
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (query.length > 0) {
            setIsLoading(true);
            searchTimeout.current = setTimeout(() => {
                performSearch(query);
            }, 500);
        } else {
            setResults({ users: [], channels: [], groups: [] });
            setIsLoading(false);
        }

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [query]);

    const renderUser = ({ item }: { item: UserApi.UserProfile }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push(`/user/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                {item.profilePhotoUrl ? (
                    <Image source={{ uri: item.profilePhotoUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color="#2563EB" />
                    </View>
                )}
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.fullName}</Text>
                <Text style={styles.resultSubtext}>{item.role || 'Member'} • {item.department || 'No Dept'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const renderChannel = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push(`/(tabs)/channels/${item.id}`)}
        >
            <View style={[styles.avatarContainer, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="chatbubbles" size={24} color="#2563EB" />
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>#{item.name}</Text>
                <Text style={styles.resultSubtext}>{item.type} Channel • {item.memberCount || 0} members</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const renderGroup = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push(`/(tabs)/groups/${item.id}`)}
        >
            <View style={[styles.avatarContainer, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="people" size={24} color="#16A34A" />
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultSubtext}>Group • {item.memberCount || 0} members</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const allResults = [
        ...(results.users.length > 0 ? [{ type: 'header', title: 'People' }] : []),
        ...results.users.map(u => ({ ...u, resultType: 'user' })),
        ...(results.channels.length > 0 ? [{ type: 'header', title: 'Channels' }] : []),
        ...results.channels.map(c => ({ ...c, resultType: 'channel' })),
        ...(results.groups.length > 0 ? [{ type: 'header', title: 'Groups' }] : []),
        ...results.groups.map(g => ({ ...g, resultType: 'group' })),
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.searchHeader}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search people, channels, groups..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : query.length > 0 && allResults.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.noResultsText}>No results found for "{query}"</Text>
                </View>
            ) : query.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="rocket-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Find your coworkers, groups or channels</Text>
                </View>
            ) : (
                <FlatList
                    data={allResults}
                    keyExtractor={(item, index) => (item as any).id || `header-${index}`}
                    renderItem={({ item }: { item: any }) => {
                        if (item.type === 'header') {
                            return <Text style={styles.sectionHeader}>{item.title}</Text>;
                        }
                        if (item.resultType === 'user') return renderUser({ item });
                        if (item.resultType === 'channel') return renderChannel({ item });
                        if (item.resultType === 'group') return renderGroup({ item });
                        return null;
                    }}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    cancelButton: {
        color: '#2563EB',
        fontSize: 16,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    noResultsText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#fff',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    resultSubtext: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 8,
    },
});
