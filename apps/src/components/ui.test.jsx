import { Button, Field, Feedback, State } from "./ui";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("react-native", async () => await import("react-native-web"));
vi.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => <div>{children}</div>,
}));

describe("accessible shared controls", () => {
  it("exposes disabled buttons to assistive technology", () => {
    const html = renderToStaticMarkup(<Button label="Create account" disabled />);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Create account");
  });
  it("retains field labels after a value has been entered and keeps passwords secure", () => {
    const html = renderToStaticMarkup(
      <Field accessibilityLabel="Password" value="example" secureTextEntry />,
    );
    expect(html).toContain('aria-label="Password"');
    expect(html).toContain('type="password"');
    expect(html).toContain(">Password</");
  });
  it("announces errors and offers retry", () => {
    const html = renderToStaticMarkup(
      <State error="Connection failed" retry={() => {}} />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Connection failed");
    expect(html).toContain("Try again");
  });
  it("announces informational feedback without an error role", () => {
    const html = renderToStaticMarkup(<Feedback>Draft saved</Feedback>);
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('role="alert"');
  });
});
