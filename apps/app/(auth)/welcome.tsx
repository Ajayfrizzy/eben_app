import { BrandLogo } from "../../src/components/brand";
import { Text } from "react-native";
import { router } from "expo-router";
import { styles } from "../../src/theme";
import { Button, Card, Screen } from "../../src/components/ui";
export default function Welcome() {
  return (
    <Screen>
      <BrandLogo />
      <Text accessibilityRole="header" style={styles.title}>
        Dare. Learn. Build Africa.
      </Text>
      <Text style={[styles.body, styles.muted]}>
        Eben Institute connects students to trusted communities, practical learning,
        events and verified opportunities.
      </Text>
      <Card accent>
        <Text style={styles.heading}>Made for purposeful students</Text>
        <Text style={styles.body}>
          Grow with a moderated community and resources curated for your journey.
        </Text>
      </Card>
      <Button label="Create account" onPress={() => router.push("/sign-up")} />
      <Button
        variant="secondary"
        label="I already have an account"
        onPress={() => router.push("/sign-in")}
      />
    </Screen>
  );
}
