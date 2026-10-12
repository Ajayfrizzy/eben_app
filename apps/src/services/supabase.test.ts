import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, secureStorage, platform } = vi.hoisted(() => ({
  createClient: vi.fn<typeof import("@supabase/supabase-js").createClient>(),
  secureStorage: {
    getItemAsync: vi.fn(),
    setItemAsync: vi.fn(),
    deleteItemAsync: vi.fn(),
  },
  platform: { OS: "web" },
}));

vi.mock("react-native-url-polyfill/auto", () => ({}));
vi.mock("react-native", () => ({ Platform: platform }));
vi.mock("expo-secure-store", () => secureStorage);
vi.mock("@supabase/supabase-js", () => ({ createClient }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.stubGlobal("__DEV__", true);
  vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "test-key");
  platform.OS = "web";
});

describe("Supabase session storage", () => {
  it("uses browser storage on web instead of native SecureStore", async () => {
    await import("./supabase");
    expect(createClient).toHaveBeenCalledWith("https://test.supabase.co", "test-key", {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  });

  it("persists native sessions through SecureStore", async () => {
    platform.OS = "android";
    await import("./supabase");
    const storage = createClient.mock.calls[0]![2]!.auth!.storage!;
    await storage.setItem("session", "token");
    await storage.getItem("session");
    await storage.removeItem("session");
    expect(secureStorage.setItemAsync).toHaveBeenCalledWith("session", "token");
    expect(secureStorage.getItemAsync).toHaveBeenCalledWith("session");
    expect(secureStorage.deleteItemAsync).toHaveBeenCalledWith("session");
  });

  it("keeps demo mode available in development when both credentials are absent", async () => {
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "");
    const { supabase, requireBackend } = await import("./supabase");
    expect(supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
    expect(requireBackend).toThrow("Add Expo Supabase variables");
  });
});

describe("Supabase configuration safety", () => {
  it.each([
    [false, "", ""],
    [false, "  ", "  "],
    [true, "https://test.supabase.co", "  "],
    [false, "https://test.supabase.co", ""],
    [false, "", "test-key"],
    [true, "https://test.supabase.co", ""],
    [true, "", "test-key"],
    [false, "https://your-project.supabase.co", "your-anon-key"],
  ])("blocks invalid config (development=%s, url=%s, key=%s)", async (dev, url, key) => {
    vi.stubGlobal("__DEV__", dev);
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", key);
    const { supabase, backendConfigurationError, requireBackend } =
      await import("./supabase");
    expect(backendConfigurationError).toContain("missing valid backend configuration");
    expect(supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
    expect(requireBackend).toThrow();
  });

  it("connects configured release builds", async () => {
    vi.stubGlobal("__DEV__", false);
    const { backendConfigurationError } = await import("./supabase");
    expect(backendConfigurationError).toBeNull();
    expect(createClient).toHaveBeenCalledOnce();
  });
});
