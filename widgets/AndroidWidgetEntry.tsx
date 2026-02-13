import React from 'react';
import { View, Text } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

export async function WidgetTaskHandler(props: any) {
  try {
    console.log('[Widget] Inline Handler - Render Attempt');

    // Minimal render with standard components
    // Inline definition avoids React dispatcher issues with external components in React 19
    props.renderWidget(
      <View style={{
        flex: 1,
        width: 320,
        height: 200,
        backgroundColor: '#4CAF50', // Success Green
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16
      }}>
        <Text style={{
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 'bold'
        }}>
          Widget Active
        </Text>
        <Text style={{ color: '#ffffff', marginTop: 8 }}>
          Rendering Success
        </Text>
      </View>
    );
    console.log('[Widget] Render command sent');
  } catch (error) {
    console.error('[Widget] Critical Render Error:', error);
  }
}

registerWidgetTaskHandler(WidgetTaskHandler);

export default WidgetTaskHandler;
