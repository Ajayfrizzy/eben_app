import type { Session } from "@supabase/supabase-js";

const publicRoutes = new Set([
  "index",
  "(auth)/welcome",
  "(auth)/sign-in",
  "(auth)/sign-up",
  "(auth)/forgot-password",
  "reset-password",
]);

type AccessState = {
  loading: boolean;
  session: Session | null;
  demo: boolean;
  development: boolean;
};

export function getRouteAccess(route: string, state: AccessState) {
  if (publicRoutes.has(route)) return "allow";
  if (state.loading) return "loading";
  const demoAllowed = state.development && state.demo;
  if (!demoAllowed && !state.session?.user.email_confirmed_at) return "sign-in";
  // All current student content routes still contain fixtures or placeholder UI.
  // Fail closed for release builds until each route has a live data implementation.
  if (!state.development && route !== "onboarding") return "unavailable";
  return "allow";
}
