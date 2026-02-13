const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to add Native Widget Receiver to AndroidManifest
 * This ensures the widget persists across expo prebuild
 */
const withNativeWidget = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const application = androidManifest.manifest.application[0];

        // Check if widget receiver already exists
        const hasWidgetReceiver = application.receiver?.some(
            (receiver) => receiver.$['android:name'] === '.widget.NotificationWidgetProvider'
        );

        if (!hasWidgetReceiver) {
            // Add widget receiver
            if (!application.receiver) {
                application.receiver = [];
            }

            application.receiver.push({
                $: {
                    'android:name': '.widget.NotificationWidgetProvider',
                    'android:exported': 'true',
                },
                'intent-filter': [
                    {
                        action: [
                            {
                                $: {
                                    'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                                },
                            },
                        ],
                    },
                ],
                'meta-data': [
                    {
                        $: {
                            'android:name': 'android.appwidget.provider',
                            'android:resource': '@xml/notification_widget_info',
                        },
                    },
                ],
            });
        }

        return config;
    });
};

module.exports = withNativeWidget;
