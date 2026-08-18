import { RefreshControl, ScrollView, Text } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { styles, colors } from "../../src/theme";
import { Card, Button } from "../../src/components/ui";
import { events, posts, resources, opportunities } from "../../src/data";
import { useAppStore } from "../../src/store";
export default function Home() {
  const [refreshing, setRefreshing] = useState(false);
  const offline = useAppStore((s) => s.offline);
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 500);
          }}
        />
      }
    >
      {offline && (
        <Text style={{ color: colors.amber }}>Offline · showing cached content</Text>
      )}
      <Text style={styles.title}>Hello, daring student</Text>
      <Text style={styles.muted}>What will you learn or build today?</Text>
      <Card>
        <Text style={{ color: colors.amber, fontWeight: "800" }}>EBEN CAMPAIGN</Text>
        <Text style={styles.heading}>Ideas into African solutions</Text>
        <Text style={styles.body}>
          Join the August town hall and shape our next challenge.
        </Text>
        <Button label="View event" onPress={() => router.push("/events/e1")} />
      </Card>
      <Text style={styles.heading}>Featured conversation</Text>
      <Card>
        <Text style={styles.muted}>{posts[0]!.author.fullName} · General</Text>
        <Text style={styles.body}>{posts[0]!.body}</Text>
      </Card>
      <Text style={styles.heading}>Featured learning</Text>
      {resources.slice(0, 2).map((r) => (
        <Card key={r.id}>
          <Text style={styles.heading}>{r.title}</Text>
          <Text style={styles.muted}>
            {r.category} · {r.type}
          </Text>
        </Card>
      ))}
      <Text style={styles.heading}>Coming up</Text>
      <Card>
        <Text style={styles.heading}>{events[0]!.title}</Text>
        <Text style={styles.body}>{new Date(events[0]!.startsAt).toLocaleString()}</Text>
      </Card>
      <Text style={styles.heading}>Selected opportunity</Text>
      <Card>
        <Text style={styles.heading}>{opportunities[0]!.title}</Text>
        <Text style={styles.muted}>{opportunities[0]!.organisation}</Text>
      </Card>
    </ScrollView>
  );
}
