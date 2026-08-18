import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { styles } from "../../src/theme";
import { Button, Field } from "../../src/components/ui";
import { supabase } from "../../src/services/supabase";
import { signInSchema } from "@eben/validation";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setError("");
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setLoading(true);
    try {
      if (supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
        if (authError) throw authError;
      }
      router.replace("/home");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={[styles.screen, styles.content]}>
      <Text style={styles.title}>Welcome back</Text>
      <Field
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!error && <Text style={{ color: "#FB7185" }}>{error}</Text>}
      <Button
        label={loading ? "Signing in…" : "Sign in"}
        onPress={submit}
        disabled={loading}
      />
      <Text style={styles.muted} onPress={() => router.push("/forgot-password")}>
        Forgot password?
      </Text>
    </View>
  );
}
