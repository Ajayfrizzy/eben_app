import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, colors } from "../theme";
export const Screen = ({ children }: { children: ReactNode }) => (
  <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={96}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
export const Card = ({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) => (
  <View
    style={[styles.card, accent && { borderTopWidth: 4, borderTopColor: colors.gold }]}
  >
    {children}
  </View>
);
export const Button = ({
  label,
  onPress,
  disabled = false,
  variant = "primary",
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      variant === "secondary" && { backgroundColor: colors.surface },
      variant === "danger" && {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
      },
      pressed && {
        backgroundColor:
          variant === "secondary"
            ? colors.surfaceAlt
            : variant === "danger"
              ? colors.dangerPressed
              : colors.primaryPressed,
      },
      disabled && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
    ]}
  >
    <Text
      style={[
        styles.buttonText,
        variant === "secondary" && { color: colors.primary },
        disabled && { color: colors.muted },
      ]}
    >
      {label}
    </Text>
  </Pressable>
);
export function Field(p: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const label = p.accessibilityLabel ?? p.placeholder;
  return (
    <View style={{ gap: 8 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        autoCorrect={false}
        {...p}
        accessibilityLabel={label}
        onFocus={(event) => {
          setFocused(true);
          p.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          p.onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && { borderColor: colors.primary, borderWidth: 2 },
          p.style,
        ]}
      />
    </View>
  );
}
export function Feedback({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tone === "error" ? colors.dangerSurface : colors.infoSurface },
      ]}
    >
      <Text
        accessibilityRole={tone === "error" ? "alert" : undefined}
        accessibilityLiveRegion="polite"
        style={[styles.body, { color: tone === "error" ? colors.danger : colors.info }]}
      >
        {children}
      </Text>
    </View>
  );
}
export const State = ({
  loading,
  error,
  empty,
  retry,
}: {
  loading?: boolean;
  error?: string;
  empty?: string;
  retry?: () => void;
}) => (
  <View style={styles.content}>
    {loading ? (
      <View accessibilityLiveRegion="polite" style={styles.card}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.body}>Loading…</Text>
      </View>
    ) : (
      <Card>
        <Feedback tone={error ? "error" : "info"}>{error ?? empty}</Feedback>
        {retry && <Button label="Try again" onPress={retry} />}
      </Card>
    )}
  </View>
);
