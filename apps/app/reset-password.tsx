import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { passwordSchema } from "@eben/validation";
import { Button, Field } from "../src/components/ui";
import { supabase } from "../src/services/supabase";
import { styles } from "../src/theme";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setError("");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success)
      return setError(parsed.error.issues[0]?.message ?? "Choose a stronger password");
    if (!supabase) return router.replace("/sign-in");
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data,
      });
      if (updateError) throw updateError;
      router.replace("/home");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={[styles.screen, styles.content]}>
      <Text style={styles.title}>Choose a new password</Text>
      <Field
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!error && <Text style={{ color: "#FB7185" }}>{error}</Text>}
      <Button
        label={loading ? "Updating…" : "Update password"}
        onPress={submit}
        disabled={loading}
      />
    </View>
  );
}
