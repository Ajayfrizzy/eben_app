import { Alert, ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { styles } from "../../src/theme";
import { Button, Card } from "../../src/components/ui";
import { supabase } from "../../src/services/supabase";
export default function Profile() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your profile</Text>
      <Card>
        <Text style={styles.heading}>Daring Student</Text>
        <Text style={styles.muted}>
          Student · Profile visibility: connections
        </Text>
        <Text style={styles.body}>
          Add your institution, skills and interests to improve what Eben
          recommends.
        </Text>
        <Button
          label="Edit profile"
          onPress={() => router.push("/onboarding")}
        />
      </Card>
      <Card>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.body}>
          Notification preferences · Privacy controls · Terms · Help
        </Text>
      </Card>
      <Button
        label="Sign out"
        onPress={async () => {
          await supabase?.auth.signOut();
          router.replace("/welcome");
        }}
      />
      <Button
        label="Request account deletion"
        onPress={() =>
          Alert.alert(
            "Delete account",
            "Your request will be reviewed and personal data deleted according to the retention policy.",
            ["Cancel", "Request deletion"] as any,
          )
        }
      />
    </ScrollView>
  );
}
