# Milestone 2 — official branding and mobile UI

Prepared for publication on `review/milestone-2-branding`. No merge, deployment,
remote migration or production-service change was performed.

## Implemented

- `packages/config/src/brand-tokens.ts` is the single palette and semantic token
  source. The package index only re-exports it. Green actions, light neutral surfaces,
  gold decoration and darker blue information text replace the navy/coral identity.
  System typography keeps Android text scaling and avoids remote font downloads.
- Shared controls provide primary/secondary/destructive buttons, 48-point minimum
  targets, explicit disabled state, persistent field labels, focus borders, cards,
  announced feedback and keyboard-aware scrollable forms with safe-area padding.
  Normal text color pairs meet 4.5:1; field boundaries meet 3:1 in automated tests.
- Welcome, authentication, verification, recovery, onboarding and profile screens use
  the official full logo. Consent/institution/interest choices expose the same state
  and handlers with larger targets. Privacy switch colors follow the shared theme.
- Student navigation uses named Ionicons and an accessible notifications control.
  Removed the duplicate stack header above tabs. Tab height follows font scale;
  Opportunities uses the short tab label “Discover” while retaining its screen title
  and accessibility label. Existing content screens inherit the new shared styling.
- Android launcher (1024px), adaptive foreground (1024px) and splash (512px) derivatives
  preserve the supplied mark's aspect ratio and original pixels/colors. Padding keeps
  the complete source rectangle inside the adaptive icon circular safe zone.
- Added a small Metro configuration to watch the shared root assets directory.
  Production export initially exposed this missing watch directory; it now resolves
  and bundles the original logo successfully.
- Updated project instructions to the completed Milestone 0/0.1 and Milestone 1
  baseline, retaining no-admin, legal, privacy and production-demo restrictions.

Authentication services, session management, repository operations, route decisions,
and database migrations were not changed. The route gate's only change is its loading
indicator color. No backend content features were introduced.

## Dependencies and configuration

- Added SDK 54-compatible `expo-splash-screen ~31.0.13` for native splash configuration.
- Declared `@expo/vector-icons ^15.1.1` directly; it was already installed transitively.
- Expo SDK and React Native versions are unchanged. npm hoisted the existing prebuild
  configuration package without a version change. No forced dependency upgrades.
- Expo uses the light UI, dark status-bar text, green notification accent and Android
  keyboard resize. Icon/splash paths reference `assets/android/`.
- Asset generation uses existing Expo tooling's `jimp-compact` dependency via
  `node scripts/generate-brand-assets.cjs`; original artwork remains unchanged.
- Expo-generated `expo-env.d.ts` is ignored by Git and Prettier. No handwritten code
  is excluded from checks.

## Validation

Node 22.23.3 / npm 10.8.2.

| Executed check                                                                       | Result                                                                                                  |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `npm run check` — formatting                                                         | Passed                                                                                                  |
| `npm run check` — ESLint                                                             | Passed, no warnings                                                                                     |
| `npm run check` — root/shared and mobile TypeScript                                  | Passed                                                                                                  |
| `npm run check` — Vitest                                                             | **88 passed, 9 files** (72 existing + 16 new)                                                           |
| `npx expo-doctor` from `apps/`                                                       | **18/18 passed**                                                                                        |
| `npx expo export --platform android --output-dir /private/tmp/eben-m2-android-final` | Passed: 1,146 modules, 3.55 MB Hermes bundle, official logo and icons included                          |
| `npx expo export --platform web --output-dir /private/tmp/eben-m2-web-final`         | Passed: 892 modules; optional browser bundle check                                                      |
| Local browser development preview                                                    | Welcome, signup, onboarding and profile captured at 360 × 800; document width and scroll width both 360 |
| `git diff --check`                                                                   | Passed                                                                                                  |

New tests cover palette/reference consistency, semantic contrast, minimum control
size, disabled accessibility state, persistent password labels/masking, error/retry
feedback and informational announcements. Existing auth, session, profile and release
route tests remain passing. Early checks found and resolved a Metro asset-resolution
error and a missing Node global declaration in the Metro lint context.

Native Android build installation, TalkBack, physical keyboard, largest system fonts,
email delivery, and live-backend behavior were **not** tested in this milestone.
Database integration tests were not rerun because neither SQL nor data operations
changed. Browser previews are development-demo captures, not Android screenshots.

## Previews

- [Welcome](previews/milestone-2-welcome.png)
- [Signup and consent](previews/milestone-2-sign-up.png)
- [Onboarding](previews/milestone-2-onboarding.png)
- [Profile and student navigation](previews/milestone-2-profile.png)
- [Android launcher artwork](../assets/android/icon.png)

## Remaining review and device work

- Official source raster mark is only 470 × 440, with an embedded light background.
  It remains visible; larger output cannot restore missing detail. Request an approved
  vector/high-resolution transparent master for sharper launcher artwork.
- The UI is intentionally light, including under a dark system setting. Validate
  native system bars, Android 12+ splash, circle/squircle masks and cold startup in a
  new installed build. Expo Go is insufficient for native splash acceptance.
- Physical Android font/display scaling, tab wrapping, keyboard avoidance, TalkBack,
  low-vision contrast, long institution names and network-state transitions remain
  manual acceptance work. See the expanded [checklist](manual-test-checklist.md).
- Milestone 1 legal approval, email/deep-link device checks and security advisory
  blockers remain unchanged. No public registration or release readiness is claimed.

## Files changed

- `.prettierignore`
- `AGENTS.md`
- `apps/.gitignore`
- `apps/app.json`
- `apps/app/(auth)/welcome.tsx`
- `apps/app/(tabs)/_layout.tsx`
- `apps/app/(tabs)/home.tsx`
- `apps/app/(tabs)/opportunities.tsx`
- `apps/app/_layout.tsx`
- `apps/app/events/[id].tsx`
- `apps/app/index.tsx`
- `apps/app/notifications.tsx`
- `apps/metro.config.cjs`
- `apps/package.json`
- `apps/src/brand-tokens.test.ts`
- `apps/src/components/brand.tsx`
- `apps/src/components/ui.test.jsx`
- `apps/src/components/ui.tsx`
- `apps/src/features/auth/screens.tsx`
- `apps/src/features/profile/screens.tsx`
- `apps/src/route-access-gate.tsx`
- `apps/src/theme.ts`
- `assets/README.md`
- `assets/android/adaptive-foreground.png`
- `assets/android/icon.png`
- `assets/android/splash.png`
- `docs/manual-test-checklist.md`
- `docs/milestone-2-report.md`
- `docs/previews/milestone-2-onboarding.png`
- `docs/previews/milestone-2-profile.png`
- `docs/previews/milestone-2-sign-up.png`
- `docs/previews/milestone-2-welcome.png`
- `package-lock.json`
- `packages/config/src/brand-tokens.ts`
- `packages/config/src/index.ts`
- `scripts/generate-brand-assets.cjs`

## Review-branch preparation — 2026-10-14

Reviewed the source diff and existing welcome/profile previews before publication on
`review/milestone-2-branding`. No blocking regression or unintended build output was
identified; credential-pattern and sensitive-filename checks found no matches across
36 changed/new files. The PNG derivatives and browser previews are intentional review
assets. Authentication services, route decisions and migrations remain unchanged.

Reran `npm run check` on Node 22: formatting, lint, shared/mobile TypeScript and all
88 tests across 9 files passed. Corrected the report's branch and declared icon-package
version to match the repository. Physical Android checks remain outstanding.
The existing CI workflow runs on `main` pushes and pull requests, so a review-branch
push alone does not trigger CI. No merge, deployment or Supabase changes are included.

## Integration correction — 2026-10-14

Destructive buttons now use a dedicated darker red pressed-state token instead of
primary green. Added a regression check for normal, pressed and disabled destructive
button colors and a contrast check for white text on the new pressed background.
The full local quality suite passed with 90 tests across 9 files.

The inherited Milestone 1 report-only change was excluded from the diff against
`main` so this pull request contains only Milestone 2 changes. No branch history was
rewritten and no database or authentication behavior changed.

The initial PR CI run passed installation, formatting, lint, TypeScript and tests,
but Gitleaks stopped because PR scanning requires `GITHUB_TOKEN`. The workflow now
passes GitHub's automatic token with read-only content/PR permissions and fetches
full history for the scan. Automated PR comments are disabled; secret scanning is
not disabled or suppressed. This is the only CI configuration change in the PR.
