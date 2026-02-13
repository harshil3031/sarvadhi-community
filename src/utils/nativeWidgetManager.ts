import { NativeModules, Platform } from 'react-native';

export interface WidgetNotification {
    sender: string;
    message: string;
    count: number;
    type: 'message' | 'mention' | 'reaction' | 'comment' | 'invite';
}

interface WidgetModuleInterface {
    updateWidget(unreadCount: number, notifications: WidgetNotification[]): Promise<string>;
    getWidgetData(): Promise<{ unreadCount: number; notifications: string }>;
}

const { WidgetModule } = NativeModules;

/**
 * Native Widget Manager
 * Enhanced to support multiple notifications like Instagram
 */
class NativeWidgetManager {
    private module: WidgetModuleInterface | null = null;

    constructor() {
        if (Platform.OS === 'android' && WidgetModule) {
            this.module = WidgetModule as WidgetModuleInterface;
        }
    }

    /**
     * Check if widget is available on this platform
     */
    isAvailable(): boolean {
        return this.module !== null;
    }

    /**
     * Update the widget with multiple notifications
     * @param unreadCount Total number of unread notifications
     * @param notifications Array of up to 4 notifications to display
     */
    async updateWidget(unreadCount: number, notifications: WidgetNotification[]): Promise<void> {
        if (!this.module) {
            console.warn('[NativeWidget] Widget module not available on this platform');
            return;
        }

        try {
            // Limit to 4 notifications
            const limitedNotifications = notifications.slice(0, 4);
            await this.module.updateWidget(unreadCount, limitedNotifications);
            console.log('[NativeWidget] Widget updated with', limitedNotifications.length, 'notifications');
        } catch (error) {
            console.error('[NativeWidget] Failed to update widget:', error);
            throw error;
        }
    }

    /**
     * Get current widget data
     */
    async getWidgetData(): Promise<{ unreadCount: number; notifications: WidgetNotification[] } | null> {
        if (!this.module) {
            return null;
        }

        try {
            const data = await this.module.getWidgetData();
            return {
                unreadCount: data.unreadCount,
                notifications: JSON.parse(data.notifications),
            };
        } catch (error) {
            console.error('[NativeWidget] Failed to get widget data:', error);
            return null;
        }
    }
}

export const nativeWidgetManager = new NativeWidgetManager();
export default nativeWidgetManager;
