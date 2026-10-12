import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabase";

type AuthState = {
  loading: boolean;
  session: Session | null;
  demo: boolean;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  session: null,
  demo: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(Boolean(supabase));
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    let authStateReceived = false;
    void supabase.auth.getSession().then(
      ({ data }) => {
        if (!active || authStateReceived) return;
        setSession(data.session);
        setLoading(false);
      },
      () => {
        if (!active || authStateReceived) return;
        setSession(null);
        setLoading(false);
      },
    );
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authStateReceived = true;
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ loading, session, demo: !supabase }),
    [loading, session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
