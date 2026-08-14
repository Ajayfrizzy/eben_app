# Eben Institute MVP

A focused Android-first education and community MVP: Expo mobile app, Next.js staff dashboard, shared TypeScript packages, and Supabase with explicit RLS.

## Setup

1. Install Node 20+, npm 10+, Supabase CLI, and Expo/EAS CLI.
2. Run `npm install`.
3. Copy `.env.example` values into local app environments. Never expose the service-role key to a client bundle.
4. Run `supabase start`, then `supabase db reset`.
5. Run `npm run dev:mobile` and `npm run dev:admin`.

Without Expo public Supabase variables, mobile starts with local demo content for product review.

## Structure

- `apps/mobile`: Expo Router student app
- `apps/admin`: Next.js staff dashboard
- `packages`: shared contracts, validation, and tokens
- `supabase`: migrations, RLS, functions, and reference seed
- `tests/rls`: policy assertions
- `docs`: architecture, analytics, QA, and the source prompt

## Validation and release

Run `npm run check`. Configure the EAS project ID, then use `eas build --profile preview --platform android` for UAT. Use separate Supabase projects and secrets for development, staging, and production.

## MVP boundaries

Direct messaging, native applications, payments, gamification, mentoring, multilingual UI, full offline downloads, and AI recommendations are intentionally excluded. Push delivery, email, staff identities, and production content require environment-specific operational setup.

