import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { resources } from "../../src/data";
import { styles } from "../../src/theme";
import { Card, Field, State } from "../../src/components/ui";
export default function Library() {
  const [q, setQ] = useState("");
  const data = useMemo(
    () =>
      resources.filter((r) =>
        (r.title + r.category).toLowerCase().includes(q.toLowerCase()),
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
            <Text style={styles.title}>Digital library</Text>
            <Field
              placeholder="Search resources"
              value={q}
              onChangeText={setQ}
            />
            <Text style={styles.muted}>
              Articles · Documents · Video · Audio · Links
            </Text>
          </>
        }
        ListEmptyComponent={<State empty="No resources match your search." />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/library/[id]",
                params: { id: item.id },
              })
            }
          >
            <Card>
              <Text style={styles.heading}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.category} · {item.type}
              </Text>
              <Text style={styles.body}>{item.summary}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
