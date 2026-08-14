import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { channels } from "../../src/data";
import { styles } from "../../src/theme";
import { Card } from "../../src/components/ui";
export default function Community() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={channels}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Communities</Text>
            <Text style={styles.muted}>
              Moderated spaces for thoughtful student conversations.
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/community/channel/[id]",
                params: { id: item.id },
              })
            }
          >
            <Card>
              <Text style={styles.heading}>
                {item.icon} {item.name}
              </Text>
              <Text style={styles.muted}>{item.description}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
