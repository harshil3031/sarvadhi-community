/**
 * Channel Stack Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { ChannelListScreen } from '../screens/ChannelListScreen';
import { ChannelDetailsScreen } from '../screens/ChannelDetailsScreen';
import { ChannelStackParamList } from './types';

const Stack = createStackNavigator<ChannelStackParamList>();

export const ChannelStack: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ChannelList"
        component={ChannelListScreen}
        options={{ title: 'Channels' }}
      />
      <Stack.Screen
        name="ChannelDetails"
        component={ChannelDetailsScreen}
        options={({ route }: { route: any }) => ({ title: route.params.channelName })}
      />
    </Stack.Navigator>
  );
};
