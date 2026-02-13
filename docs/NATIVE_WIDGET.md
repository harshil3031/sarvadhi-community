# Native Android Widget

This project includes a **native Android widget** that displays notification counts on the home screen. Unlike the React Native widget library, this is built entirely in Kotlin and works independently of React's rendering system.

## Features

- ✅ **React 19 Compatible** - Pure native implementation, no React dependencies
- ✅ **Auto-Sync** - Automatically updates when notifications change
- ✅ **Lightweight** - Minimal performance impact
- ✅ **Customizable** - Easy to modify appearance and behavior

## Architecture

### Native Components (Kotlin)

1. **NotificationWidgetProvider.kt** - Widget lifecycle management
2. **WidgetModule.kt** - React Native bridge for updates
3. **WidgetPackage.kt** - Registers the module with React Native

### React Native Components (TypeScript)

1. **nativeWidgetManager.ts** - JavaScript interface to native module
2. **useWidgetSync.ts** - React hook for automatic updates
3. **app/_layout.tsx** - Integration point

### Resources

1. **notification_widget.xml** - Widget layout
2. **notification_widget_info.xml** - Widget configuration
3. **widget_background.xml** - Background drawable
4. **badge_background.xml** - Badge drawable

## How It Works

```
┌─────────────────┐
│  React Native   │
│   Application   │
└────────┬────────┘
         │
         │ useWidgetSync()
         │ (monitors notifications)
         │
         ▼
┌─────────────────┐
│ WidgetModule.kt │ ◄── Bridge between JS and Native
└────────┬────────┘
         │
         │ updateWidget()
         │ (saves to SharedPreferences)
         │
         ▼
┌──────────────────────┐
│ NotificationWidget   │
│ Provider.kt          │ ◄── Updates widget UI
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Home Screen Widget  │ ◄── User sees this
└──────────────────────┘
```

## Usage

### Adding the Widget to Home Screen

1. Long-press on the home screen
2. Tap "Widgets"
3. Find "sarvadhi-community"
4. Drag "Notifications" widget to home screen

### Programmatic Updates

```typescript
import { nativeWidgetManager } from './src/utils/nativeWidgetManager';

// Update widget manually
await nativeWidgetManager.updateWidget(5, 'New message from John');

// Check if widget is available
if (nativeWidgetManager.isAvailable()) {
  // Widget is supported on this platform
}

// Get current widget data
const data = await nativeWidgetManager.getWidgetData();
console.log(data.unreadCount); // 5
console.log(data.lastNotification); // "New message from John"
```

### Automatic Updates

The widget automatically syncs with your notifications via the `useWidgetSync()` hook in `app/_layout.tsx`. No manual intervention needed!

## Customization

### Changing Widget Appearance

Edit `/android/app/src/main/res/layout/notification_widget.xml`:

```xml
<TextView
    android:id="@+id/widget_count"
    android:textColor="#2196F3"  <!-- Change color here -->
    android:textSize="48sp"       <!-- Change size here -->
/>
```

### Changing Update Frequency

Edit `/android/app/src/main/res/xml/notification_widget_info.xml`:

```xml
<appwidget-provider
    android:updatePeriodMillis="1800000"  <!-- 30 minutes in milliseconds -->
/>
```

### Changing Widget Size

Edit `/android/app/src/main/res/xml/notification_widget_info.xml`:

```xml
<appwidget-provider
    android:minWidth="180dp"   <!-- Minimum width -->
    android:minHeight="110dp"  <!-- Minimum height -->
/>
```

## Troubleshooting

### Widget Not Appearing

1. Check that the app is installed
2. Restart the device
3. Check logcat for errors: `adb logcat | grep Widget`

### Widget Not Updating

1. Verify `useWidgetSync()` is called in `_layout.tsx`
2. Check that notifications are being fetched
3. Manually trigger update:
   ```typescript
   await nativeWidgetManager.updateWidget(0, 'Test');
   ```

### Build Errors

If you see Kotlin compilation errors:

1. Clean the build: `cd android && ./gradlew clean`
2. Rebuild: `npx expo run:android`

## Technical Details

### Data Storage

Widget data is stored in `SharedPreferences` under the key `"WidgetData"`:

- `unreadCount` (Int) - Number of unread notifications
- `lastNotification` (String) - Preview of most recent notification

### Performance

- Widget updates are throttled to prevent excessive battery drain
- Only updates when notification data actually changes
- Uses efficient `RemoteViews` for rendering

### Permissions

No additional permissions required! The widget uses the same permissions as the main app.

## Future Enhancements

Possible improvements:

- [ ] Click to open specific notification
- [ ] Multiple widget sizes
- [ ] Dark mode support
- [ ] Custom notification icons
- [ ] Widget configuration activity

## Migration from react-native-android-widget

If you previously used `react-native-android-widget`:

1. ✅ Remove the library: `npm uninstall react-native-android-widget`
2. ✅ Delete `/widgets/AndroidWidgetEntry.tsx` (no longer needed)
3. ✅ Remove widget config from `app.json`
4. ✅ The native widget is already integrated!

## Support

For issues or questions, check:

- Android Widget Documentation: https://developer.android.com/develop/ui/views/appwidgets
- React Native Native Modules: https://reactnative.dev/docs/native-modules-android
