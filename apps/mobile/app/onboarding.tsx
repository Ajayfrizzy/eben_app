import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { styles } from "../src/theme";
import { Button, Field } from "../src/components/ui";
import { profileSchema } from "@eben/validation";
import { supabase } from "../src/services/supabase";
export default function Onboarding() {
  const [form, setForm] = useState({
    fullName: "",
    country: "",
    city: "",
    institution: "",
    programme: "",
    level: "",
    interests: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const field = (key: keyof typeof form, p: string) => (
    <Field
      placeholder={p}
      value={form[key]}
      onChangeText={(v) => setForm({ ...form, [key]: v })}
    />
  );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tell us about you</Text>
      <Text style={styles.muted}>You can control profile visibility later.</Text>
      {field("fullName", "Full name")}
      {field("country", "Country")}
      {field("city", "State or city")}
      {field("institution", "Institution")}
      {field("programme", "Programme / department")}
      {field("level", "Study level")}
      {field("interests", "Interests (comma separated)")}
      <Button
        label={loading ? "Saving profile…" : "Complete profile"}
        disabled={loading}
        onPress={async () => {
          const parsed = profileSchema.safeParse({
            fullName: form.fullName,
            country: form.country,
            city: form.city,
            institution: form.institution,
            programme: form.programme,
            studyLevel: form.level,
            interests: form.interests
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            skills: [],
          });
          if (!parsed.success)
            return setError(
              parsed.error.issues[0]?.message ?? "Complete every required field",
            );
          setLoading(true);
          try {
            if (supabase) {
              const { data } = await supabase.auth.getUser();
              if (!data.user)
                throw new Error("Your session expired. Please sign in again.");
              const { error: profileError } = await supabase.from("profiles").upsert({
                id: data.user.id,
                full_name: parsed.data.fullName,
                country: parsed.data.country,
                city: parsed.data.city,
                programme: parsed.data.programme,
                study_level: parsed.data.studyLevel,
                onboarding_complete: true,
              });
              if (profileError) throw profileError;
            }
            router.replace("/home");
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to save profile");
          } finally {
            setLoading(false);
          }
        }}
      />
      {!!error && <Text style={{ color: "#FB7185" }}>{error}</Text>}
    </ScrollView>
  );
}
