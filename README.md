# Eben Institute MVP

A focused Android-first education and community MVP: Expo mobile app, shared TypeScript packages, and Supabase with explicit RLS.

## Setup

1. Install Node 22 LTS, npm 10+, Supabase CLI, and Expo/EAS CLI.
2. Run `npm ci`.
3. Copy `.env.example` to `apps/.env` and supply your Supabase values. Never expose the service-role key to a client bundle.
4. Run `supabase start`, then `supabase db reset`.
5. Run `npm run dev:mobile`.

## Viewing the apps

- Mobile in a browser: run `npm run dev:mobile`, then press `w`.
- Mobile on Android: start an emulator and press `a`, or scan the QR code with Expo Go on a phone connected to the same network.

Development builds support local demo content when both Supabase variables are absent.

Use `apps/.env` for local development; Expo loads environment files from the app directory. Only `EXPO_PUBLIC_*` variables may be exposed to client applications. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

Release builds (including EAS preview) require both Supabase variables. Missing, partial, or placeholder configuration blocks startup with a configuration error; it never enables demo mode. Configure the public variables in the corresponding EAS environment before building. Existing student content screens still use fixtures and are blocked in release builds, even for authenticated users. They remain available in development demo mode or with a verified development session. Onboarding requires a verified live session outside demo mode. Connecting content screens to live data is a later milestone.

## Structure

- `apps`: Expo Router student app and its Expo, EAS, ESLint, and TypeScript configuration
- `apps/app`: route screens and layouts only
- `apps/src`: supporting components, auth, services, state, theme, and demo data
- `packages`: shared contracts, validation, and tokens
- `assets`: official logos, palette reference, and asset documentation; shared brand tokens are exported from `@eben/config` without changing the current theme
- `supabase`: migrations, RLS, and reference seed
- `tests/rls`: policy assertions
- `docs`: architecture, analytics, QA, and the source prompt

Keep `app/` and `src/` as siblings. Expo Router treats files inside `app/` as routes, so helpers and services belong outside that directory.

## Validation and release

Run `npm run format` to format the repository and `npm run check` to verify formatting, linting, types, and tests. From `apps/`, run `npx expo-doctor` to check Expo dependencies and configuration. Configure the EAS project ID, then use `eas build --profile preview --platform android` from that same directory for UAT. Use separate Supabase projects and secrets for development, staging, and production.

## MVP boundaries

Direct messaging, native applications, payments, gamification, mentoring, multilingual UI, full offline downloads, and AI recommendations are intentionally excluded. Push delivery, email, staff identities, and production content require environment-specific operational setup.

## Existing backend deployments

Apply pending migrations with `supabase db push` to revoke the retired dashboard roles and permissions. Historical migrations retain their original definitions; the latest migration removes access without deleting content or audit records. If previously deployed, remove the retired broadcast endpoint with `supabase functions delete notification-fanout` and take the old web deployment offline.
