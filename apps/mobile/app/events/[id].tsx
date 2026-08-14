import { useState } from "react";
import { ScrollView, Share, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { events } from "../../src/data";
import { styles, colors } from "../../src/theme";
import { Button, Card, State } from "../../src/components/ui";
export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = events.find((e) => e.id === id);
  const [rsvp, setRsvp] = useState(item?.rsvped ?? false);
  if (!item)
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <State error="Event not found." />
      </ScrollView>
    );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={{ color: colors.teal }}>{item.format.toUpperCase()}</Text>
      <Card>
        <Text style={styles.body}>{item.summary}</Text>
        <Text style={styles.body}>
          {new Date(item.startsAt).toLocaleString()}
        </Text>
        <Text style={styles.muted}>
          {item.venue ?? "Online"} · {item.organiser}
        </Text>
        <Text style={styles.muted}>
          {item.attendeeCount + (rsvp ? 1 : 0)} attending
        </Text>
      </Card>
      <Button
        label={rsvp ? "Cancel RSVP" : "RSVP"}
        onPress={() => setRsvp(!rsvp)}
      />
      <Button
        label="Add to calendar"
        onPress={() =>
          Share.share({ message: item.title + " — " + item.startsAt })
        }
      />
      <Text style={styles.muted}>
        RSVP reminders follow your notification preferences.
      </Text>
    </ScrollView>
  );
}
