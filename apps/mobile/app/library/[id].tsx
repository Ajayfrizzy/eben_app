import { Linking, ScrollView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { resources } from "../../src/data";
import { styles } from "../../src/theme";
import { Button, Card, State } from "../../src/components/ui";
export default function Resource() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = resources.find((r) => r.id === id);
  if (!item)
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <State error="Resource not found." />
      </ScrollView>
    );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.muted}>
        {item.type} · {item.category}
      </Text>
      <Card>
        <Text style={styles.body}>{item.summary}</Text>
        <Text style={styles.muted}>
          By {item.author} · Published {item.publishedAt}
        </Text>
      </Card>
      <Button label="Bookmark resource" />
      {item.url && (
        <Button
          label="Open resource"
          onPress={() => Linking.openURL(item.url!)}
        />
      )}
      <Text style={styles.muted}>
        Materials remain the property of their credited owners. Access controls
        cannot completely prevent screenshots or copying.
      </Text>
    </ScrollView>
  );
}
