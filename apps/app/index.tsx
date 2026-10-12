import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/auth";
import { colors } from "../src/theme";
export default function Index() {
  const { loading, session } = useAuth();
  if (loading) return <ActivityIndicator color={colors.teal} />;
  return <Redirect href={session ? "/profile" : "/welcome"} />;
}
