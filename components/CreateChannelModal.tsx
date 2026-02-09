import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { channelApi, Channel } from '../src/api/channels';

interface CreateChannelModalProps {
    visible: boolean;
    onClose: () => void;
    onChannelCreated?: (channel: Channel.Channel) => void;
}

export default function CreateChannelModal({
    visible,
    onClose,
    onChannelCreated,
}: CreateChannelModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'public' | 'private'>('public');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        // Validation
        if (!name.trim()) {
            setError('Channel name is required');
            return;
        }

        if (name.length > 100) {
            setError('Channel name must be 100 characters or less');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const response = await channelApi.createChannel({
                name: name.trim(),
                description: description.trim() || undefined,
                type: type,
            });

            if (response.data.success && response.data.data) {
                onChannelCreated?.(response.data.data);
                resetForm();
                onClose();
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create channel';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setType('public');
        setError(null);
    };

    const handleClose = () => {
        if (!isLoading) {
            resetForm();
            onClose();
        }
    };

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
                <View style={styles.backdrop}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Create Channel</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Error Banner */}
                        {error && (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity onPress={() => setError(null)}>
                                    <Ionicons name="close" size={18} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Channel Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. engineering, marketing"
                                    maxLength={100}
                                    editable={!isLoading}
                                    autoFocus
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="What's this channel for?"
                                    multiline
                                    numberOfLines={4}
                                    maxLength={500}
                                    editable={!isLoading}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Privacy Type</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeOption,
                                            type === 'public' && styles.typeOptionActive,
                                        ]}
                                        onPress={() => setType('public')}
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name="globe-outline"
                                            size={20}
                                            color={type === 'public' ? '#fff' : '#666'}
                                        />
                                        <Text style={[
                                            styles.typeOptionText,
                                            type === 'public' && styles.typeOptionTextActive,
                                        ]}>Public</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.typeOption,
                                            type === 'private' && styles.typeOptionActive,
                                        ]}
                                        onPress={() => setType('private')}
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={type === 'private' ? '#fff' : '#666'}
                                        />
                                        <Text style={[
                                            styles.typeOptionText,
                                            type === 'private' && styles.typeOptionTextActive,
                                        ]}>Private</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.helperText}>
                                    {type === 'public'
                                        ? 'Anyone in the organization can search and join.'
                                        : 'Joining is by invitation or request only.'}
                                </Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.createButton,
                                    (!name.trim() || isLoading) && styles.buttonDisabled,
                                ]}
                                onPress={handleCreate}
                                disabled={!name.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.createButtonText}>Create Channel</Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fee2e2',
        padding: 12,
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: '#dc2626',
    },
    form: {
        paddingHorizontal: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#fff',
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
    },
    typeOptionActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    typeOptionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
    },
    typeOptionTextActive: {
        color: '#fff',
    },
    helperText: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    createButton: {
        backgroundColor: '#2563EB',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
