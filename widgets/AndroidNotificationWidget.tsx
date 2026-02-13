import React from 'react';
import { View, Text } from 'react-native';

/**
 * Android Widget Component - DEBUG MODE
 * Minimal implementation to test rendering pipeline.
 */
interface WidgetProps {
  widgetId: string;
}

// Direct export without React.FC to simplifying debugging
export function AndroidNotificationWidget({ widgetId }: WidgetProps) {
  console.log('[Widget] Rendering debug view for:', widgetId);
  return (
    <View
      style={{
        width: 320,
        height: 200,
        backgroundColor: '#FF0000', // Bright Red
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 5,
        borderColor: 'yellow'
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      >
        Widget Works!
      </Text>
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        If you see this red box, the rendering engine is active.
      </Text>
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 10,
          marginTop: 8,
          opacity: 0.8,
        }}
      >
        ID: {widgetId}
      </Text>
    </View>
  );
};

export default AndroidNotificationWidget;
