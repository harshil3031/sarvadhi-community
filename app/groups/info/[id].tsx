import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupApi, Group } from '../../../src/api/group.api';
import { useAuthStore } from '../../../src/store/auth.store';
import InviteUserModal from '../../../components/InviteUserModal';

export default function GroupInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuthStore();

    const [group, setGroup] = useState<Group.Group | null>(null);
    const [members, setMembers] = useState<Group.GroupMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [groupRes, membersRes] = await Promise.all([
                groupApi.getGroup(id!),
                groupApi.getGroupMembers(id!),
            ]);

            if (groupRes.data.success) setGroup(groupRes.data.data || null);
            if (membersRes.data.success) setMembers(membersRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch group info:', error);
            Alert.alert('Error', 'Failed to load group information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = (memberId: string, fullName: string) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${fullName} from this group?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setRemovingMemberId(memberId);
                        try {
                            await groupApi.removeMember(id!, memberId);
                            setMembers(prev => prev.filter(m => m.userId !== memberId));
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

    const handleDeleteGroup = () => {
        Alert.alert(
            'Delete Group',
            'Are you sure you want to delete this group? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await groupApi.deleteGroup(id!);
                            Alert.alert('Success', 'Group deleted successfully');
                            router.replace('/(tabs)/groups');
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete group');
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                },
            ]
        );
    };

    const isCreator = currentUser?.id === group?.createdBy;
    const isAdmin = isCreator || currentUser?.role === 'admin';

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!group) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Group not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Group Info' }} />

            {/* Header Info */}
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="people" size={32} color="#3b82f6" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupType}>Group • {group.memberCount || 0} members</Text>
                    </View>
                </View>

                {group.description && (
                    <Text style={styles.description}>{group.description}</Text>
                )}
            </View>

            {/* Members Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Members ({members.length})</Text>
                    {isCreator && (
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
                                <Text style={styles.memberRole}>{memberId === group.createdBy ? 'Creator' : (member.role || 'Member')}</Text>
                            </View>
                            {memberId === group.createdBy ? (
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
                        onPress={handleDeleteGroup}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                <Text style={styles.deleteButtonText}>Delete Group</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={{ height: 40 }} />

            <InviteUserModal
                visible={showInviteModal}
                groupId={id!}
                onClose={() => setShowInviteModal(false)}
                onUserInvited={fetchData}
            />
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
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    groupName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    groupType: {
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
        color: '#3b82f6',
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
        backgroundColor: '#16a34a',
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
