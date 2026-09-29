# Eben Institute MVP

A focused Android-first education and community MVP: Expo mobile app, shared TypeScript packages, and Supabase with explicit RLS.

## Setup

1. Install Node 20+, npm 10+, Supabase CLI, and Expo/EAS CLI.
2. Run `npm install`.
3. Copy `.env.example` values into local app environments. Never expose the service-role key to a client bundle.
4. Run `supabase start`, then `supabase db reset`.
5. Run `npm run dev:mobile`.

## Viewing the apps

- Mobile in a browser: run `npm run dev:mobile`, then press `w`.
- Mobile on Android: start an emulator and press `a`, or scan the QR code with Expo Go on a phone connected to the same network.

The mobile app supports local demo content when Supabase variables are absent.

Use `.env` at the repository root for local development. Only `EXPO_PUBLIC_*` variables may be exposed to client applications. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

Without Expo public Supabase variables, mobile starts with local demo content for product review.

## Structure

- `apps/mobile`: Expo Router student app
- `packages`: shared contracts, validation, and tokens
- `supabase`: migrations, RLS, and reference seed
- `tests/rls`: policy assertions
- `docs`: architecture, analytics, QA, and the source prompt

## Validation and release

Run `npm run format` to format the repository and `npm run check` to verify formatting, linting, types, and tests. Configure the EAS project ID, then use `eas build --profile preview --platform android` for UAT. Use separate Supabase projects and secrets for development, staging, and production.

## MVP boundaries

Direct messaging, native applications, payments, gamification, mentoring, multilingual UI, full offline downloads, and AI recommendations are intentionally excluded. Push delivery, email, staff identities, and production content require environment-specific operational setup.

## Existing backend deployments

Apply pending migrations with `supabase db push` to revoke the retired dashboard roles and permissions. Historical migrations retain their original definitions; the latest migration removes access without deleting content or audit records. If previously deployed, remove the retired broadcast endpoint with `supabase functions delete notification-fanout` and take the old web deployment offline.
