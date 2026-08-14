import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { styles } from "../../src/theme";
import { Button, Field } from "../../src/components/ui";
import { supabase } from "../../src/services/supabase";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async () => {
    setError("");
    if (supabase) {
      const { error: e } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (e) return setError(e.message);
    }
    router.replace("/home");
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
      <Button label="Sign in" onPress={submit} />
      <Text
        style={styles.muted}
        onPress={() => router.push("/forgot-password")}
      >
        Forgot password?
      </Text>
    </View>
  );
}
