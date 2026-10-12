# Eben Institute — Codex Project Instructions

## Mission and scope

Build and release the Eben Institute student mobile MVP: a reliable Android-first educational/community app for African students, using the existing React Native/Expo + TypeScript + Supabase foundation. Preserve future iOS compatibility.

**No admin dashboard, staff portal, or admin-facing application in this phase.** Existing database-side moderation and authorization safeguards must remain; do not reintroduce the retired dashboard or privileged legacy roles. Content provisioning for testing can use controlled Supabase seed data and migrations, not a new admin UI.

Core student journeys: authentication and onboarding; profile; community channels/posts/comments/reactions/reports/bookmarks; learning library; events/RSVP; opportunities and external applications; notifications; offline and low-bandwidth resilience. Defer payments, direct messages, mentorship booking, gamification, and speculative features.

## Baseline and actual repository layout

The codebase at reviewed GitHub commit `244a3ca554060b15fd9fbb08c576780d3724484d` currently has:

- `apps/package.json` — mobile workspace package named `@eben/mobile`
- `apps/app/` — Expo Router route screens/layouts
- `apps/src/` — application supporting code, services, theme, auth, state, demo data
- `apps/app.json`, `apps/eas.json` — Expo/EAS configuration
- `packages/config`, `packages/types`, `packages/validation` — shared packages
- `supabase/migrations`, `supabase/seed.sql` — data model and RLS
- `tests/rls` — structural RLS tests
- `assets/` — official logo and color assets from organization pitch deck
- `docs/` — original MVP requirements and architecture

**Do not assume `apps/mobile` exists.** The README currently mentions it, but the checked-in app is directly under `apps/`.

## First action: restore build health

Before adding product features, investigate the actual files and fix the root npm workspace declaration: `"workspaces": ["apps/*", "packages/*"]` does not match `apps/package.json`. Prefer the minimal correction `"workspaces": ["apps", "packages/*"]` unless local evidence requires otherwise. Reconcile the lockfile, scripts, README/environment paths, and CI consistently. Confirm `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run check` pass; do not claim they passed without execution. Last reviewed CI run `38238294607` failed at `npm run lint` with `No workspaces found --workspace=@eben/mobile`; subsequent steps were skipped.

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
- Recommended colors are in `assets/brand-colors.json` and `packages/config/src/brand-tokens.ts`. Treat these as the brand reference, not the legacy navy/coral palette still in `packages/config/src/index.ts`.
- Establish one shared, accessible semantic token system before extensive visual updates. Verify contrast and avoid distorting or repainting the official emblem. Prepare Android icon and splash assets with proper dimensions/safe areas.

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
