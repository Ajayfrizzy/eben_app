import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { channels, posts } from "../../../src/data";
import { styles } from "../../../src/theme";
import { Button, Card, Field, State } from "../../../src/components/ui";
export default function Channel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const channel = channels.find((c) => c.id === id);
  const [body, setBody] = useState("");
  const [data, setData] = useState(posts.filter((p) => p.channelId === id));
  if (!channel)
    return (
      <View style={[styles.screen, styles.content]}>
        <State error="Channel not found." />
      </View>
    );
  return (
    <View style={styles.screen}>
      <FlatList
        data={data}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              {channel.icon} {channel.name}
            </Text>
            <Text style={styles.muted}>{channel.description}</Text>
            <Card>
              <Field
                multiline
                placeholder="Share something useful…"
                value={body}
                onChangeText={setBody}
              />
              <Button
                label="Publish post"
                disabled={!body.trim()}
                onPress={() => {
                  setData([
                    {
                      id: Date.now().toString(),
                      channelId: id,
                      author: { id: "me", fullName: "You" },
                      body,
                      createdAt: new Date().toISOString(),
                      reactionCount: 0,
                      commentCount: 0,
                    },
                    ...data,
                  ]);
                  setBody("");
                }}
              />
            </Card>
          </>
        }
        ListEmptyComponent={
          <State empty="Start the first thoughtful conversation." />
        }
        renderItem={({ item }) => (
          <Card>
            {item.pinned && <Text style={styles.chipText}>PINNED</Text>}
            <Text style={styles.muted}>{item.author.fullName}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.muted}>
              ♡ {item.reactionCount} Comments {item.commentCount} Save Report
            </Text>
          </Card>
        )}
      />
    </View>
  );
}
