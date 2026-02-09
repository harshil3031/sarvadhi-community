import React, { useState, useEffect } from 'react';
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

interface EditChannelModalProps {
    visible: boolean;
    channel: Channel.Channel;
    onClose: () => void;
    onChannelUpdated: (updatedChannel: Channel.Channel) => void;
}

export default function EditChannelModal({
    visible,
    channel,
    onClose,
    onChannelUpdated,
}: EditChannelModalProps) {
    const [name, setName] = useState(channel.name);
    const [description, setDescription] = useState(channel.description || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setName(channel.name);
            setDescription(channel.description || '');
        }
    }, [visible, channel]);

    const handleUpdate = async () => {
        if (!name.trim()) {
            setError('Channel name is required');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const response = await channelApi.updateChannel(channel.id, {
                name: name.trim(),
                description: description.trim() || undefined,
            });

            if (response.data.success && response.data.data) {
                onChannelUpdated(response.data.data);
                onClose();
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to update channel';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.backdrop}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose} disabled={isLoading}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Edit Channel</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {error && (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Channel Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter channel name..."
                                    maxLength={100}
                                    editable={!isLoading}
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
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.saveButton,
                                    (!name.trim() || isLoading) && styles.buttonDisabled,
                                ]}
                                onPress={handleUpdate}
                                disabled={!name.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
        minHeight: 100,
        paddingTop: 12,
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
    saveButton: {
        backgroundColor: '#2563EB',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
