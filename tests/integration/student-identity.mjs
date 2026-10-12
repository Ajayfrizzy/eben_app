import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const url = process.env.EBEN_TEST_SUPABASE_URL;
if (
  !url ||
  !["127.0.0.1", "localhost"].includes(new URL(url).hostname) ||
  process.env.EBEN_TEST_ISOLATED !== "yes"
) {
  throw new Error(
    "Refusing to run: explicitly select an isolated loopback Supabase instance.",
  );
}
const anonKey = process.env.EBEN_TEST_ANON_KEY;
const serviceKey = process.env.EBEN_TEST_SERVICE_ROLE_KEY;
if (!anonKey || !serviceKey) throw new Error("Local test keys are required.");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceKey, options);
const anonymous = createClient(url, anonKey, options);
const users = [];
let count = 0;
function check(name, condition) {
  assert.ok(condition, name);
  count++;
  console.log("PASS " + name);
}
async function student(confirmed = true) {
  const email = "eben-test-" + randomUUID() + "@example.test";
  const password = "Test-" + randomUUID() + "A1";
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: confirmed,
    user_metadata: {
      consent_accepted: true,
      consent_terms_version: "integration-only",
      consent_privacy_version: "integration-only",
      consent_terms_effective_date: "2026-01-01",
      consent_privacy_effective_date: "2026-01-01",
      consent_terms_url: "https://example.test/terms",
      consent_privacy_url: "https://example.test/privacy",
    },
  });
  assert.ifError(created.error);
  users.push(created.data.user.id);
  const client = createClient(url, anonKey, options);
  const signed = await client.auth.signInWithPassword({ email, password });
  return { id: created.data.user.id, client, signed, email, password };
}
try {
  const a = await student();
  const b = await student();
  const u = await student(false);
  assert.ifError(a.signed.error);
  assert.ifError(b.signed.error);
  check("unverified login rejected", Boolean(u.signed.error) && !u.signed.data.session);
  const institutions = await a.client.from("institutions").select("id").limit(1);
  const interests = await a.client.from("interests").select("id").limit(1);
  assert.ifError(institutions.error);
  assert.ifError(interests.error);
  assert.ok(
    institutions.data.length && interests.data.length,
    "seed reference rows required",
  );
  const input = {
    p_full_name: "Student A",
    p_country: "Nigeria",
    p_city: "Lagos",
    p_institution_id: institutions.data[0].id,
    p_programme: "Science",
    p_study_level: "100",
    p_biography: "Student biography",
    p_interest_ids: [interests.data[0].id, interests.data[0].id],
    p_directory: "private",
    p_complete: false,
  };
  assert.ifError(
    (
      await a.client.rpc("save_student_profile", {
        ...input,
        p_full_name: "",
        p_institution_id: null,
        p_interest_ids: [],
      })
    ).error,
  );
  let row = await a.client.from("profiles").select("*").eq("id", a.id).single();
  assert.ifError(row.error);
  check(
    "draft persists without completion",
    row.data.onboarding_complete === false && row.data.institution_id === null,
  );
  check(
    "invalid completion rejected",
    Boolean(
      (
        await a.client.rpc("save_student_profile", {
          ...input,
          p_full_name: "",
          p_complete: true,
        })
      ).error,
    ),
  );
  assert.ifError(
    (await a.client.rpc("save_student_profile", { ...input, p_complete: true })).error,
  );
  assert.ifError(
    (await a.client.rpc("save_student_profile", { ...input, p_complete: true })).error,
  );
  row = await a.client
    .from("profiles")
    .select("*,user_interests(interest_id)")
    .eq("id", a.id)
    .single();
  assert.ifError(row.error);
  check(
    "normalized institution persists",
    row.data.institution_id === input.p_institution_id,
  );
  check("retry deduplicates interests", row.data.user_interests.length === 1);
  check("completion persists", row.data.onboarding_complete === true);
  check(
    "unknown interest rejected",
    Boolean(
      (
        await a.client.rpc("save_student_profile", {
          ...input,
          p_interest_ids: [randomUUID()],
          p_full_name: "Should roll back",
          p_complete: true,
        })
      ).error,
    ),
  );
  row = await admin.from("profiles").select("full_name").eq("id", a.id).single();
  check("failed save is atomic", row.data.full_name === "Student A");
  const other = await b.client.from("profiles").select("*").eq("id", a.id);
  assert.ifError(other.error);
  check("other student cannot read private base row", other.data.length === 0);
  check(
    "anonymous cannot read profile",
    Boolean((await anonymous.from("profiles").select("*")).error),
  );
  check(
    "anonymous cannot call save",
    Boolean((await anonymous.rpc("save_student_profile", input)).error),
  );
  check(
    "client cannot overwrite another profile",
    Boolean(
      (await b.client.from("profiles").update({ full_name: "attacker" }).eq("id", a.id))
        .error,
    ),
  );
  check(
    "client cannot forge completion directly",
    Boolean(
      (
        await a.client
          .from("profiles")
          .update({ onboarding_complete: true })
          .eq("id", a.id)
      ).error,
    ),
  );
  check(
    "client cannot insert foreign profile",
    Boolean(
      (await b.client.from("profiles").insert({ id: a.id, full_name: "attacker" })).error,
    ),
  );
  check(
    "client cannot mutate interest links directly",
    Boolean(
      (
        await b.client
          .from("user_interests")
          .insert({ user_id: a.id, interest_id: interests.data[0].id })
      ).error,
    ),
  );
  const hidden = await b.client.rpc("student_directory_entry", { p_user_id: a.id });
  assert.ifError(hidden.error);
  check("private directory entry hidden", hidden.data.length === 0);
  assert.ifError(
    (
      await a.client.rpc("save_student_profile", {
        ...input,
        p_directory: "students",
        p_complete: true,
      })
    ).error,
  );
  const visible = await b.client.rpc("student_directory_entry", { p_user_id: a.id });
  assert.ifError(visible.error);
  check("opt-in directory entry visible", visible.data.length === 1);
  check(
    "projection excludes private fields",
    Object.keys(visible.data[0]).sort().join() === "biography,full_name,id",
  );
  const stillPrivate = await b.client.from("profiles").select("*").eq("id", a.id);
  check(
    "opt-in does not expose full profile",
    !stillPrivate.error && stillPrivate.data.length === 0,
  );
  assert.ifError(
    (
      await a.client.rpc("save_student_profile", {
        ...input,
        p_directory: "private",
        p_complete: true,
      })
    ).error,
  );
  check(
    "visibility revocation takes effect",
    (await b.client.rpc("student_directory_entry", { p_user_id: a.id })).data.length ===
      0,
  );
  check(
    "cannot create reference institution",
    Boolean(
      (await a.client.from("institutions").insert({ name: "Forged", country: "NG" }))
        .error,
    ),
  );
  check(
    "cannot create reference interest",
    Boolean((await a.client.from("interests").insert({ name: "Forged" })).error),
  );
  const role = await admin.from("roles").select("id").eq("name", "moderator").single();
  assert.ifError(role.error);
  check(
    "cannot assign privileged role",
    Boolean(
      (await a.client.from("user_roles").insert({ user_id: a.id, role_id: role.data.id }))
        .error,
    ),
  );
  check(
    "cannot create retired role",
    Boolean((await a.client.from("roles").insert({ name: "admin" })).error),
  );
  const receipt = await a.client.from("student_consents").select("*").single();
  assert.ifError(receipt.error);
  check("consent snapshot stored", receipt.data.terms_version === "integration-only");
  check(
    "consent cannot be rewritten",
    Boolean(
      (
        await a.client
          .from("student_consents")
          .update({ terms_version: "forged" })
          .eq("user_id", a.id)
      ).error,
    ),
  );
  const bReceipt = await b.client
    .from("student_consents")
    .select("*")
    .eq("user_id", a.id);
  check("other user consent hidden", !bReceipt.error && bReceipt.data.length === 0);
  assert.ifError(
    (await a.client.auth.updateUser({ data: { consent_terms_version: "forged" } })).error,
  );
  check(
    "metadata edit cannot change consent receipt",
    (await a.client.from("student_consents").select("terms_version").single()).data
      .terms_version === "integration-only",
  );
  assert.ifError((await a.client.rpc("request_student_deletion")).error);
  check(
    "deletion request persisted for caller",
    Boolean(
      (
        await admin
          .from("profiles")
          .select("deletion_requested_at")
          .eq("id", a.id)
          .single()
      ).data.deletion_requested_at,
    ),
  );
  assert.ifError((await a.client.auth.signOut({ scope: "local" })).error);
  check(
    "signed-out client cannot save",
    Boolean((await a.client.rpc("save_student_profile", input)).error),
  );
  const restored = await a.client.auth.signInWithPassword({
    email: a.email,
    password: a.password,
  });
  assert.ifError(restored.error);
  check(
    "new session restores persisted profile",
    (await a.client.from("profiles").select("full_name").eq("id", a.id).single()).data
      .full_name === "Student A",
  );
  const recoveryLink = await admin.auth.admin.generateLink({
    type: "recovery",
    email: a.email,
  });
  assert.ifError(recoveryLink.error);
  const recovering = createClient(url, anonKey, options);
  const recovered = await recovering.auth.verifyOtp({
    type: "recovery",
    token_hash: recoveryLink.data.properties.hashed_token,
  });
  check(
    "server validates one-time recovery hash",
    !recovered.error && recovered.data.user?.id === a.id,
  );
  const replay = await anonymous.auth.verifyOtp({
    type: "recovery",
    token_hash: recoveryLink.data.properties.hashed_token,
  });
  check("recovery hash replay denied", Boolean(replay.error));
  const newPassword = "Updated-" + randomUUID() + "A1";
  assert.ifError((await recovering.auth.updateUser({ password: newPassword })).error);
  assert.ifError((await recovering.auth.signOut({ scope: "local" })).error);
  check(
    "old password rejected after recovery",
    Boolean(
      (await recovering.auth.signInWithPassword({ email: a.email, password: a.password }))
        .error,
    ),
  );
  check(
    "new password authenticates",
    !(await recovering.auth.signInWithPassword({ email: a.email, password: newPassword }))
      .error,
  );
  check(
    "invalid recovery hash rejected",
    Boolean(
      (
        await anonymous.auth.verifyOtp({
          type: "recovery",
          token_hash: "invalid-test-hash",
        })
      ).error,
    ),
  );
  const signupClient = createClient(url, anonKey, options);
  const signupEmail = "eben-signup-" + randomUUID() + "@example.test";
  const signupPassword = "Signup-" + randomUUID() + "A1";
  const registered = await signupClient.auth.signUp({
    email: signupEmail,
    password: signupPassword,
  });
  assert.ifError(registered.error);
  users.push(registered.data.user.id);
  check("signup awaits verification without authenticating", !registered.data.session);
  check(
    "unverified signup cannot sign in",
    Boolean(
      (
        await signupClient.auth.signInWithPassword({
          email: signupEmail,
          password: signupPassword,
        })
      ).error,
    ),
  );
  const verification = await admin.auth.admin.generateLink({
    type: "signup",
    email: signupEmail,
    password: signupPassword,
  });
  assert.ifError(verification.error);
  const confirmed = await signupClient.auth.verifyOtp({
    type: "signup",
    token_hash: verification.data.properties.hashed_token,
  });
  check(
    "signup verification creates a confirmed user",
    !confirmed.error && Boolean(confirmed.data.user?.email_confirmed_at),
  );
  assert.ifError((await signupClient.auth.signOut({ scope: "local" })).error);
  check(
    "verified signup can log in",
    !(
      await signupClient.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      })
    ).error,
  );
  console.log(count + " isolated API integration assertions passed.");
} finally {
  for (const id of users) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;
  }
  console.log("Disposable test users cleaned up.");
}
