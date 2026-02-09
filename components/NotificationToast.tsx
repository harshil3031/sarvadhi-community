import React, { useEffect, useState, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../src/api/notification.api';

interface NotificationToastProps {
    notification: Notification.Notification | null;
    onPress: (notification: Notification.Notification) => void;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function NotificationToast({
    notification,
    onPress,
    onClose,
}: NotificationToastProps) {
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (notification) {
            setVisible(true);
            Animated.spring(slideAnim, {
                toValue: 20,
                useNativeDriver: true,
                tension: 40,
                friction: 7,
            }).start();

            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            onClose();
        });
    };

    if (!visible || !notification) return null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'dm_message':
                return 'mail';
            case 'post_comment':
                return 'chatbubble';
            case 'post_reaction':
                return 'heart';
            case 'channel_invite':
            case 'group_invite':
                return 'people';
            default:
                return 'notifications';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] },
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={() => {
                    onPress(notification);
                    handleClose();
                }}
                activeOpacity={0.9}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={getTypeIcon(notification.type) as any} size={24} color="#2563EB" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {notification.title || 'New Notification'}
                    </Text>
                    <Text style={styles.message} numberOfLines={2}>
                        {notification.message}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 40 : 20,
        left: 10,
        right: 10,
        zIndex: 9999,
    },
    content: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#4B5563',
    },
    closeButton: {
        padding: 4,
    },
});
