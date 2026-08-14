import { useState } from "react";
import { Text, View } from "react-native";
import { styles } from "../../src/theme";
import { Button, Field } from "../../src/components/ui";
import { supabase } from "../../src/services/supabase";
export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <View style={[styles.screen, styles.content]}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.muted}>We will email a secure reset link.</Text>
      <Field placeholder="Email" value={email} onChangeText={setEmail} />
      <Button
        label="Send reset link"
        onPress={async () => {
          if (supabase)
            await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: "eben://reset-password",
            });
          setSent(true);
        }}
      />
      {sent && (
        <Text style={styles.body}>
          Check your inbox. The link may take a moment to arrive.
        </Text>
      )}
    </View>
  );
}
