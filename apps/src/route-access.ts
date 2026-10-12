import type { Session } from "@supabase/supabase-js";

const publicRoutes = new Set([
  "index",
  "(auth)/welcome",
  "(auth)/sign-in",
  "(auth)/sign-up",
  "(auth)/forgot-password",
  "reset-password",
  "auth-callback",
  "(auth)/verify-email",
]);

type AccessState = {
  loading: boolean;
  session: Session | null;
  demo: boolean;
  development: boolean;
  onboardingComplete?: boolean;
  profileLoading?: boolean;
  profileError?: boolean;
  recovery?: boolean;
};

export function getRouteAccess(route: string, state: AccessState) {
  if (state.recovery && route !== "reset-password" && route !== "auth-callback")
    return "recovery";
  if (publicRoutes.has(route)) return "allow";
  if (state.loading) return "loading";
  const demoAllowed = state.development && state.demo;
  if (!demoAllowed && !state.session?.user.email_confirmed_at) return "sign-in";
  if (!demoAllowed && route !== "onboarding" && route !== "edit-profile") {
    if (state.profileLoading) return "loading";
    if (state.profileError) return "profile-error";
    if (!state.onboardingComplete) return "onboarding";
  }
  // All current student content routes still contain fixtures or placeholder UI.
  // Fail closed for release builds until each route has a live data implementation.
  if (
    !state.development &&
    !["onboarding", "edit-profile", "(tabs)", "profile"].includes(route)
  )
    return "unavailable";
  return "allow";
}
