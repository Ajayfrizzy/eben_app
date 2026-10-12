import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
export function observeSession(
  client: SupabaseClient,
  callbacks: {
    session: (session: Session | null, event?: AuthChangeEvent) => void;
    error: () => void;
  },
) {
  let active = true;
  let eventReceived = false;
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (!active || event === "INITIAL_SESSION") return;
    eventReceived = true;
    callbacks.session(session, event);
  });
  void client.auth
    .getSession()
    .then(async ({ data, error }) => {
      if (!active || eventReceived) return;
      if (error) throw error;
      if (!data.session) {
        callbacks.session(null);
        return;
      }
      const verified = await client.auth.getUser();
      if (!active || eventReceived) return;
      if (verified.error) throw verified.error;
      callbacks.session(
        verified.data.user ? { ...data.session, user: verified.data.user } : null,
      );
    })
    .catch(() => {
      if (active && !eventReceived) callbacks.error();
    });
  return () => {
    active = false;
    data.subscription.unsubscribe();
  };
}
