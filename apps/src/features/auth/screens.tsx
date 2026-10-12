import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ZodError } from "zod";
import { signInSchema, signUpSchema, emailSchema } from "@eben/validation";
import { Button, Field } from "../../components/ui";
import { styles } from "../../theme";
import { useAuth } from "../../auth";
import { useAppStore } from "../../store";
import { requireIdentity } from "./client";
import { legalDocuments, legalReady } from "./legal";
export function message(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Check your details";
  return error instanceof Error
    ? error.message
    : "Unable to complete the request. Check your connection and try again.";
}
export function AuthForm({ mode }: { mode: "signup" | "signin" | "forgot" | "verify" }) {
  const { demo } = useAuth();
  const offline = useAppStore((s) => s.offline);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const signup = mode === "signup";
  const passwordNeeded = signup || mode === "signin";
  const ready = legalReady();
  const submit = async () => {
    if (busy) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const input = signInSchema.parse({ email, password });
        if (!demo) await requireIdentity().signIn(input);
        router.replace(demo ? "/home" : "/profile");
      } else if (signup) {
        const input = signUpSchema.parse({ email, password, acceptTerms: accepted });
        if (demo) {
          router.replace("/onboarding");
          return;
        }
        setNotice(await requireIdentity().register(input));
        setPassword("");
      } else {
        const valid = emailSchema.parse(email);
        if (!demo) {
          if (mode === "verify") await requireIdentity().resend(valid);
          else await requireIdentity().requestRecovery(valid);
        }
        setNotice(
          demo
            ? "Demo mode: no email was sent."
            : "If the account is eligible, an email will arrive shortly. Check your inbox and spam folder.",
        );
      }
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  };
  const openLegal = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError("Unable to open the document. Check your connection.");
    }
  };
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {signup
          ? "Join Eben Institute"
          : mode === "signin"
            ? "Welcome back"
            : mode === "verify"
              ? "Verify your email"
              : "Reset password"}
      </Text>
      {demo && (
        <Text style={styles.muted}>
          Development demo — no live account or consent record is created.
        </Text>
      )}
      {offline && (
        <Text accessibilityRole="alert" style={styles.muted}>
          You are offline. Reconnect to continue.
        </Text>
      )}
      <Field
        accessibilityLabel="Email address"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {passwordNeeded && (
        <Field
          accessibilityLabel="Password"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      )}
      {signup && (
        <>
          {ready ? (
            <View style={styles.row}>
              <Text
                accessibilityRole="link"
                style={styles.body}
                onPress={() => {
                  void openLegal(legalDocuments.terms);
                }}
              >
                Terms
              </Text>
              <Text
                accessibilityRole="link"
                style={styles.body}
                onPress={() => {
                  void openLegal(legalDocuments.privacy);
                }}
              >
                Privacy Policy
              </Text>
            </View>
          ) : (
            <Text accessibilityRole="alert" style={styles.muted}>
              Approved Terms and Privacy Policy are not yet available. Live registration
              is unavailable.
            </Text>
          )}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            accessibilityLabel="Accept Terms and Privacy Policy"
            onPress={() => setAccepted(!accepted)}
            style={styles.row}
          >
            <Text style={styles.body}>
              {accepted ? "☑" : "☐"} I accept the Terms and Privacy Policy
            </Text>
          </Pressable>
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      )}
      {!!notice && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {notice}
        </Text>
      )}
      <Button
        label={
          busy
            ? "Please wait…"
            : signup
              ? "Create account"
              : mode === "signin"
                ? "Sign in"
                : mode === "verify"
                  ? "Resend verification email"
                  : "Send reset link"
        }
        onPress={() => {
          void submit();
        }}
        disabled={
          busy || (!demo && offline) || (signup && (!accepted || (!demo && !ready)))
        }
      />
      {mode === "signin" && (
        <>
          <Button
            label="Forgot password?"
            onPress={() => router.push("/forgot-password")}
          />
          <Button label="Verify email" onPress={() => router.push("/verify-email")} />
        </>
      )}
      {mode !== "signin" && (
        <Button label="Back to sign in" onPress={() => router.replace("/sign-in")} />
      )}
    </ScrollView>
  );
}
export function CallbackScreen({ recovery }: { recovery: boolean }) {
  const params = useLocalSearchParams<{
    code?: string;
    token_hash?: string;
    type?: string;
    error?: string;
    error_code?: string;
  }>();
  const callbackParams = new URLSearchParams();
  for (const key of ["code", "token_hash", "type", "error", "error_code"] as const)
    if (typeof params[key] === "string") callbackParams.set(key, params[key]);
  const callbackUrl = callbackParams.size
    ? `eben://${recovery ? "reset-password" : "auth-callback"}?${callbackParams}`
    : null;
  const auth = useAuth();
  const offline = useAppStore((s) => s.offline);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const handle = async (url: string | null) => {
      if (!url || !/^(eben:\/\/)(reset-password|auth-callback)/.test(url)) {
        if (active) setBusy(false);
        return;
      }
      if (active) {
        setBusy(true);
        setReady(false);
        setError("");
      }
      try {
        const result = await requireIdentity().handleCallback(url);
        if (!active) return;
        if (result === "recovery") {
          setReady(true);
          if (!recovery) router.replace("/reset-password");
        } else {
          setError("Email verified. You can now sign in.");
        }
      } catch (cause) {
        if (active) setError(message(cause));
      } finally {
        if (active) setBusy(false);
      }
    };
    void (callbackUrl ? Promise.resolve(callbackUrl) : Linking.getInitialURL())
      .then(handle)
      .catch(() => {
        if (active) {
          setBusy(false);
          setError("Unable to read the link. Request a new email.");
        }
      });
    const listener = Linking.addEventListener("url", ({ url }) => {
      void handle(url);
    });
    return () => {
      active = false;
      listener.remove();
    };
  }, [recovery, callbackUrl]);
  const allowed = recovery && (ready || auth.recovery);
  return (
    <View style={[styles.screen, styles.content]}>
      <Text style={styles.title}>
        {recovery ? "Choose a new password" : "Email verification"}
      </Text>
      {busy && <Text style={styles.body}>Checking your link…</Text>}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      )}
      {recovery && !busy && !allowed && (
        <Text style={styles.body}>
          Open a valid recovery email on this device. A normal signed-in session cannot
          reset your password here.
        </Text>
      )}
      {allowed && (
        <>
          <Field
            accessibilityLabel="New password"
            placeholder="New password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            label={busy ? "Updating…" : "Update password"}
            disabled={busy || offline}
            onPress={() => {
              setBusy(true);
              setError("");
              void requireIdentity()
                .updatePassword(password)
                .then(() => {
                  setReady(false);
                  router.replace("/sign-in");
                })
                .catch((cause) => setError(message(cause)))
                .finally(() => setBusy(false));
            }}
          />
        </>
      )}
      <Button
        label="Request a new recovery email"
        onPress={() => {
          void requireIdentity()
            .logout()
            .then(() => router.replace("/forgot-password"))
            .catch((cause) => setError(message(cause)));
        }}
      />
      <Button
        label="Back to sign in"
        onPress={() => {
          void requireIdentity()
            .logout()
            .then(() => router.replace("/sign-in"))
            .catch((cause) => setError(message(cause)));
        }}
      />
    </View>
  );
}
