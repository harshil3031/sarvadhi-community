import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useNotificationStore } from "../../src/store/notification.store";
import { useDMStore } from "../../src/store/dm.store";

export default function TabLayout() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const messageUnreadCount = useDMStore((state) => state.unreadCount);
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
        },

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: Platform.OS === "ios" ? 0 : 1,
          borderTopColor: "#E5E7EB",
          height: Platform.OS === "ios" ? 88 : 60,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },

        tabBarItemStyle: {
          marginHorizontal: 6,
          borderRadius: 12,
        },

        tabBarBadgeStyle: {
          backgroundColor: "#2563EB",
          color: "#FFFFFF",
          fontSize: 10,
          fontWeight: "700",
          minWidth: 18,
          height: 18,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* Feed */}
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          headerTitle: "Feed",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Channels */}
      <Tabs.Screen
        name="channels"
        options={{
          headerShown: false, // Internal stack handles its own header
          title: "Channels",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Groups */}
      <Tabs.Screen
        name="groups"
        options={{
          headerShown: false, // Internal stack handles its own header
          title: "Groups",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Messages */}
      <Tabs.Screen
        name="messages"
        options={{
          headerShown: false, // Internal stack handles its own header
          title: "Messages",
          tabBarBadge: messageUnreadCount > 0 ? messageUnreadCount : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "mail" : "mail-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Notifications */}
      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          title: "Notifications",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden routes */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
