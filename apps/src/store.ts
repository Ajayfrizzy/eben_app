import { create } from "zustand";
type State = {
  demo: boolean;
  offline: boolean;
  setOffline: (v: boolean) => void;
};
export const useAppStore = create<State>((set) => ({
  demo: !process.env.EXPO_PUBLIC_SUPABASE_URL,
  offline: false,
  setOffline: (offline) => set({ offline }),
}));
