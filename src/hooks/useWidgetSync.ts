import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nativeWidgetManager, WidgetNotification } from '../utils/nativeWidgetManager';
import { notificationApi, Notification } from '../api/notification.api';

/**
 * Hook to automatically sync notification data with the native widget
 * Groups notifications by sender and shows up to 4 items (like Instagram)
 */
export function useWidgetSync() {
    // Get recent notifications
    const { data: notificationsResponse } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.getNotifications(20, 0), // Get more to group properly
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    useEffect(() => {
        if (!nativeWidgetManager.isAvailable()) {
            return;
        }

        const updateWidget = async () => {
            try {
                const notifications = notificationsResponse?.data?.data || [];
                const unreadNotifications = notifications.filter(n => !n.isRead);
                const unreadCount = unreadNotifications.length;

                // Group notifications by sender/type
                const groupedNotifications = groupNotifications(unreadNotifications);

                // Convert to widget format (up to 4 items)
                const widgetNotifications: WidgetNotification[] = groupedNotifications
                    .slice(0, 4)
                    .map(group => ({
                        sender: group.sender,
                        message: group.message,
                        count: group.count,
                        type: group.type,
                    }));

                await nativeWidgetManager.updateWidget(unreadCount, widgetNotifications);
            } catch (error) {
                console.error('[useWidgetSync] Failed to update widget:', error);
            }
        };

        updateWidget();
    }, [notificationsResponse]);
}

interface GroupedNotification {
    sender: string;
    message: string;
    count: number;
    type: 'message' | 'mention' | 'reaction' | 'comment' | 'invite';
    timestamp: string;
}

/**
 * Group notifications by sender
 * If a sender has multiple messages, show "X+ messages from Sender"
 */
function groupNotifications(notifications: Notification.Notification[]): GroupedNotification[] {
    // Group by sender (extracted from title or message)
    const groups = new Map<string, GroupedNotification>();

    for (const notification of notifications) {
        // Extract sender name from title (e.g., "John Doe sent you a message")
        const sender = extractSenderName(notification.title, notification.type);
        const key = `${sender}_${notification.type}`;

        if (groups.has(key)) {
            const existing = groups.get(key)!;
            existing.count++;
            // Keep the most recent message
            if (notification.createdAt > existing.timestamp) {
                existing.message = notification.message;
                existing.timestamp = notification.createdAt;
            }
        } else {
            groups.set(key, {
                sender,
                message: notification.message,
                count: 1,
                type: mapNotificationType(notification.type),
                timestamp: notification.createdAt,
            });
        }
    }

    // Convert to array and sort by timestamp (most recent first)
    return Array.from(groups.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Extract sender name from notification title
 */
function extractSenderName(title: string, type: string): string {
    // Common patterns:
    // "John Doe sent you a message"
    // "Jane Smith mentioned you"
    // "Bob Johnson reacted to your post"

    const patterns = [
        /^(.+?) sent you/,
        /^(.+?) mentioned/,
        /^(.+?) reacted/,
        /^(.+?) commented/,
        /^(.+?) invited/,
    ];

    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
            return match[1];
        }
    }

    // Fallback: take first part before common verbs
    const fallbackMatch = title.match(/^(.+?)\s+(sent|mentioned|reacted|commented|invited)/);
    if (fallbackMatch) {
        return fallbackMatch[1];
    }

    return title.split(' ').slice(0, 2).join(' ') || 'Someone';
}

/**
 * Map notification type to widget type
 */
function mapNotificationType(type: string): 'message' | 'mention' | 'reaction' | 'comment' | 'invite' {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('message') || lowerType.includes('dm')) return 'message';
    if (lowerType.includes('mention')) return 'mention';
    if (lowerType.includes('reaction') || lowerType.includes('like')) return 'reaction';
    if (lowerType.includes('comment')) return 'comment';
    if (lowerType.includes('invite')) return 'invite';

    return 'message'; // Default
}

export default useWidgetSync;
