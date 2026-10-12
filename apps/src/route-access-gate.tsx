import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "./auth";
import { getRouteAccess } from "./route-access";
import { colors, styles } from "./theme";

export function RouteAccessGate({
  route,
  children,
}: {
  route: string;
  children: ReactNode;
}) {
  const auth = useAuth();
  const access = getRouteAccess(route, { ...auth, development: __DEV__ });
  if (access === "loading") return <ActivityIndicator color={colors.teal} />;
  if (access === "sign-in") return <Redirect href="/sign-in" />;
  if (access === "unavailable") {
    return (
      <View style={[styles.screen, styles.content]}>
        <Text accessibilityRole="alert" style={styles.body}>
          Student content is not available in this release yet.
        </Text>
      </View>
    );
  }
  return children;
}
