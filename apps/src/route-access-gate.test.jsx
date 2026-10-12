import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouteAccessGate } from "./route-access-gate";

const auth = vi.hoisted(() => ({ loading: false, session: null, demo: false }));
vi.mock("./auth", () => ({ useAuth: () => auth }));
vi.mock("./theme", () => ({ styles: {}, colors: {} }));
vi.mock("react-native", () => ({
  Text: ({ accessibilityRole, ...props }) => <span role={accessibilityRole} {...props} />,
  View: "div",
  ActivityIndicator: () => <span>Loading session</span>,
}));
vi.mock("expo-router", () => ({ Redirect: ({ href }) => <span>Redirect: {href}</span> }));

beforeEach(() => {
  vi.stubGlobal("__DEV__", false);
  Object.assign(auth, { loading: false, session: null, demo: false });
});

const render = () =>
  renderToStaticMarkup(
    <RouteAccessGate route="(tabs)">Fixture student content</RouteAccessGate>,
  );

describe("mounted route gate", () => {
  it("never renders fixture children in a configured authenticated release", () => {
    auth.session = { user: { email_confirmed_at: "2026-10-12" } };
    const markup = render();
    expect(markup).toContain("Student content is not available");
    expect(markup).not.toContain("Fixture student content");
  });
  it("redirects signed-out live users", () => {
    expect(render()).toContain("Redirect: /sign-in");
    expect(render()).not.toContain("Fixture student content");
  });
  it("does not flash content during restoration", () => {
    auth.loading = true;
    expect(render()).toContain("Loading session");
    expect(render()).not.toContain("Fixture student content");
  });
  it("retains development-only demo access", () => {
    vi.stubGlobal("__DEV__", true);
    auth.demo = true;
    expect(render()).toContain("Fixture student content");
  });
});
