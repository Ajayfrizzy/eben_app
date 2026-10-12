import type { Session } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getRouteAccess } from "./route-access";

const verifiedSession = {
  user: { email_confirmed_at: "2026-10-12T00:00:00Z" },
} as Session;
const base = {
  loading: false,
  session: null,
  demo: false,
  development: false,
  onboardingComplete: true,
};
const privateRoutes = [
  "(tabs)",
  "community/channel/[id]",
  "library/[id]",
  "events/index",
  "events/[id]",
  "notifications",
  "onboarding",
];

describe("student route access", () => {
  it.each(privateRoutes)("blocks direct navigation without a session: %s", (route) => {
    expect(getRouteAccess(route, base)).toBe("sign-in");
    expect(getRouteAccess(route, { ...base, development: true })).toBe("sign-in");
  });
  it.each(privateRoutes)(
    "waits for restoration and rejects unverified sessions: %s",
    (route) => {
      expect(getRouteAccess(route, { ...base, loading: true })).toBe("loading");
      expect(getRouteAccess(route, { ...base, session: { user: {} } as Session })).toBe(
        "sign-in",
      );
    },
  );
  it.each(privateRoutes.filter((route) => !["onboarding", "(tabs)"].includes(route)))(
    "blocks release fixtures even with a verified session: %s",
    (route) => {
      expect(getRouteAccess(route, { ...base, session: verifiedSession })).toBe(
        "unavailable",
      );
    },
  );
  it("requires complete onboarding before normal access", () => {
    expect(
      getRouteAccess("profile", {
        ...base,
        session: verifiedSession,
        onboardingComplete: false,
      }),
    ).toBe("onboarding");
    expect(
      getRouteAccess("profile", {
        ...base,
        session: verifiedSession,
        profileError: true,
      }),
    ).toBe("profile-error");
    expect(
      getRouteAccess("profile", {
        ...base,
        session: verifiedSession,
        profileLoading: true,
      }),
    ).toBe("loading");
    expect(getRouteAccess("profile", { ...base, session: verifiedSession })).toBe(
      "allow",
    );
    expect(
      getRouteAccess("profile", { ...base, session: verifiedSession, recovery: true }),
    ).toBe("recovery");
  });
  it("allows verified onboarding and live development sessions", () => {
    expect(getRouteAccess("onboarding", { ...base, session: verifiedSession })).toBe(
      "allow",
    );
    expect(
      getRouteAccess("(tabs)", { ...base, session: verifiedSession, development: true }),
    ).toBe("allow");
  });
  it("only permits demo access in development", () => {
    expect(getRouteAccess("(tabs)", { ...base, demo: true })).toBe("sign-in");
    expect(getRouteAccess("(tabs)", { ...base, demo: true, development: true })).toBe(
      "allow",
    );
  });
  it("denies new release routes by default", () => {
    expect(getRouteAccess("future-content", { ...base, session: verifiedSession })).toBe(
      "unavailable",
    );
  });
  it("keeps recovery and sign-in accessible without a session", () => {
    for (const route of [
      "index",
      "(auth)/welcome",
      "(auth)/sign-in",
      "(auth)/sign-up",
      "(auth)/forgot-password",
      "reset-password",
    ]) {
      expect(getRouteAccess(route, base)).toBe("allow");
    }
  });
  it("removes private access after logout or a failed restoration", () => {
    expect(getRouteAccess("onboarding", { ...base, session: verifiedSession })).toBe(
      "allow",
    );
    expect(getRouteAccess("onboarding", base)).toBe("sign-in");
  });
});
