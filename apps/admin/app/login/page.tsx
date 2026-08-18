"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const values = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Configure the admin Supabase environment variables before signing in.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(values.get("email") ?? ""),
      password: String(values.get("password") ?? ""),
    });
    setLoading(false);
    if (authError) setError(authError.message);
    else router.replace("/dashboard");
  };
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-surface p-8"
      >
        <h1 className="text-3xl font-black">Staff sign in</h1>
        <p className="mb-6 text-slate-400">Authorised Eben Institute staff only.</p>
        <label className="mb-4 grid gap-2">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-xl border border-slate-600 bg-navy p-3"
          />
        </label>
        <label className="mb-6 grid gap-2">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-xl border border-slate-600 bg-navy p-3"
          />
        </label>
        {error && (
          <p className="mb-4 text-rose-400" role="alert">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-coral p-3 font-bold text-navy disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in securely"}
        </button>
      </form>
    </main>
  );
}
