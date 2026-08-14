import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { styles, colors } from "../theme";
export const Card = ({ children }: { children: ReactNode }) => (
  <View style={styles.card}>{children}</View>
);
export const Button = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={[styles.button, disabled && { opacity: 0.5 }]}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);
export const Field = (p: TextInputProps) => (
  <TextInput
    placeholderTextColor={colors.muted}
    {...p}
    style={[styles.input, p.style]}
  />
);
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
}) =>
  loading ? (
    <ActivityIndicator color={colors.teal} />
  ) : (
    <Card>
      <Text style={styles.body}>{error ?? empty}</Text>
      {retry && <Button label="Try again" onPress={retry} />}
    </Card>
  );
