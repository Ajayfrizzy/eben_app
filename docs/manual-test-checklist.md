# Android and Supabase manual test checklist

Status: **physical-device testing remains unexecuted for Milestone 1**. See the Milestone 1 report for automated local backend results. Automated mocks and Android bundle export do not establish device or live-backend correctness. Record PASS, FAIL, or BLOCKED per case, with tester/date, commit, device model/Android version, build profile, network, expected/actual result, and sanitized evidence. Never record tokens, passwords, or real student data.

## Prerequisites

- Use a physical low-end Android device and a separate emulator where available. Test a development build and an installed EAS preview/release APK; Expo Go alone does not validate custom-scheme recovery links or native release behavior.
- Use an isolated local or disposable Supabase test project, never production. Confirm the URL/project identifier before setup or reset. Keep privileged setup credentials outside the mobile app.
- Enable email confirmation, configure a test mail inbox, and allow `eben://reset-password` on the test backend. Confirm the app scheme is `eben`. Use unique disposable email accounts A and B.
- Prepare builds with: both public Supabase variables blank; only URL; only key; whitespace/placeholder values; and valid test-backend values. Expo embeds public variables at bundle time: rebuild after changing them.
- Follow [the RLS integration plan](rls-integration-test-plan.md) separately. API success is not proof of cross-account isolation.

## Startup and environment separation

- [ ] Cold-start and force-stop/relaunch each configuration on device; verify there is no splash hang, native crash, secret leakage, or fixture flash.
- [ ] Development with both variables blank permits fixture exploration but creates no Supabase session or real account. Record this as demo verification only.
- [ ] Development with partial configuration displays a configuration error and cannot enter student routes.
- [ ] Release with missing, partial, whitespace, or template credentials displays a configuration error; no demo login or fixture content appears.
- [ ] Valid configuration with no session opens authentication. Direct links to `/home`, `/community`, `/library/r1`, `/events/e1`, `/notifications`, and `/onboarding` cannot bypass authentication.
- [ ] Valid release configuration plus a verified session requires complete onboarding, then permits the real profile but blocks other fixture-backed routes with an unavailable message. This is intentional until live content replaces fixtures; it is not product release readiness.
- [ ] Valid development configuration uses live authentication; invalid passwords, revoked credentials, or backend failure never fall back to demo.

## Email signup and verification

- [ ] Invalid email and weak password show validation without creating a user; duplicate signup is handled without a crash.
- [ ] Signup sends email to the disposable test inbox. With confirmation enabled and no session returned, the app requests confirmation and does not enter private routes.
- [ ] Unverified login and deep links cannot reach private routes. Complete verification, then sign in; record the actual callback behavior on cold and warm app starts.
- [ ] Expired/reused verification links fail clearly and do not create an authenticated experience.
- [ ] Verify consent behavior against the requirements. Verify the checkbox starts unchecked, documents are accessible, versions/dates match approval, and blank/unapproved configuration blocks live signup. No approved documents currently exist; this is a launch blocker.

## Login, logout, and restoration

- [ ] Correct verified credentials create a session. Wrong password, unknown email, timeout, and backend error show errors without entering student routes.
- [ ] Force-stop/reopen and reboot: the correct account restores from SecureStore without flashing another account's content. Check expired access-token refresh with the test backend.
- [ ] Sign out in development live mode, then press Back, reopen the app, and use private deep links: private content stays inaccessible. Verify sign-out failure during interruption is surfaced and cannot be mistaken for successful logout.
- [ ] Sign in as A, sign out, sign in as B: no A session, profile values, cached private records, or notification data remains visible.
- [ ] Revoke/delete A only in the test backend, then retry refresh and protected operations; RLS/API calls must reject stale access as applicable. Cached-session UI is not a substitute for server authorization.
- [ ] Test logout from the real profile in release and development builds, and from incomplete onboarding. Confirm query caches clear between accounts and no stale profile flashes.

## Password recovery

- [ ] Request a reset for the test account and inspect the email. Test invalid input, unknown account response, delivery delay, and interruption without leaking account existence.
- [ ] Open `eben://reset-password` from email with the app stopped and running. Confirm a recovery session is actually established before password submission.
- [ ] Test expired/reused/tampered links and opening `/reset-password` without a recovery session; no unauthorized password change is allowed.
- [ ] Set a valid new password, confirm the old password fails and the new one works, then check session behavior across restart.
- [ ] Use PKCE code links or verified token-hash links from the setup guide. Confirm same-device verifier handling, ten-minute recovery expiry, replay rejection, and rejection of legacy fragment-only links. Normal sessions must not authorize this reset screen.

## Onboarding and persistence

- [ ] Verified live account can open onboarding; signed-out/unverified users cannot bypass the route guard.
- [ ] Required-field validation works. Save, restart, and independently read that test user's profile using its own JWT; verify full name, country, city, programme, study level, and completion flag persisted.
- [ ] Verify institution and interests persistence separately. Select existing reference rows; verify the institution UUID and deduplicated user-interest links through a fresh session. Save a partial draft, restart, resume, and retry completion without duplicate rows.
- [ ] Account B cannot modify A's profile. Failed saves/network errors leave the form recoverable and do not falsely indicate completion.

## Network interruption and device behavior

- [ ] Toggle airplane mode during startup, signup, login, refresh, onboarding save, reset, and logout. Check error messages, loading termination, retry, and duplicate submissions after reconnection.
- [ ] Test slow 3G, request timeout, Wi-Fi/mobile handover, background/resume, and session expiry while offline. No network error may enable demo mode in live configuration.
- [ ] Check 320px layout, 130% font scaling, keyboard overlap, accessibility labels, and navigation back behavior without changing the design in this milestone.
- [ ] Existing development content is static fixtures; the “cached content” notice does not establish implemented offline caching. Record live cache/retry behavior as unverified.

## Later student-feature acceptance (not implemented or validated here)

- [ ] Create/edit/react/save/comment/report with non-owner denial and actual persistence.
- [ ] Search/open/bookmark resources and enforce restricted URL/storage access.
- [ ] RSVP/cancel with capacity checks; verify notification record before push.
- [ ] Save opportunities and open external applications safely.
- [ ] Verify empty/loading/error/retry states and notification deep links.

Do not mark these scenarios passed on the basis of fixture screens. Keep the administrative dashboard out of scope.

## Milestone 1 privacy and completion checks

- [ ] Sign in with an incomplete profile and directly open each private route; onboarding must be required.
- [ ] Edit profile values, save, sign out/in and verify persistence. A failed save must not navigate or lose the in-memory form.
- [ ] Defaults are private. Opt in to sharing only name/biography; a second test user sees only that projection, never full profile/account details. Revoke sharing and verify it disappears.
- [ ] Account deletion requests persist without promising an invented retention policy.
- [ ] Test malformed/oversized Android links against the native intent filter; confirm valid Unicode links still work.
- [ ] Test missing institutions/interests, offline reference loading, retry, session revocation, and sign-out failure.
