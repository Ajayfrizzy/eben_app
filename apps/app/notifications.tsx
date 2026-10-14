import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { notifications } from "../src/data";
import { styles, colors } from "../src/theme";
import { Card, State } from "../src/components/ui";
export default function Notifications() {
  const [data, setData] = useState(notifications);
  return (
    <View style={styles.screen}>
      <FlatList
        data={data}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Notifications</Text>}
        ListEmptyComponent={<State empty="You are all caught up." />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setData((current) =>
                current.map((n) =>
                  n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n,
                ),
              );
              if (item.targetUrl) router.push(item.targetUrl as never);
            }}
          >
            <Card>
              <Text style={[styles.heading, !item.readAt && { color: colors.primary }]}>
                {item.title}
              </Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.muted}>{item.readAt ? "Read" : "Unread"}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
