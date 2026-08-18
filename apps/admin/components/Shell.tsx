"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase";

const nav = [
  "Overview",
  "Users",
  "Channels",
  "Moderation",
  "Library",
  "Events",
  "Opportunities",
  "Announcements",
  "Audit logs",
  "Settings",
];

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-700 bg-surface p-6">
        <h1 className="text-2xl font-black">
          EBEN <span className="text-coral">ADMIN</span>
        </h1>
        <p className="mb-8 text-sm text-slate-400">Secure staff workspace</p>
        <nav className="grid gap-2">
          {nav.map((item, index) => (
            <button
              key={item}
              className={`rounded-xl px-4 py-3 text-left ${index === 0 ? "bg-coral font-bold text-navy" : "text-slate-300 hover:bg-slate-700"}`}
            >
              {item}
            </button>
          ))}
        </nav>
        <button
          className="mt-8 rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-700"
          onClick={async () => {
            const supabase = createSupabaseBrowserClient();
            if (supabase) await supabase.auth.signOut();
            router.replace("/login");
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
