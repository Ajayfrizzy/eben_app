import { useState } from "react";
import { Text, View } from "react-native";
import { styles } from "../../src/theme";
import { Button, Field } from "../../src/components/ui";
import { supabase } from "../../src/services/supabase";
export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <View style={[styles.screen, styles.content]}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.muted}>We will email a secure reset link.</Text>
      <Field placeholder="Email" value={email} onChangeText={setEmail} />
      <Button
        label="Send reset link"
        onPress={async () => {
          setError("");
          setLoading(true);
          try {
            if (!supabase) {
              setSent(true);
              return;
            }
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
              email.trim(),
              {
                redirectTo: "eben://reset-password",
              },
            );
            if (resetError) throw resetError;
            setSent(true);
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Unable to send reset link",
            );
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading || !email.trim()}
      />
      {!!error && <Text style={{ color: "#FB7185" }}>{error}</Text>}
      {sent && (
        <Text style={styles.body}>
          Check your inbox. The link may take a moment to arrive.
        </Text>
      )}
    </View>
  );
}
