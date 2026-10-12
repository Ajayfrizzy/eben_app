import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useStudentProfile } from "./features/profile/hooks";
import { Button, State } from "./components/ui";
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
  const profile = useStudentProfile();
  const access = getRouteAccess(route, {
    ...auth,
    development: __DEV__,
    onboardingComplete: profile.data?.onboarding_complete,
    profileLoading: profile.isPending,
    profileError: profile.isError,
  });
  if (access === "recovery") return <Redirect href="/reset-password" />;
  if (access === "onboarding") return <Redirect href="/onboarding" />;
  if (access === "profile-error")
    return (
      <State
        error="Unable to load your profile."
        retry={() => {
          void profile.refetch();
        }}
      />
    );
  if (access === "loading") return <ActivityIndicator color={colors.teal} />;
  if (access === "sign-in") return <Redirect href="/sign-in" />;
  if (access === "unavailable") {
    return (
      <View style={[styles.screen, styles.content]}>
        <Text accessibilityRole="alert" style={styles.body}>
          Student content is not available in this release yet.
        </Text>
        <Button
          label="Your profile"
          onPress={() => {
            void import("expo-router").then(({ router }) => router.replace("/profile"));
          }}
        />
      </View>
    );
  }
  return children;
}
