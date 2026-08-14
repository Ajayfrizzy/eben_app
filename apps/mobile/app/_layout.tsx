import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/theme";
import { useAppStore } from "../src/store";
const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, retry: 2 } },
});
export default function Layout() {
  const setOffline = useAppStore((s) => s.setOffline);
  useEffect(
    () => NetInfo.addEventListener((s) => setOffline(s.isConnected === false)),
    [setOffline],
  );
  return (
    <QueryClientProvider client={client}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.navy },
        }}
      />
    </QueryClientProvider>
  );
}
