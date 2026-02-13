import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nativeWidgetManager } from '../utils/nativeWidgetManager';
import { notificationApi } from '../api/notification.api';

/**
 * Hook to automatically sync notification data with the native widget
 * Updates the widget whenever notification count changes
 */
export function useWidgetSync() {
    // Get recent notifications
    const { data: notificationsResponse } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.getNotifications(10, 0),
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
                const lastMessage = unreadNotifications[0]?.message || 'No new notifications';

                await nativeWidgetManager.updateWidget(unreadCount, lastMessage);
            } catch (error) {
                console.error('[useWidgetSync] Failed to update widget:', error);
            }
        };

        updateWidget();
    }, [notificationsResponse]);
}

export default useWidgetSync;
