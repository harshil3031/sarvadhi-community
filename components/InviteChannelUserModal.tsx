import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { channelApi } from '../src/api/channels';
import { userApi, UserApi } from '../src/api/user.api';
import { useTheme } from '../src/theme/ThemeContext';
import { BaseInput } from '../src/components/base/BaseInput';

interface InviteChannelUserModalProps {
    visible: boolean;
    channelId: string;
    onClose: () => void;
    onUserInvited?: () => void;
}

export default function InviteChannelUserModal({
    visible,
    channelId,
    onClose,
    onUserInvited,
}: InviteChannelUserModalProps) {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserApi.UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [invitingId, setInvitingId] = useState<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const searchUsers = async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await userApi.searchUsers(q);
            if (response.data.success) {
                setResults(response.data.data || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQueryChange = (text: string) => {
        setQuery(text);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => searchUsers(text), 500);
    };

    const handleInvite = async (userId: string) => {
        setInvitingId(userId);
        try {
            const response = await channelApi.inviteUser(channelId, userId);
            if (response.data.success) {
                Alert.alert('Success', 'User invited successfully');
                onUserInvited?.();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to invite user');
        } finally {
            setInvitingId(null);
        }
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        onClose();
    };

    const renderUser = ({ item }: { item: UserApi.UserProfile }) => (
        <View style={[styles.userItem, { borderBottomColor: colors.border }] }>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.avatarText, { color: colors.primary }] }>
                    {item.fullName?.charAt(0).toUpperCase() || '?'}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.fullName}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: colors.primary }, invitingId === item.id && styles.buttonDisabled]}
                onPress={() => handleInvite(item.id)}
                disabled={!!invitingId}
            >
                {invitingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.inviteButtonText}>Invite</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={[styles.backdrop, { backgroundColor: colors.overlay }] }>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: colors.text }]}>Invite to Channel</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Search Bar */}
                        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }] }>
                            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                            <BaseInput
                                containerStyle={styles.searchInputContainer}
                                inputWrapperStyle={styles.searchInputWrapper}
                                inputTextStyle={[styles.searchInput, { color: colors.text }]}
                                value={query}
                                onChangeText={handleQueryChange}
                                placeholder="Search by name or email..."
                                autoFocus
                            />
                        </View>

                        {/* Results List */}
                        {isLoading && results.length === 0 ? (
                            <View style={styles.listPadding}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item.id}
                                renderItem={renderUser}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    query.trim() !== '' && !isLoading ? (
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
                                    ) : null
                                }
                            />
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 20,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    searchInputWrapper: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: '#111827',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    listPadding: {
        padding: 20,
        alignItems: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    userEmail: {
        fontSize: 13,
        color: '#6B7280',
    },
    inviteButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    inviteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6B7280',
        fontSize: 14,
    },
});
