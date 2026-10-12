import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { createIdentityService } from "./service";
import { legalReady } from "./legal";
import { sanitizeNativeIntent } from "./native-intent";
const user = { id: "student-a", email_confirmed_at: "2026-10-12" };
const session = { user, expires_at: Math.floor(Date.now() / 1000) + 3600 } as Session;
const legal = {
  terms: "https://legal.example.test/terms",
  privacy: "https://legal.example.test/privacy",
  termsVersion: "test-v1",
  privacyVersion: "test-v2",
  termsEffectiveDate: "2026-01-01",
  privacyEffectiveDate: "2026-01-01",
  approved: true,
};
const credentials = { email: "student@example.test", password: "Password123" };
function setup() {
  const auth = {
    signUp: vi.fn().mockResolvedValue({ data: { user, session: null }, error: null }),
    signInWithPassword: vi
      .fn()
      .mockResolvedValue({ data: { user, session }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resend: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    exchangeCodeForSession: vi
      .fn()
      .mockResolvedValue({ data: { session, redirectType: "recovery" }, error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
  };
  const client = { auth } as unknown as SupabaseClient;
  return { auth, client, service: createIdentityService(client, legal) };
}
beforeEach(() => vi.restoreAllMocks());
describe("registration and login", () => {
  it("requires real consent and approved document configuration before signup", async () => {
    const { auth, service, client } = setup();
    await expect(
      service.register({ ...credentials, acceptTerms: false }),
    ).rejects.toThrow();
    await expect(
      createIdentityService(client, { ...legal, terms: "" }).register({
        ...credentials,
        acceptTerms: true,
      }),
    ).rejects.toThrow("Approved Terms");
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(legalReady({ ...legal, terms: "http://unsafe.test" })).toBe(false);
    expect(legalReady({ ...legal, approved: false })).toBe(false);
    expect(legalReady({ ...legal, termsEffectiveDate: "2026-02-30" })).toBe(false);
    expect(legalReady({ ...legal, privacyEffectiveDate: "2099-01-01" })).toBe(false);
    expect(legalReady({ ...legal, privacyVersion: "" })).toBe(false);
  });
  it("sends a consent snapshot and returns a privacy-preserving verification message", async () => {
    const { auth, service } = setup();
    expect(await service.register({ ...credentials, acceptTerms: true })).toContain(
      "If registration is available",
    );
    expect(auth.signUp.mock.calls[0]![0].options.data).toEqual({
      consent_accepted: true,
      consent_terms_version: "test-v1",
      consent_privacy_version: "test-v2",
      consent_terms_effective_date: "2026-01-01",
      consent_privacy_effective_date: "2026-01-01",
      consent_terms_url: legal.terms,
      consent_privacy_url: legal.privacy,
    });
  });
  it("handles obfuscated duplicate accounts without asserting successful account creation", async () => {
    const { auth, service } = setup();
    auth.signUp.mockResolvedValue({
      data: { user: { identities: [] }, session: null },
      error: null,
    });
    expect(await service.register({ ...credentials, acceptTerms: true })).toContain(
      "already have an account",
    );
  });
  it("handles explicit duplicate registration without revealing account existence", async () => {
    const { auth, service } = setup();
    auth.signUp.mockResolvedValue({ error: { code: "user_already_exists" } });
    expect(await service.register({ ...credentials, acceptTerms: true })).toContain(
      "If registration is available",
    );
  });
  it("surfaces registration network errors", async () => {
    const { auth, service } = setup();
    auth.signUp.mockRejectedValue(new Error("Offline"));
    await expect(service.register({ ...credentials, acceptTerms: true })).rejects.toThrow(
      "Offline",
    );
  });
  it("accepts verified login, rejects unverified and failed login", async () => {
    const { auth, service } = setup();
    expect(await service.signIn(credentials)).toEqual(session);
    auth.signInWithPassword.mockResolvedValue({
      data: { session, user: { ...user, email_confirmed_at: null } },
      error: null,
    });
    await expect(service.signIn(credentials)).rejects.toThrow("Verify");
    expect(auth.signOut).toHaveBeenCalled();
    auth.signInWithPassword.mockResolvedValue({
      error: new Error("Invalid credentials"),
    });
    await expect(service.signIn(credentials)).rejects.toThrow("Invalid credentials");
  });
  it("validates email before recovery/resend calls", async () => {
    const { auth, service } = setup();
    await expect(service.requestRecovery("invalid")).rejects.toThrow();
    await expect(service.resend("invalid")).rejects.toThrow();
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
    await service.requestRecovery(credentials.email);
    await service.resend(credentials.email);
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(credentials.email, {
      redirectTo: "eben://reset-password",
    });
  });
  it("does not report logout success on failure", async () => {
    const { auth, service } = setup();
    auth.signOut.mockResolvedValue({ error: new Error("Offline") });
    await expect(service.logout()).rejects.toThrow("Offline");
  });
});
describe("recovery proof and callbacks", () => {
  it("rejects password updates from an ordinary session", async () => {
    const { auth, service } = setup();
    await expect(service.updatePassword("Password456")).rejects.toThrow("recovery email");
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
  it("exchanges PKCE once and consumes recovery authorization after update", async () => {
    const { auth, service } = setup();
    const url = "eben://reset-password?code=test-code";
    expect(await service.handleCallback(url)).toBe("recovery");
    await service.handleCallback(url);
    expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    await service.updatePassword("Password456");
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "Password456" });
    await expect(service.updatePassword("Password789")).rejects.toThrow("recovery email");
  });
  it("verifies token hashes with recovery type before granting access", async () => {
    const { auth, service } = setup();
    await service.handleCallback(
      "eben://reset-password?token_hash=test-hash&type=recovery",
    );
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "test-hash",
      type: "recovery",
    });
    expect(service.hasRecovery(session)).toBe(true);
  });
  it("does not trust a recovery route/type when a PKCE signup code is supplied", async () => {
    const { auth, service } = setup();
    auth.exchangeCodeForSession.mockResolvedValue({
      data: { session, redirectType: null },
      error: null,
    });
    await expect(
      service.handleCallback("eben://reset-password?code=signup&type=recovery"),
    ).rejects.toThrow("recovery link");
    expect(service.hasRecovery(session)).toBe(false);
  });
  it("signs out after successful signup verification", async () => {
    const { auth, service } = setup();
    expect(
      await service.handleCallback("eben://auth-callback?token_hash=test&type=signup"),
    ).toBe("verified");
    expect(auth.signOut).toHaveBeenCalled();
  });
  it.each([
    "eben://reset-password",
    "https://host/reset-password?code=x",
    "eben://reset-password#error=expired",
    "eben://reset-password?error=expired",
    "eben://reset-password?token_hash=x&type=magiclink",
  ])("rejects unsafe callbacks: %s", async (url) => {
    const { service } = setup();
    await expect(service.handleCallback(url)).rejects.toThrow();
  });
  it("fails safely on expired links and account mismatch", async () => {
    const { auth, service } = setup();
    auth.verifyOtp.mockResolvedValueOnce({ error: new Error("expired") });
    await expect(
      service.handleCallback("eben://reset-password?token_hash=x&type=recovery"),
    ).rejects.toThrow("expired");
    await service.handleCallback("eben://reset-password?code=valid");
    auth.getUser.mockResolvedValue({ data: { user: { id: "other" } } });
    await expect(service.updatePassword("Password456")).rejects.toThrow("expired");
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
  it("expires recovery permission and preserves retry on update failure", async () => {
    const { auth, service } = setup();
    await service.handleCallback("eben://reset-password?code=x");
    auth.updateUser.mockResolvedValue({ error: new Error("network") });
    await expect(service.updatePassword("Password456")).rejects.toThrow("network");
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 11 * 60 * 1000);
    await expect(service.updatePassword("Password456")).rejects.toThrow("recovery email");
  });
});
describe("native URL decoder mitigation", () => {
  it("rejects malformed UTF-8 and huge external URLs before router decoding", () => {
    expect(sanitizeNativeIntent("eben://home?q=%FF")).toContain("error=invalid_link");
    expect(sanitizeNativeIntent("eben://home?q=" + "%C2".repeat(5000))).toContain(
      "error=invalid_link",
    );
    expect(sanitizeNativeIntent("eben://home?q=%E2%82%AC")).toBe(
      "eben://home?q=%E2%82%AC",
    );
  });
});
