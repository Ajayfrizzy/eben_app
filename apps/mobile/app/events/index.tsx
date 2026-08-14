import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { events } from "../../src/data";
import { styles } from "../../src/theme";
import { Card } from "../../src/components/ui";
export default function Events() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={events}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Events</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/events/[id]", params: { id: item.id } })
            }
          >
            <Card>
              <Text style={styles.heading}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.format} · {new Date(item.startsAt).toLocaleString()}
              </Text>
              <Text style={styles.body}>{item.summary}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
