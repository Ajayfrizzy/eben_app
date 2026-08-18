import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
export async function context(req: Request) {
  const token = req.headers.get("authorization");
  if (!token) throw new Error("Unauthorised");
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: token } } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorised");
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  return { user: data.user, client, admin };
}
export async function requireRole(admin: any, userId: string, allowed: string[]) {
  const { data } = await admin
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId);
  if (!data?.some((x: any) => allowed.includes(x.roles.name)))
    throw new Error("Forbidden");
}
