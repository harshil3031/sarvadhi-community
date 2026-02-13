import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userApi, UserApi } from '../../src/api/user.api';
import { Post, postApi } from '../../src/api/posts';
import PostCard from '../../components/PostCard';
import { useAuthStore } from '../../src/store/auth.store';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuthStore();

    const [user, setUser] = useState<UserApi.UserProfile | null>(null);
    const [posts, setPosts] = useState<Post.Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchUserData = async () => {
        try {
            const [userRes, postsRes] = await Promise.all([
                userApi.getUserById(id!),
                postApi.getPostsByAuthor(id!)
            ]);

            if (userRes.data?.success) {
                setUser(userRes.data.data || null);
            }

            if (postsRes.data?.success) {
                setPosts(postsRes.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchUserData();
    };

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>User not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    {user.profilePhotoUrl ? (
                        <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={40} color="#2563EB" />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{user.fullName}</Text>
                <Text style={styles.role}>{user.role.toUpperCase()}</Text>
                {user.department && <Text style={styles.department}>{user.department}</Text>}

                {currentUser?.id !== user.id && (
                    <TouchableOpacity
                        style={styles.messageButton}
                        onPress={() => router.push(`/(tabs)/messages/${user.id}`)}
                    >
                        <Ionicons name="mail" size={20} color="#fff" />
                        <Text style={styles.messageButtonText}>Message</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Posts</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: user.fullName,
                    headerBackTitle: 'Back',
                }}
            />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        currentUserId={currentUser?.id}
                        currentUserRole={currentUser?.role}
                        onPostUpdated={handleRefresh}
                        onPostDeleted={handleRefresh}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No posts yet</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#374151',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        backgroundColor: 'transparent',
        paddingBottom: 12,
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: 26,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#EFF6FF',
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
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
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    role: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563EB',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    department: {
        fontSize: 16,
        color: '#4B5563',
        marginTop: 4,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
        marginTop: 20,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    messageButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 8,
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        paddingHorizontal: 16,
        marginTop: 4,
        marginBottom: 8,
    },
    listContent: {
        paddingBottom: 24,
        paddingTop: 4,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9CA3AF',
    },
});
