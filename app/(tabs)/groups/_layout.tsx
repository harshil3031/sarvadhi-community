import { Stack } from 'expo-router';

export default function GroupsLayout() {
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
            <Stack.Screen name="index" options={{ title: 'Groups' }} />
            <Stack.Screen name="[id]" options={{ title: 'Group' }} />
        </Stack>
    );
}
