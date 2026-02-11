# Android Widget Setup with react-native-android-widget

Complete setup guide for Android widgets using the `react-native-android-widget` library.

## 📦 Installation

### Already Installed ✅
```bash
npm install react-native-android-widget
```

## 🔧 Configuration

### Step 1: Update app.json

Add widget configuration to `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/logo.jpg",
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "imageWidth": 200,
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      [
        "react-native-android-widget",
        {
          "widgets": [
            {
              "name": "NotificationWidget",
              "description": "View your latest notifications",
              "widgetName": "SarvAdhiNotificationWidget",
              "entryPoint": "widgets/AndroidWidgetEntry",
              "sizes": ["SMALL", "MEDIUM", "LARGE"],
              "minWidth": 110,
              "minHeight": 110,
              "maxWidth": 320,
              "maxHeight": 600
            }
          ]
        }
      ]
    ]
  }
}
```

### Step 2: Update metro.config.js

Ensure metro config supports the widget entry point:

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add widget entry point
config.project.ios.project = null;

module.exports = config;
```

### Step 3: Configure Widget in TypeScript

Update `tsconfig.json` if needed:

```json
{
  "compilerOptions": {
    "types": ["react-native-android-widget"]
  }
}
```

## 📝 Implementation Files

### Main Widget Component
- **Location:** `widgets/AndroidNotificationWidget.tsx`
- **Purpose:** Renders the notification widget UI
- **Features:**
  - Displays notifications from API/cache
  - Shows unread count badge
  - Polls for updates every 30 seconds
  - Full theme support (light/dark)
  - Responsive layout

### Widget Entry Point
- **Location:** `widgets/AndroidWidgetEntry.tsx`
- **Purpose:** Root component with providers
- **Includes:**
  - Theme context provider
  - Safe area provider
  - Gesture handler wrapper

## 🚀 Build & Deploy

### Local Testing

```bash
# Build for Android
npx expo run:android

# Or build with EAS
eas build --platform android --profile development
```

### Testing the Widget

1. Build and install the app on device/emulator
2. Long-press home screen
3. Select "Widgets"
4. Find "SarvAdhiNotificationWidget"
5. Select desired size (Small, Medium, or Large)
6. Widget appears on home screen
7. Tap to see updates

## 📊 Widget Sizes

| Size | Dimensions | Use Case |
|------|-----------|----------|
| Small | 110x110dp | Quick unread badge |
| Medium | 220x220dp | 2-3 notifications |
| Large | 320x600dp | Full notification list |

## 🔄 Data Synchronization

Widget data flows from your React Native app via:

1. **AsyncStorage** - Data cached in app storage
2. **widgetService.ts** - API fetching and caching
3. **Widget polling** - 30-second refresh intervals
4. **Android widget** - Updates displayed on home screen

### Update Widget from App

```typescript
import widgetService from './widgets/widgetService';

// Fetch and cache notifications (automatically syncs to widget)
await widgetService.fetchWidgetNotifications(userId);
```

## 🎨 Customization

### Change Widget Sizes

Edit `app.json`:

```json
"sizes": ["SMALL", "MEDIUM", "LARGE", "XLARGE"]
```

### Update Widget UI

Edit `widgets/AndroidNotificationWidget.tsx`:

```typescript
// Modify styles
const styles = StyleSheet.create({
  // ...
});

// Modify layout
<View style={styles.notificationItem}>
  {/* Update structure */}
</View>
```

### Update Refresh Interval

In `widgets/AndroidNotificationWidget.tsx`:

```typescript
// Change from 30 seconds to custom interval
const interval = setInterval(loadWidgetData, 60000); // 60 seconds
```

## 🐛 Troubleshooting

### Widget Not Appearing

**Problem:** Widget doesn't show in widget picker
- [ ] Check `app.json` configuration
- [ ] Rebuild: `npx expo prebuild --clean`
- [ ] Reinstall app: `npx expo run:android`

**Solution:**
```bash
npx expo prebuild --clean
npx expo run:android
```

### Widget Shows But No Data

**Problem:** Widget displays but notifications are empty

- [ ] Check user authentication
- [ ] Verify API endpoints working
- [ ] Check network connectivity
- [ ] Review logcat for errors: `adb logcat | grep NotificationWidget`

**Solution:**
```typescript
// Add logging in AndroidNotificationWidget.tsx
useEffect(() => {
  console.log('Widget loaded for user:', userId);
  loadWidgetData();
}, [userId]);
```

### Updates Not Refreshing

**Problem:** Widget doesn't update with new notifications

- [ ] Check polling interval setting
- [ ] Verify widget service caching
- [ ] Check API response format
- [ ] Ensure `widgetService.fetchWidgetNotifications()` is called

**Solution:**
```bash
# Clear app cache
adb shell pm clear com.sarvadhisolution.community

# Reinstall app
npx expo run:android
```

### Performance Issues

**Problem:** Widget lags or freezes

- [ ] Reduce notification limit (currently 5)
- [ ] Increase refresh interval (currently 30 seconds)
- [ ] Optimize component rendering

**Solution:**
```typescript
// In AndroidNotificationWidget.tsx
const [notifications, setNotifications] = useState<WidgetNotification[]>([]);

// Reduce limit from 5 to 3
const [notifications, setNotifications] = await 
  widgetService.fetchWidgetNotifications(userId, 3);

// Increase interval from 30s to 60s
const interval = setInterval(loadWidgetData, 60000);
```

## 📋 Implementation Checklist

- [ ] `react-native-android-widget` installed
- [ ] `app.json` configured with widget settings
- [ ] `AndroidNotificationWidget.tsx` created
- [ ] `AndroidWidgetEntry.tsx` created
- [ ] App built with `npx expo run:android`
- [ ] Widget appears in widget picker
- [ ] Widget displays notifications
- [ ] Widget updates data periodically
- [ ] Widget works in different sizes
- [ ] Theme adapts correctly (light/dark)
- [ ] Error states handled gracefully

## 🔐 Security Notes

- Widget uses same API endpoints as main app
- Auth tokens passed through widget service
- Data cached in device storage
- Clear cache on logout
- HTTPS enforced in production

## 📚 Resources

- [react-native-android-widget GitHub](https://github.com/google/react-native-android-widget)
- [Android Widget Official Docs](https://developer.android.com/guide/topics/appwidgets)
- [Expo Build Docs](https://docs.expo.dev/build)

## 🎯 Next Steps

1. ✅ Install react-native-android-widget
2. ✅ Create widget components
3. [ ] Update app.json configuration
4. [ ] Build and test on device
5. [ ] Optimize performance
6. [ ] Deploy to Google Play

## 📞 Support

For issues with:
- **react-native-android-widget:** Check [GitHub issues](https://github.com/google/react-native-android-widget)
- **Widget data:** See `widgets/README.md`
- **API integration:** See `NATIVE_INTEGRATION_GUIDE.md`

---

**Last Updated:** February 11, 2026  
**Status:** ✅ Ready for Setup
