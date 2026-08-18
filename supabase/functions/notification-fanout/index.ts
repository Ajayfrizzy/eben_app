import { context, json, requireRole } from "../_shared/security.ts";
Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const { user, admin } = await context(req);
    await requireRole(admin, user.id, ["admin", "super_admin"]);
    const payload = await req.json();
    if (!payload.title || !payload.body || !payload.idempotencyKey)
      return json({ error: "Invalid payload" }, 400);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id")
      .is("deletion_requested_at", null);
    const rows = profiles.map((p: any) => ({
      user_id: p.id,
      title: payload.title,
      body: payload.body,
      kind: "broadcast",
      target_url: payload.targetUrl,
      idempotency_key: payload.idempotencyKey + ":" + p.id,
    }));
    const { error } = await admin
      .from("notifications")
      .upsert(rows, { onConflict: "idempotency_key", ignoreDuplicates: true });
    if (error) throw error;
    return json({ stored: rows.length });
  } catch (e) {
    return json({ error: e.message }, e.message === "Forbidden" ? 403 : 401);
  }
});
