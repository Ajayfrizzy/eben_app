import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { styles } from "../src/theme";
import { Button, Field } from "../src/components/ui";
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
      <Text style={styles.muted}>
        You can control profile visibility later.
      </Text>
      {field("fullName", "Full name")}
      {field("country", "Country")}
      {field("city", "State or city")}
      {field("institution", "Institution")}
      {field("programme", "Programme / department")}
      {field("level", "Study level")}
      {field("interests", "Interests (comma separated)")}
      <Button
        label="Complete profile"
        onPress={() => router.replace("/home")}
      />
    </ScrollView>
  );
}
