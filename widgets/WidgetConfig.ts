/**
 * Widget Configuration
 * Defines widget settings, sizes, and properties for iOS and Android
 */

export const WIDGET_CONFIG = {
  // Widget identifier
  identifier: 'com.sarvadhisolution.community.notification-widget',
  displayName: 'Notifications',
  description: 'Quick access to your unread notifications and messages',

  // Supported sizes
  supportedSizes: [
    // iOS Widget Sizes
    {
      family: 'systemSmall',
      description: '2x2 grid',
      platform: 'ios',
      width: 158,
      height: 158,
    },
    {
      family: 'systemMedium',
      description: '2x4 grid',
      platform: 'ios',
      width: 338,
      height: 158,
    },
    {
      family: 'systemLarge',
      description: '2x6 grid',
      platform: 'ios',
      width: 338,
      height: 354,
    },
    {
      family: 'systemExtraLarge',
      description: '4x6 grid',
      platform: 'ios',
      width: 728,
      height: 354,
    },
    {
      family: 'accessoryCircular',
      description: 'Lock screen circular',
      platform: 'ios',
      width: 160,
      height: 160,
    },
    {
      family: 'accessoryRectangular',
      description: 'Lock screen rectangular',
      platform: 'ios',
      width: 360,
      height: 84,
    },

    // Android Widget Sizes
    {
      minWidth: 110,
      minHeight: 110,
      maxWidth: 320,
      maxHeight: 600,
      platform: 'android',
      description: 'Flexible widget',
    },
  ],

  // Refresh configuration
  refreshInterval: {
    default: 30 * 60 * 1000, // 30 minutes
    minimum: 15 * 60 * 1000, // 15 minutes
    maximum: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Widget groups (for organizing multiple widgets)
  groups: ['notifications', 'messages'],

  // Permissions required
  permissions: [
    'INTERNET',
    'ACCESS_NETWORK_STATE',
    'READ_EXTERNAL_STORAGE',
  ],

  // Colors and styling
  styling: {
    lightMode: {
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      accentColor: '#4F46E5',
      secondaryAccent: '#0EA5E9',
      borderColor: '#E5E7EB',
    },
    darkMode: {
      backgroundColor: '#1F2937',
      textColor: '#F3F4F6',
      accentColor: '#818CF8',
      secondaryAccent: '#38BDF8',
      borderColor: '#374151',
    },
  },

  // Data to sync
  dataSync: {
    enabled: true,
    includeFields: [
      'id',
      'title',
      'message',
      'type',
      'timestamp',
      'read',
      'userName',
    ],
    excludeFields: ['userData', 'internalId'],
  },

  // Interaction configuration
  interactions: {
    enableTap: true,
    enableLongPress: false,
    enableSwipe: true,
    enableContextMenu: true,
  },

  // Analytics
  analytics: {
    trackWidgetViews: true,
    trackWidgetInteractions: true,
    trackInstallation: true,
  },
};

export interface WidgetSize {
  family?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  width?: number;
  height?: number;
  description: string;
  platform: 'ios' | 'android';
}

export interface WidgetData {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    timestamp: string;
    read: boolean;
  }>;
  unreadCount: number;
  lastUpdate: string;
}
