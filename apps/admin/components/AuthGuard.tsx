"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      router.replace("/login");
      return;
    }
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.replace("/login");
      const { data: memberships, error } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", data.session.user.id);
      const allowed = memberships?.some((membership) => {
        const role = membership.roles as unknown as { name?: string } | null;
        return (
          role?.name &&
          ["moderator", "programme_manager", "admin", "super_admin"].includes(role.name)
        );
      });
      if (error || !allowed) {
        await supabase.auth.signOut();
        router.replace("/login?error=unauthorised");
      } else setReady(true);
    });
  }, [router]);
  if (!ready)
    return <main className="grid min-h-screen place-items-center">Checking access…</main>;
  return children;
}
