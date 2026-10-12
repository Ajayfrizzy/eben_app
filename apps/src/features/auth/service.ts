import type { SupabaseClient, Session } from "@supabase/supabase-js";
import {
  emailSchema,
  passwordSchema,
  signInSchema,
  signUpSchema,
} from "@eben/validation";
import { legalDocuments, legalReady, type LegalDocuments } from "./legal";

export function createIdentityService(
  client: SupabaseClient,
  documents: LegalDocuments = legalDocuments,
) {
  const registrationNotice =
    "If registration is available for this email, check your inbox to verify it. If you already have an account, sign in or reset your password.";
  let recovery: { userId: string; until: number } | null = null;
  let callbackInFlight: {
    url: string;
    promise: Promise<"recovery" | "verified">;
  } | null = null;
  const clearRecovery = () => {
    recovery = null;
  };
  return {
    clearRecovery,
    hasRecovery(session: Session | null) {
      return Boolean(
        session &&
        recovery?.userId === session.user.id &&
        recovery.until > Date.now() &&
        (session.expires_at ?? 0) * 1000 > Date.now(),
      );
    },
    async register(input: unknown) {
      const parsed = signUpSchema.parse(input);
      if (!legalReady(documents))
        throw new Error(
          "Approved Terms and Privacy Policy are not yet available. Registration is unavailable.",
        );
      const { data, error } = await client.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
          emailRedirectTo: "eben://auth-callback",
          data: {
            consent_terms_version: documents.termsVersion,
            consent_privacy_version: documents.privacyVersion,
            consent_terms_effective_date: documents.termsEffectiveDate,
            consent_privacy_effective_date: documents.privacyEffectiveDate,
            consent_terms_url: documents.terms,
            consent_privacy_url: documents.privacy,
            consent_accepted: true,
          },
        },
      });
      if (error && ["user_already_exists", "email_exists"].includes(error.code ?? ""))
        return registrationNotice;
      if (error) throw error;
      // Do not disclose whether an email already exists. Supabase may return an obfuscated user.
      if (data.session) {
        const result = await client.auth.signOut({ scope: "local" });
        if (result.error) throw result.error;
      }
      return registrationNotice;
    },
    async signIn(input: unknown) {
      clearRecovery();
      const { data, error } = await client.auth.signInWithPassword(
        signInSchema.parse(input),
      );
      if (error) throw error;
      if (!data.session || !data.user?.email_confirmed_at) {
        await client.auth.signOut({ scope: "local" });
        throw new Error("Verify your email before signing in.");
      }
      return data.session;
    },
    async resend(email: string) {
      const { error } = await client.auth.resend({
        type: "signup",
        email: emailSchema.parse(email),
        options: { emailRedirectTo: "eben://auth-callback" },
      });
      if (error) throw error;
    },
    async requestRecovery(email: string) {
      clearRecovery();
      const { error } = await client.auth.resetPasswordForEmail(
        emailSchema.parse(email),
        { redirectTo: "eben://reset-password" },
      );
      if (error) throw error;
    },
    handleCallback(raw: string): Promise<"recovery" | "verified"> {
      if (callbackInFlight?.url === raw) return callbackInFlight.promise;
      const promise = (async () => {
        clearRecovery();
        if (raw.length > 8192)
          throw new Error("Invalid or expired link. Request a new email.");
        const url = new URL(raw);
        const route = (url.hostname + url.pathname).replace(/\/$/, "");
        if (
          url.protocol !== "eben:" ||
          !["reset-password", "auth-callback"].includes(route)
        )
          throw new Error("Invalid authentication link.");
        const params = url.searchParams;
        if (params.has("error") || params.has("error_code") || url.hash)
          throw new Error(
            "Invalid or unsupported link. Request a new email on this device.",
          );
        let session: Session | null = null;
        let isRecovery = false;
        if (params.get("code")) {
          const { data, error } = await client.auth.exchangeCodeForSession(
            params.get("code")!,
          );
          if (error)
            throw new Error(
              "Invalid or expired link. Request a new email on this device.",
            );
          session = data.session;
          // Supabase derives redirectType from the stored PKCE verifier, not URL input.
          isRecovery = "redirectType" in data && data.redirectType === "recovery";
        } else if (
          params.get("token_hash") &&
          ["recovery", "signup"].includes(params.get("type") ?? "")
        ) {
          const type = params.get("type") as "recovery" | "signup";
          const { data, error } = await client.auth.verifyOtp({
            token_hash: params.get("token_hash")!,
            type,
          });
          if (error) throw new Error("Invalid or expired link. Request a new email.");
          session = data.session;
          isRecovery = type === "recovery";
        } else
          throw new Error(
            "This link has no valid verification code. Request a new email.",
          );
        if (!session) throw new Error("The link did not establish a session.");
        if (route === "reset-password" && !isRecovery) {
          await client.auth.signOut({ scope: "local" });
          throw new Error("A password recovery link is required.");
        }
        if (isRecovery) {
          recovery = { userId: session.user.id, until: Date.now() + 10 * 60 * 1000 };
          return "recovery" as const;
        }
        const { error } = await client.auth.signOut({ scope: "local" });
        if (error) throw error;
        return "verified" as const;
      })();
      callbackInFlight = { url: raw, promise };
      // Keep successful callbacks deduplicated; a failed network operation may be retried.
      void promise.catch(() => {
        if (callbackInFlight?.promise === promise) callbackInFlight = null;
      });
      return promise;
    },
    async updatePassword(password: string) {
      const parsed = passwordSchema.parse(password);
      const { data, error } = await client.auth.getSession();
      if (
        error ||
        !data.session ||
        !recovery ||
        recovery.userId !== data.session.user.id ||
        recovery.until <= Date.now()
      )
        throw new Error("Open a new recovery email before changing your password.");
      const user = await client.auth.getUser();
      if (user.error || user.data.user?.id !== recovery.userId)
        throw new Error("Your recovery session expired. Request a new link.");
      const update = await client.auth.updateUser({ password: parsed });
      if (update.error) throw update.error;
      clearRecovery();
      const result = await client.auth.signOut({ scope: "local" });
      if (result.error)
        throw new Error(
          "Password updated, but sign-out failed. Please sign out before continuing.",
        );
    },
    async logout() {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      clearRecovery();
      callbackInFlight = null;
    },
  };
}
