import { Stack } from 'expo-router';

export default function ChannelsLayout() {
    return (
        <Stack screenOptions={{
            headerShown: true,
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
            },
            headerShadowVisible: false,
        }}>
            <Stack.Screen name="index" options={{ title: 'Channels' }} />
            <Stack.Screen name="[id]" options={{ title: 'Channel' }} />
        </Stack>
    );
}
