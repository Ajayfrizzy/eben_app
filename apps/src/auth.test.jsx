import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./auth";

const backend = vi.hoisted(() => ({
  supabase: null,
  backendConfigurationError: null,
}));
vi.mock("./services/supabase", () => backend);
vi.mock("react-native", () => ({
  Text: ({ accessibilityRole, ...props }) => <span role={accessibilityRole} {...props} />,
  View: "div",
}));
vi.mock("./theme", () => ({ styles: {} }));

beforeEach(() => {
  backend.backendConfigurationError = null;
});

describe("backend startup gate", () => {
  it("renders app content when development demo mode is permitted", () => {
    expect(renderToStaticMarkup(<AuthProvider>Student routes</AuthProvider>)).toContain(
      "Student routes",
    );
  });

  it("shows a visible error and blocks routes for invalid release configuration", () => {
    backend.backendConfigurationError = "Backend configuration is missing.";
    const markup = renderToStaticMarkup(<AuthProvider>Student routes</AuthProvider>);
    expect(markup).toContain("Backend configuration is missing.");
    expect(markup).not.toContain("Student routes");
  });
});
