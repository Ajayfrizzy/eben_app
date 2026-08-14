import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { styles } from "../../src/theme";
import { Button, Field } from "../../src/components/ui";
import { signUpSchema } from "@eben/validation";
import { supabase } from "../../src/services/supabase";
export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async () => {
    const parsed = signUpSchema.safeParse({
      email,
      password,
      acceptTerms: true,
    });
    if (!parsed.success)
      return setError(parsed.error.issues[0]?.message ?? "Check your details");
    if (supabase) {
      const { error: e } = await supabase.auth.signUp({ email, password });
      if (e) return setError(e.message);
    }
    router.replace("/onboarding");
  };
  return (
    <View style={[styles.screen, styles.content]}>
      <Text style={styles.title}>Join Eben Institute</Text>
      <Field
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        placeholder="Password (8+ characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.muted}>
        Continuing means you accept the Terms and Privacy Policy.
      </Text>
      {!!error && <Text style={{ color: "#FB7185" }}>{error}</Text>}
      <Button label="Create account" onPress={submit} />
    </View>
  );
}
