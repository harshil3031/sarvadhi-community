# Notification Widget Implementation

This directory contains the Expo Widgets implementation for the Sarvadhi Community app.

## 📁 File Structure

```
widgets/
├── NotificationWidget.tsx      # Main widget UI component
├── widget.ts                   # Widget entry point
├── widgetService.ts            # Service for widget data management
├── WidgetConfig.ts             # Widget configuration and metadata
├── useWidgetData.ts            # Custom hook for widget data
└── README.md                   # This file
```

## 🎯 Features

### **Notification Widget**
Displays real-time notifications and messages on the home screen with:

- **Unread Count Badge** - Shows number of unread notifications
- **Quick Preview** - View notification title, message, and type
- **Type Indicators** - Different colors for message, mention, announcement, achievement
- **Relative Timestamps** - Shows "Just now", "5m ago", etc.
- **Light/Dark Mode** - Adapts to system theme automatically
- **Refresh Capability** - Pull to refresh or manual refresh
- **Caching** - Local caching with 5-minute TTL for performance

## 📱 Supported Sizes

### iOS
- **Small** (2x2) - Icon + unread badge
- **Medium** (2x4) - Top 3-4 notifications
- **Large** (2x6) - Scrollable notification list
- **Extra Large** (4x6) - Full notification feed
- **Accessory Circular** - Lock screen: unread count
- **Accessory Rectangular** - Lock screen: last notification

### Android
- **Flexible** (110x110 to 320x600) - Adaptive layout

## 🔧 Configuration

Widget configuration is defined in `WidgetConfig.ts` and includes:

```typescript
- Widget identifier and display name
- Supported sizes for iOS and Android
- Refresh intervals (default: 30 minutes)
- Required permissions
- Theme colors (light/dark modes)
- Data sync settings
- Interaction configuration
- Analytics tracking
```

## 🚀 Usage

### Basic Integration

```typescript
import NotificationWidget from './widgets/NotificationWidget';

// The widget is automatically registered in expo config
// No additional setup needed
```

### Using Widget Data Hook

```typescript
import { useWidgetData } from './widgets/useWidgetData';

function MyComponent() {
  const { notifications, unreadCount, loading, refresh } = useWidgetData();

  return (
    <View>
      {notifications.map(notification => (
        <Text key={notification.id}>{notification.title}</Text>
      ))}
    </View>
  );
}
```

### Widget Service API

```typescript
import widgetService from './widgets/widgetService';

// Fetch notifications
const notifications = await widgetService.fetchWidgetNotifications(userId);

// Get unread count
const count = await widgetService.getUnreadCount(userId);

// Mark as read
await widgetService.markAsRead(notificationId, userId);

// Clear cache
await widgetService.clearCache();

// Subscribe to real-time updates
const unsubscribe = widgetService.subscribeToWidgetUpdates(userId, (notifications) => {
  console.log('New notifications:', notifications);
});
```

## 🔄 Data Flow

```
Backend API
    ↓
widgetService.ts (fetch + cache)
    ↓
useWidgetData.ts (custom hook)
    ↓
NotificationWidget.tsx (UI display)
    ↓
Home Screen Widget
```

## 💾 Caching Strategy

- **Duration**: 5 minutes
- **Storage**: AsyncStorage
- **Keys**:
  - `@sarvadhi_widget_notifications` - Cached notifications
  - `@sarvadhi_widget_last_update` - Last cache timestamp

## 🔐 Security

- User authentication required (stored in AsyncStorage)
- Widget data filtered on backend
- Sensitive fields excluded from widget sync
- Safe URL encoding for API requests

## ⚙️ API Endpoints Used

```
GET  /notifications?userId={id}&limit={n}&widget=true
     → Fetch widget notifications

GET  /notifications/unread-count/{userId}
     → Get unread count

PUT  /notifications/{notificationId}/read
     → Mark as read
```

## 🎨 Theming

The widget automatically adapts to the app's theme system:

- **Primary Color**: #4F46E5 (light), #818CF8 (dark)
- **Secondary Color**: #0EA5E9 (light), #38BDF8 (dark)
- **Background**: Adaptive
- **Text**: Adaptive

## 📊 Widget Interactions

### Enabled
- ✅ Tap to navigate
- ✅ Swipe gestures
- ✅ Context menu
- ✅ Long press support (future)

### Disabled
- ❌ Heavy animations
- ❌ Video playback
- ❌ Complex layouts

## 🔔 Real-Time Updates

The widget supports real-time updates via:

1. **Firebase Cloud Messaging** - For push notifications
2. **Polling** - 30-second refresh interval
3. **Manual Refresh** - User-initiated refresh

## 📈 Analytics Tracked

- Widget installation
- Widget views
- Widget interactions
- Error rates

## 🐛 Troubleshooting

### Widget Not Appearing
1. Check widget is enabled in iOS/Android settings
2. Verify `app.json` plugin configuration
3. Clear app cache: `expo prebuild --clean`

### Data Not Updating
1. Check network connectivity
2. Verify backend API is accessible
3. Check AsyncStorage permissions
4. Clear cache: `widgetService.clearCache()`

### Performance Issues
1. Reduce polling frequency in `WidgetConfig.ts`
2. Limit notification limit (currently 10)
3. Enable aggressive caching

## ✨ Features & Advantages

### iOS (WidgetKit)
- ✅ Lock screen widgets (iOS 16+)
- ✅ Timeline-based updates
- ✅ 15-minute refresh interval
- ✅ Native performance

### Android (react-native-android-widget)
- ✅ Pure React Native code
- ✅ Reuses app components & themes
- ✅ No native code to maintain
- ✅ 30-second refresh interval
- ✅ Flexible sizing

## 🚀 Future Enhancements

- [ ] Push notification integration (Firebase Cloud Messaging)
- [ ] Widget tap actions (deep linking)
- [ ] User preferences for widget content
- [ ] Dynamic color support
- [ ] Multiple widget instances
- [ ] Widget-specific animations
- [ ] Data encryption in cache
- [ ] Advanced analytics tracking

## 📚 References

- [Expo Widgets Documentation](https://docs.expo.dev/widgets/)
- [iOS WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Android App Widgets](https://developer.android.com/guide/topics/appwidgets)
