import { StyleSheet } from "react-native";
import { colors } from "@eben/config";
export { colors };
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  content: { padding: 16, gap: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  heading: { color: colors.text, fontSize: 20, fontWeight: "700" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#294766",
  },
  button: {
    backgroundColor: colors.coral,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#071426", fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  chipText: { color: colors.teal, fontWeight: "600" },
});
