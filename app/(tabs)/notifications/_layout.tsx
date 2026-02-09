import { Stack } from 'expo-router';

export default function NotificationsLayout() {
    return (
        <Stack screenOptions={{
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
            },
        }}>
            <Stack.Screen name="index" options={{ title: 'Notifications' }} />
        </Stack>
    );
}
