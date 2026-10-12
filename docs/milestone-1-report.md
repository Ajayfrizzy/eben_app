# Milestone 1 — student identity implementation

Base: `79d9310687a4f5dc0ede5c9e4dacca52a3983fa7`. This report describes the complete local Milestone 1 implementation and its validation. The authorized publication includes only this report, the security report, and the additive migration; application changes, tests, and supporting documentation remain local pending separate approval. Nothing has been deployed or applied to a remote service.

Do not deploy this migration independently of the corresponding application changes: it revokes direct writes used by the older application and introduces the replacement profile RPC. Links to new supporting documentation will become available when those files are published.

## Implemented

- Unchecked-by-default accessible consent control, configurable HTTPS document links, separate versions and effective dates, and an explicit legal-approval release flag. Both screen and service block live registration while legal configuration is missing/unapproved. No legal text is invented.
- Centralized identity service for signup, verification/resend, login, logout, recovery requests, PKCE exchange and token-hash verification. Duplicate signup responses avoid asserting whether an account exists. Input, busy, error, retry, and offline states use the existing visual system.
- SecureStore session/verifier persistence with foreground refresh management. Restored sessions are validated against the backend; restoration failures fail closed and offer retry/local logout. Account transitions/logout clear TanStack Query caches; expired sessions lose route access. Logout errors do not falsely report success.
- Central authorization requires confirmed email and completed onboarding. Recovery events confine navigation to reset. Incomplete students may save/resume onboarding. Release builds allow real profile routes while retaining the block on unrelated fixture-backed features.
- Password recovery accepts server-verified one-time hashes or PKCE codes and requires a matching server-validated recovery session plus a ten-minute in-memory authorization before password update. Replays, wrong types, invalid links, and normal-session updates are rejected. Legacy implicit fragment-only links are unsupported; request a new supported link. Successful updates sign out locally.
- Feature-oriented profile repository/hooks and a shared onboarding/edit form. Institution and interests use existing normalized reference IDs. Explicit draft saves survive restart through the database; completion and interest replacement are atomic and retry-safe. Unsaved offline edits remain in the current form only, not an offline queue.
- Real profile display, editing, private-by-default visibility, refresh/retry states, and account deletion request persistence. Sharing exposes only name/biography to other verified students through a limited database projection; location, institution, interests, email, and account metadata remain private. A public directory UI is not introduced.
- Native external-link size/encoding validation mitigates the legacy navigation decoder at native ingress. The dependency advisory remains open.

## Files and architecture

- `apps/src/features/auth/`: legal configuration, identity service/client, session observer, native intent filtering, auth/recovery screen composition, and unit tests.
- `apps/src/features/profile/`: repository, TanStack Query hooks, profile/onboarding screen composition, and persistence tests.
- `apps/src/auth.tsx`, `route-access.ts`, `route-access-gate.tsx` and existing tests: session/cache lifecycle and centralized verified/onboarded/recovery authorization.
- `apps/app/(auth)/`: thin signup/login/forgot routes and new verification route. `auth-callback.tsx`, `reset-password.tsx`, `onboarding.tsx`, `edit-profile.tsx`, `(tabs)/profile.tsx`, `(tabs)/_layout.tsx`, `index.tsx`, `+native-intent.ts`: route integration without changing branding.
- `apps/src/services/supabase.ts`: PKCE configuration; corresponding storage test updated.
- `.env.example`, README and architecture docs: legal/env requirements and implemented behavior.
- New migration and integration/SQL tests; updated Android/RLS plans; security inventory and legal setup guide.
- No dependency manifest or lockfile changes; SDK 54/React Native versions remain unchanged.

## Additive database changes

`supabase/migrations/202610120001_student_identity.sql`:

- Adds owner-readable immutable signup consent receipts, captured once by a narrowly scoped signup trigger; no fabricated backfill for existing accounts.
- Replaces broad completed-profile SELECT with owner-only base-row access. Revokes client base-row writes, direct interest-link writes, and reference/role mutation grants.
- Adds `save_student_profile`, using the verified caller's identity, serialized per-user transactions, normalized reference validation, server validation, deduplication, and atomic profile/interest replacement. There is no client-supplied user ID.
- Resets legacy completion flags only where required fields, institution, or selected interests are absent.
- Adds a verified-user, opt-in `student_directory_entry` projection containing only ID/name/biography, plus an owner-scoped deletion request function.
- Functions use fixed empty search paths, explicit schemas, revoked public execution and narrow authenticated grants. Historical migrations and retired administrative roles remain unchanged.

Reviewed privacy change: future community queries must use the limited projection for author names rather than selecting another student's full profile. Consent capture records a user's signup assertion and a server timestamp; organizational policy approval remains an operational requirement.

## Validation results

Environment: isolated Node 22.23.3 / npm 10.8.2, matching the CI Node major.

| Check                                    | Result                                                              |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `npm ci --offline --no-audit`            | Passed: clean install, 1034 packages; dependency files unchanged    |
| `npm run check`                          | Passed: formatting, ESLint, shared/mobile TypeScript, tests         |
| Unit/SSR tests                           | 72 passed across 7 files                                            |
| `npx --yes expo-doctor` from `apps/`     | 18/18 passed                                                        |
| Android production Hermes export         | Passed; export is not a physical APK test                           |
| Local fresh Supabase migration/seed      | Passed, including the new additive migration                        |
| `tests/integration/student-identity.mjs` | 40 real API/JWT assertions passed                                   |
| `tests/rls/policies.sql`                 | 10 existing structural pgTAP assertions passed                      |
| `tests/rls/student_identity.sql`         | 4 behavioral SQL assertions passed with simulated unverified claims |

Local integration ran only on a disposable loopback Supabase instance (`eben-m1-isolated`, API port 55321, DB 55322). Setup used a local privileged client only for fixtures and verification link generation. Authorization assertions used anonymous or ordinary student JWTs; SQL unverified-claim tests are separately labelled. All disposable test users were deleted after each run. An initial signup test correctly detected local default auto-confirm configuration; after enabling confirmation and restarting that local instance, the complete suite passed. No production settings were changed.

API coverage includes incomplete draft persistence, canonical institutions/interests, duplicate retry handling, failed-save atomicity, cross-user read/write denial, role escalation denial, reference mutation denial, visibility projection/revocation, immutable consent, account deletion requests, logout/new-session persistence, recovery hash replay rejection, password rotation, and signup→verification→login. Verification links were generated by the local test setup, not delivered through an external email provider.

The validation above covers the full local implementation. CI for the separately authorized reports-and-migration commit does not validate the unpublished application changes or execute the isolated database integration tests.

## Security reconciliation

See [the complete advisory inventory](milestone-1-security.md): **102 GitHub records = 95 fixed + 7 open**, versus **41 npm affected-package entries = 23 high + 18 moderate, zero critical**. The seven open GitHub GHSA IDs exactly match npm's seven root advisories; npm propagates them through affected parent packages. The older 85-alert push banner is a historical snapshot, not a comparable current package count.

The navigation URL decoder remains release-relevant; native ingress filtering is a mitigation, not a patched dependency. Other remaining roots concern braces, node-forge, image-size, sprintf-js, and UUID host tooling. No forced major update, suppression, or dismissal was used.

## Outstanding launch requirements and manual testing

- Eben Institute must approve and provide Terms/Privacy HTTPS URLs, separate versions/effective dates, and authorize the approval flag. Live signup stays blocked. Keep production Auth signups disabled operationally until approval; client gating alone cannot disable direct Auth API requests. See [exact setup requirements](milestone-1-legal-and-auth-setup.md).
- Physical Android cold/warm deep links, email-provider rewriting/prefetch behavior, SecureStore restoration across process termination/reboot, foreground/background token refresh, screen reader/keyboard behavior, and real network interruptions remain unexecuted.
- PKCE same-device email delivery and legacy-template migration need device validation. Local token-hash API tests and mocked PKCE exchange do not prove Android link delivery.
- Staging Supabase configuration/grants must be verified before any separately approved deployment. Only the isolated local database was tested.
- Normal student content outside onboarding/profile remains fixture-backed and blocked in release builds. Profile draft saving is explicit; unsaved changes do not survive force-stop.
- Follow the [Android checklist](manual-test-checklist.md) and [RLS plan](rls-integration-test-plan.md). The broader non-identity RLS matrix remains future coverage; this milestone does not claim all product policies are behaviorally verified.
