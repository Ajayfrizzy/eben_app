# Eben Institute — Codex Project Instructions

## Mission and scope

Build and release the Eben Institute student mobile MVP: a reliable Android-first educational/community app for African students, using the existing React Native/Expo + TypeScript + Supabase foundation. Preserve future iOS compatibility.

**No admin dashboard, staff portal, or admin-facing application in this phase.** Existing database-side moderation and authorization safeguards must remain; do not reintroduce the retired dashboard or privileged legacy roles. Content provisioning for testing can use controlled Supabase seed data and migrations, not a new admin UI.

Core student journeys: authentication and onboarding; profile; community channels/posts/comments/reactions/reports/bookmarks; learning library; events/RSVP; opportunities and external applications; notifications; offline and low-bandwidth resilience. Defer payments, direct messages, mentorship booking, gamification, and speculative features.

## Baseline and actual repository layout

Milestones 0/0.1 restored the workspace and Node 22 baseline in `79d9310`. Milestone 1 identity implementation is in `4e097e2`, with passing GitHub Actions. The current layout is:

- `apps/package.json` — mobile workspace package named `@eben/mobile`
- `apps/app/` — Expo Router route screens/layouts
- `apps/src/` — application supporting code, services, theme, auth, state, demo data
- `apps/app.json`, `apps/eas.json` — Expo/EAS configuration
- `packages/config`, `packages/types`, `packages/validation` — shared packages
- `supabase/migrations`, `supabase/seed.sql` — data model and RLS
- `tests/rls` — structural RLS tests
- `assets/` — official logo and color assets from organization pitch deck
- `docs/` — original MVP requirements and architecture

**Do not assume `apps/mobile` exists.** The mobile app is directly under `apps/`; the npm workspace declaration is `["apps", "packages/*"]`.

## Verified baseline

Milestones 0/0.1 completed repository stabilization and compatible security patches. Milestone 1 added verified authentication, consent gating, recovery, persisted onboarding/profile editing, owner-private profiles, and additive identity RPCs. Local validation recorded 72 unit/SSR tests, 40 isolated API assertions, Expo Doctor 18/18, and Android export; physical-device/email-provider checks remain required. See `docs/milestone-1-report.md` and the security inventory for limits. Approved legal URLs, versions and dates are still a launch requirement. Never bypass live signup gating or release route restrictions to preview UI.

Use Node 22 and run `npm run check` for relevant work; validate native configuration with Expo Doctor and Android export. Do not claim checks passed without execution. Remaining dependency advisories include the release-relevant navigation decoder; do not suppress them or force major upgrades.

## Architecture principles

- Retain Expo Router, React Native, TypeScript, Supabase Auth/Postgres/Storage, RLS, TanStack Query, Zustand, React Hook Form, and Zod where relevant.
- Keep `apps/app/` for routes and thin screen composition only. Put domain operations into feature-oriented modules in `apps/src/features/<domain>/` and shared adapters in `apps/src/services/`; adopt this progressively rather than moving everything at once.
- Use TanStack Query for remote query/mutation state; Zustand only for lightweight client UI state. Avoid competing data caches.
- Centralize Supabase access in typed repositories/services. Keep secrets and service-role credentials off the client. Do not send privileged operations directly from mobile.
- Validate forms at boundaries; enforce authorization at the database/RLS level, not solely in UI.
- Use additive migrations. Do not rewrite applied historical migrations. Inspect existing policies and role grants before extending tables or access.
- Keep screens responsive, accessible, and suitable for small low-bandwidth Android devices; implement explicit loading, empty, error, retry, and offline states.
- Demo fixtures must never masquerade as live data in production. If backend config is absent in release builds, fail visibly and safely instead of silently entering demo mode.

## Official branding

- The approved Eben Institute logo assets are in `assets/`: `eben_logo_full.png`, `eben_logo_mark.png`, and white-background variants.
- Recommended colors are in `assets/brand-colors.json` and `packages/config/src/brand-tokens.ts`. `packages/config/src/brand-tokens.ts` is the authoritative palette, semantic colors, typography, spacing and layout source; `index.ts` only re-exports it.
- Use the shared `apps/src/theme.ts` and UI components. Keep text contrast accessible and controls at least 48 points. Android assets under `assets/android/` are padded derivatives of the official emblem; regenerate with `node scripts/generate-brand-assets.cjs`. Do not distort, crop, repaint or replace official artwork.

## Development workflow

1. At the start of each task, inspect current code, relevant docs/tests, and Git status. Note any uncommitted user changes; never overwrite them.
2. Explain a compact implementation plan and scope. Prefer the smallest coherent changes; avoid broad rewrites or package upgrades without a specific verified need.
3. Implement with tests covering success, failure, unauthorized access, and offline/error behavior where relevant.
4. Run relevant checks; for cross-cutting changes run the full `npm run check` suite. For RLS changes, execute actual user-context allow/deny policy tests on an isolated development database when possible.
5. Report files changed, behavior verified, exact commands/results, limitations, and any manual Android/Supabase steps still required.
6. Do not claim physical device, live service, or EAS build validation unless actually performed. Do not deploy, alter remote Supabase projects, or push commits without explicit instruction.

## Work priorities (in order)

0. Restore workspace/CI health; confirm current Expo, app routing, environment setup, and dependency consistency.
1. Authentication and onboarding: real consent, verified-session routing, account recovery deep links, persistence of institution/interests, profile privacy.
2. Align official branding and components with approved logos/tokens.
3. Community: server-backed channels, posts/comments/reactions/bookmarks/reporting and safe moderation states.
4. Library/opportunities: backend data, search/filter, resource viewing, bookmarks and safe external links.
5. Events, RSVPs, notifications and real calendar integration.
6. Regression testing, low-bandwidth behavior, accessibility, Android device validation, and release configuration.

## Acceptance expectations

A milestone is not complete merely because a screen looks functional. Verify persistence after restart, cross-account isolation/RLS, proper errors and retries, no stale placeholder listings, accurate navigation/deep links, and no unauthorized role escalation. Document any environment-dependent validations not performed.

## Documentation precedence

Current verified code and migrations take precedence over outdated paths in README or earlier architecture docs. Preserve the organizational mission and feature priorities in `docs/Eben_Institute_MVP_Build_Prompt.md` and `docs/eben_mobile_app_architecture.md`; update docs alongside architectural changes. Flag contradictory requirements rather than silently adopting both.
