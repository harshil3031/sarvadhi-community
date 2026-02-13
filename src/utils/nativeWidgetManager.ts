import { NativeModules, Platform } from 'react-native';

interface WidgetModuleInterface {
    updateWidget(unreadCount: number, lastMessage: string): Promise<string>;
    getWidgetData(): Promise<{ unreadCount: number; lastNotification: string }>;
}

const { WidgetModule } = NativeModules;

/**
 * Native Widget Manager
 * Provides methods to update the Android home screen widget from JavaScript
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
     * Update the widget with new notification data
     * @param unreadCount Number of unread notifications
     * @param lastMessage Preview of the most recent notification
     */
    async updateWidget(unreadCount: number, lastMessage: string): Promise<void> {
        if (!this.module) {
            console.warn('[NativeWidget] Widget module not available on this platform');
            return;
        }

        try {
            await this.module.updateWidget(unreadCount, lastMessage);
            console.log('[NativeWidget] Widget updated successfully');
        } catch (error) {
            console.error('[NativeWidget] Failed to update widget:', error);
            throw error;
        }
    }

    /**
     * Get current widget data
     */
    async getWidgetData(): Promise<{ unreadCount: number; lastNotification: string } | null> {
        if (!this.module) {
            return null;
        }

        try {
            return await this.module.getWidgetData();
        } catch (error) {
            console.error('[NativeWidget] Failed to get widget data:', error);
            return null;
        }
    }
}

export const nativeWidgetManager = new NativeWidgetManager();
export default nativeWidgetManager;
