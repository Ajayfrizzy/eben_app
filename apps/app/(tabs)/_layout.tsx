import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Tabs, router } from "expo-router";
import { Pressable, useWindowDimensions, Text } from "react-native";
import { RouteAccessGate } from "../../src/route-access-gate";
import { colors } from "../../src/theme";
const icons: Record<string, ComponentProps<typeof Ionicons>["name"]> = {
  home: "home-outline",
  community: "people-outline",
  library: "book-outline",
  opportunities: "briefcase-outline",
  profile: "person-outline",
};
export default function TabsLayout() {
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenLayout={({ route, children }) => (
        <RouteAccessGate route={route.name}>{children}</RouteAccessGate>
      )}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 56 + 24 * fontScale + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarItemStyle: { minHeight: 48 },
        tabBarLabel: ({ color, children }) => (
          <Text style={{ color, fontSize: 12, textAlign: "center" }}>{children}</Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color }) => (
          <Ionicons name={icons[route.name]} color={color} size={24} accessible={false} />
        ),
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={{
              minWidth: 48,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              color={colors.primary}
              size={24}
              accessible={false}
            />
          </Pressable>
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="community" options={{ title: "Community" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: "Opportunities",
          tabBarAccessibilityLabel: "Opportunities",
          tabBarLabel: "Discover",
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
