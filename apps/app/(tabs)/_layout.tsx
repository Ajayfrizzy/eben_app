import { Tabs, router } from "expo-router";
import { Pressable, Text } from "react-native";
import { RouteAccessGate } from "../../src/route-access-gate";
import { colors } from "../../src/theme";
const icons: { [k: string]: string } = {
  home: "⌂",
  community: "◉",
  library: "▤",
  opportunities: "★",
  profile: "●",
};
export default function TabsLayout() {
  return (
    <Tabs
      screenLayout={({ route, children }) => (
        <RouteAccessGate route={route.name}>{children}</RouteAccessGate>
      )}
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: "#24415F",
        },
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{icons[route.name]}</Text>
        ),
        headerRight: () => (
          <Pressable onPress={() => router.push("/notifications")}>
            <Text style={{ color: colors.text, fontSize: 20, marginRight: 18 }}>●</Text>
          </Pressable>
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="community" options={{ title: "Community" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="opportunities" options={{ title: "Opportunities" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
