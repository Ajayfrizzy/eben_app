import { create } from "zustand";
type State = {
  offline: boolean;
  setOffline: (v: boolean) => void;
};
export const useAppStore = create<State>((set) => ({
  offline: false,
  setOffline: (offline) => set({ offline }),
}));
