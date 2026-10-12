import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const storage = {
  getItem: (k: string) => SecureStore.getItemAsync(k),
  setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  removeItem: (k: string) => SecureStore.deleteItemAsync(k),
};
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          // On web, Supabase uses browser storage; SecureStore is native-only.
          ...(Platform.OS !== "web" ? { storage } : {}),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
export const requireBackend = () => {
  if (!supabase) throw new Error("Add Expo Supabase variables to connect the backend.");
  return supabase;
};
