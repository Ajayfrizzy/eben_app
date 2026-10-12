# Milestone 1 legal and authentication setup

## Public registration remains blocked

Eben Institute confirmed that no approved Terms, Privacy Policy, versions, or effective dates exist yet. No policies have been generated or published. The acceptance control is unchecked by default. Live signup is disabled in the screen and rejected by the service unless all configuration is valid; development demo creates no real account or consent receipt.

Before enabling public registration, the organization must supply:

1. Approved, publicly accessible HTTPS Terms and Privacy Policy documents, with the responsible organization's approval recorded outside this codebase.
2. A distinct immutable version identifier and ISO effective date (`YYYY-MM-DD`) for each document. Effective dates must be valid and must not be in the future when registration opens.
3. Review of consent wording, retention of consent receipts, deletion request handling, and student eligibility requirements. The application does not invent these policies.
4. Approval to set these public build variables, then rebuild and manually verify that both links open the intended approved documents:

```dotenv
EXPO_PUBLIC_TERMS_URL=
EXPO_PUBLIC_PRIVACY_URL=
EXPO_PUBLIC_TERMS_VERSION=
EXPO_PUBLIC_PRIVACY_VERSION=
EXPO_PUBLIC_TERMS_EFFECTIVE_DATE=
EXPO_PUBLIC_PRIVACY_EFFECTIVE_DATE=
EXPO_PUBLIC_LEGAL_APPROVED=false
```

Set `EXPO_PUBLIC_LEGAL_APPROVED=true` only after actual approval. The flag is a release configuration assertion, not proof of organizational approval. Client-side registration gating cannot disable direct calls to Supabase Auth; keep production Auth signup disabled operationally until legal approval and launch review. No production setting was changed in this milestone.

The additive migration snapshots accepted document metadata from the original signup into `student_consents` with a server timestamp. Users can read only their receipt and cannot rewrite it through later metadata updates. This records the signup assertion; it is not independent evidence that someone read the documents. Existing accounts are not assigned fabricated historical consent.

## Isolated development and automated tests

Use a disposable local/test Supabase project with test inboxes, never production. Unit tests inject clearly labelled `.example.test` URLs and test versions; they do not weaken the default configuration. Integration tests create disposable users through the local test setup client and exercise actual user JWTs for authorization. Do not put placeholder legal URLs in a public build or claim test metadata is approved legal content.

Without both Supabase credentials, development-only demo remains available. Partial configuration fails closed. With a live development backend, auth and profile operations require a verified real test session. Use explicitly labelled test-only legal documents in a private test build if exercising the registration screen end-to-end; otherwise use the isolated integration setup to create test accounts while keeping the public registration configuration blank.

## Supabase email and Android configuration (manual, non-production first)

- Enable email confirmation. Configure sender credentials and approved redirect URLs in the isolated environment.
- Allow `eben://auth-callback` for signup verification and `eben://reset-password` for password recovery. The Expo app already uses the `eben` scheme.
- The client uses PKCE with persisted SecureStore verifier/session on native. Standard Supabase confirmation links must return `?code=...` to the custom scheme on the same device where signup/reset was requested.
- Alternatively, reviewed email templates can target `eben://auth-callback?token_hash={{ .TokenHash }}&type=signup` and `eben://reset-password?token_hash={{ .TokenHash }}&type=recovery`. The app verifies the one-time hash with Supabase before granting a session; test mail providers for link rewriting/prefetch behavior.
- Legacy fragment-only access/refresh-token links are intentionally rejected. Do not append a fake `type=recovery` to a normal session URL. PKCE recovery authorization is derived from Supabase's stored verifier/redirect type; token hashes are verified as recovery by the server.
- Verification ends at sign-in. Recovery sessions stay confined to password reset; the update action requires a matching, server-validated recovery session and a ten-minute in-memory grant. After restart/expiry, request a new email. On successful update, local logout is required before signing in again.
- Cold-start, warm-start, expired/replayed links, email scanner behavior, malformed links, and actual Android app-link delivery require physical-device testing. A bundle export and mocked SDK tests cannot establish that behavior.
- Native external URLs over 8192 characters or with invalid percent encoding are rejected before routing. The upstream decoder advisory remains open; see the security reconciliation report.

## Local behavioral integration command

Start a fresh isolated Supabase instance with all migrations and reference seed data. Enable email confirmation. Set only local test values in your shell (never commit keys):

```sh
EBEN_TEST_ISOLATED=yes \
EBEN_TEST_SUPABASE_URL=http://127.0.0.1:55321 \
EBEN_TEST_ANON_KEY=<local-anon-key> \
EBEN_TEST_SERVICE_ROLE_KEY=<local-service-key> \
node tests/integration/student-identity.mjs
```

The runner rejects non-loopback URLs, provisions disposable A/B/unverified users, performs assertions with their ordinary JWTs or anonymous credentials, and cleans up in `finally`. The setup credential never enters the mobile environment. No test should use an owner's/service-role token as its authorization subject.
