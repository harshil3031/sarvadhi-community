import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { channelApi, Channel } from '../../../src/api/channels';
import { useAuthStore } from '../../../src/store/auth.store';
import InviteChannelUserModal from '../../../components/InviteChannelUserModal';
import EditChannelModal from '../../../components/EditChannelModal';

export default function ChannelInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuthStore();

    const [channel, setChannel] = useState<Channel.Channel | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [channelRes, membersRes] = await Promise.all([
                channelApi.getChannel(id),
                channelApi.getChannelMembers(id),
            ]);

            if (channelRes.data.success) setChannel(channelRes.data.data || null);
            if (membersRes.data.success) setMembers(membersRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch channel info:', error);
            Alert.alert('Error', 'Failed to load channel information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = (memberId: string, fullName: string) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${fullName} from this channel?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setRemovingMemberId(memberId);
                        try {
                            await channelApi.removeMember(id, memberId);
                            setMembers(prev => prev.filter(m => m.id !== memberId));
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
                        } finally {
                            setRemovingMemberId(null);
                        }
                    }
                },
            ]
        );
    };

    const handleDeleteChannel = () => {
        Alert.alert(
            'Delete Channel',
            'Are you sure you want to delete this channel? This action cannot be undone and all posts will be lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await channelApi.deleteChannel(id);
                            Alert.alert('Success', 'Channel deleted successfully');
                            router.replace('/(tabs)/channels');
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete channel');
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                },
            ]
        );
    };

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator' || channel?.createdBy === currentUser?.id;

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!channel) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Channel not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Channel Info',
                    headerRight: () => isAdmin ? (
                        <TouchableOpacity
                            onPress={() => setShowEditModal(true)}
                            style={{ marginRight: 8 }}
                        >
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                    ) : null
                }}
            />

            {/* Header Info */}
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={channel.type === 'private' ? 'lock-closed' : 'globe'}
                            size={32}
                            color="#2563EB"
                        />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.channelName}>{channel.name}</Text>
                        <Text style={styles.channelType}>
                            {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Channel
                        </Text>
                    </View>
                </View>

                {channel.description && (
                    <Text style={styles.description}>{channel.description}</Text>
                )}

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>Created {new Date(channel.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Members Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Members ({members.length})</Text>
                    {isAdmin && (
                        <TouchableOpacity onPress={() => setShowInviteModal(true)}>
                            <Text style={styles.actionText}>Invite</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {members.map((member) => {
                    const userInfo = member.user || {};
                    const memberId = member.userId || userInfo.id;

                    return (
                        <TouchableOpacity
                            key={memberId}
                            style={styles.memberItem}
                            onPress={() => router.push(`/user/${memberId}`)}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {userInfo.fullName?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{userInfo.fullName || 'Unknown'}</Text>
                                <Text style={styles.memberRole}>{member.role || 'Member'}</Text>
                            </View>
                            {memberId === channel.createdBy ? (
                                <View style={styles.ownerBadge}>
                                    <Text style={styles.ownerBadgeText}>Owner</Text>
                                </View>
                            ) : (
                                isAdmin && (
                                    <TouchableOpacity
                                        onPress={() => handleRemoveMember(memberId, userInfo.fullName)}
                                        disabled={!!removingMemberId}
                                    >
                                        {removingMemberId === memberId ? (
                                            <ActivityIndicator size="small" color="#EF4444" />
                                        ) : (
                                            <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                                        )}
                                    </TouchableOpacity>
                                )
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Admin Actions */}
            {isAdmin && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Admin Actions</Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteChannel}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                <Text style={styles.deleteButtonText}>Delete Channel</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={{ height: 40 }} />

            <InviteChannelUserModal
                visible={showInviteModal}
                channelId={id}
                onClose={() => setShowInviteModal(false)}
                onUserInvited={fetchData}
            />

            {channel && (
                <EditChannelModal
                    visible={showEditModal}
                    channel={channel}
                    onClose={() => setShowEditModal(false)}
                    onChannelUpdated={(updated) => setChannel(updated)}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginTop: 12,
        padding: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    channelName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    channelType: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    description: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    actionText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    memberRole: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 1,
    },
    ownerBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    ownerBadgeText: {
        fontSize: 11,
        color: '#92400E',
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF4444',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
    },
});
