import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { observeSession } from "./features/auth/session";
import { identity } from "./features/auth/client";
import { Button } from "./components/ui";
import { AppState, Text, View } from "react-native";
import { styles } from "./theme";
import { backendConfigurationError, supabase } from "./services/supabase";

type AuthState = {
  loading: boolean;
  session: Session | null;
  demo: boolean;
  recovery: boolean;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  session: null,
  demo: false,
  recovery: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const userId = useRef<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [restoreError, setRestoreError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setRestoreError("");
    const stop = observeSession(supabase, {
      session: (next, event) => {
        if (userId.current !== (next?.user.id ?? null)) {
          cache.clear();
          userId.current = next?.user.id ?? null;
        }
        if (event === "SIGNED_OUT") {
          identity?.clearRecovery();
          setRecovery(false);
          cache.clear();
        }
        if (event === "PASSWORD_RECOVERY") setRecovery(true);
        setRestoreError("");
        setSession(next);
        setLoading(false);
      },
      error: () => {
        cache.clear();
        setSession(null);
        setLoading(false);
        setRestoreError(
          "Unable to restore your session. Check your connection and try again.",
        );
      },
    });
    if (AppState.currentState === "active") supabase.auth.startAutoRefresh();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase!.auth.startAutoRefresh();
      else supabase!.auth.stopAutoRefresh();
    });
    return () => {
      stop();
      listener.remove();
      supabase!.auth.stopAutoRefresh();
    };
  }, [attempt, cache]);

  useEffect(() => {
    if (!session?.expires_at) return;
    const timer = setTimeout(
      () => {
        setSession(null);
        setRecovery(false);
        cache.clear();
      },
      Math.max(0, session.expires_at * 1000 - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session, cache]);

  const value = useMemo(
    () => ({ loading, session, recovery, demo: !supabase && !backendConfigurationError }),
    [loading, session, recovery],
  );
  if (backendConfigurationError) {
    return (
      <View style={[styles.screen, styles.content]}>
        <Text accessibilityRole="alert" style={styles.body}>
          {backendConfigurationError}
        </Text>
      </View>
    );
  }
  if (restoreError)
    return (
      <View style={[styles.screen, styles.content]}>
        <Text accessibilityRole="alert" style={styles.body}>
          {restoreError}
        </Text>
        <Button label="Try again" onPress={() => setAttempt((n) => n + 1)} />
        <Button
          label="Clear local session"
          onPress={() => {
            void supabase?.auth.signOut({ scope: "local" }).then(({ error }) => {
              if (!error) setAttempt((n) => n + 1);
            });
          }}
        />
      </View>
    );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
