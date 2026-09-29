import { useMemo, useState } from "react";
import { FlatList, Linking, Text, View } from "react-native";
import { opportunities } from "../../src/data";
import { styles, colors } from "../../src/theme";
import { Button, Card, Field, State } from "../../src/components/ui";
export default function Opportunities() {
  const [q, setQ] = useState("");
  const data = useMemo(
    () =>
      opportunities.filter((o) =>
        (o.title + o.type + o.location).toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );
  return (
    <View style={styles.screen}>
      <FlatList
        data={data}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Opportunities</Text>
            <Field
              placeholder="Search scholarships, internships…"
              value={q}
              onChangeText={setQ}
            />
          </>
        }
        ListEmptyComponent={<State empty="No opportunities found." />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.heading}>
              {item.title}{" "}
              {item.verified && <Text style={{ color: colors.teal }}>✓</Text>}
            </Text>
            <Text style={styles.muted}>
              {item.type} · {item.location}
            </Text>
            <Text style={styles.body}>{item.summary}</Text>
            <Text style={{ color: colors.amber }}>Deadline {item.deadline}</Text>
            <Button
              label="Open external application"
              onPress={() => Linking.openURL(item.applicationUrl)}
            />
          </Card>
        )}
      />
    </View>
  );
}
