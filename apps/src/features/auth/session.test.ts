import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { observeSession } from "./session";
const session = { user: { id: "a" } } as Session;
function setup() {
  let event!: (event: AuthChangeEvent, session: Session | null) => void;
  const unsubscribe = vi.fn();
  const auth = {
    onAuthStateChange: vi.fn((cb) => {
      event = cb;
      return { data: { subscription: { unsubscribe } } };
    }),
    getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "a", email_confirmed_at: "confirmed" } },
      error: null,
    }),
  };
  const callbacks = { session: vi.fn(), error: vi.fn() };
  return {
    auth,
    callbacks,
    unsubscribe,
    event: (type: AuthChangeEvent, value: Session | null) => event(type, value),
    client: { auth } as unknown as SupabaseClient,
  };
}
describe("session lifecycle", () => {
  it("restores stored sessions only after backend user validation", async () => {
    const s = setup();
    observeSession(s.client, s.callbacks);
    await vi.waitFor(() => expect(s.callbacks.session).toHaveBeenCalled());
    expect(s.callbacks.session.mock.calls[0]![0].user.email_confirmed_at).toBe(
      "confirmed",
    );
  });
  it("fails closed on network/expired user errors", async () => {
    const s = setup();
    s.auth.getUser.mockResolvedValue({ error: new Error("Offline") });
    observeSession(s.client, s.callbacks);
    await vi.waitFor(() => expect(s.callbacks.error).toHaveBeenCalledOnce());
    expect(s.callbacks.session).not.toHaveBeenCalled();
  });
  it("a logout event wins over a late restoration response", async () => {
    const s = setup();
    let finish!: (value: unknown) => void;
    s.auth.getSession.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    observeSession(s.client, s.callbacks);
    s.event("SIGNED_OUT", null);
    finish({ data: { session }, error: null });
    await Promise.resolve();
    expect(s.callbacks.session).toHaveBeenCalledTimes(1);
    expect(s.callbacks.session).toHaveBeenCalledWith(null, "SIGNED_OUT");
  });
  it("refresh/recovery events update state and unmount unsubscribes", async () => {
    const s = setup();
    const stop = observeSession(s.client, s.callbacks);
    s.event("PASSWORD_RECOVERY", session);
    s.event("TOKEN_REFRESHED", session);
    stop();
    await Promise.resolve();
    expect(s.callbacks.session).toHaveBeenCalledTimes(2);
    expect(s.unsubscribe).toHaveBeenCalledOnce();
    s.event("SIGNED_IN", session);
    expect(s.callbacks.session).toHaveBeenCalledTimes(2);
  });
});
