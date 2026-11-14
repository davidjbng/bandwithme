# Convex Auth 2 clean start

Decision date: 2026-11-14. [Convex Auth 2 clean-start migration](https://github.com/davidjbng/bandwithme/issues/33). The user explicitly chose to discard **all existing auth and app test data**, rather than migrate accounts, sessions, memberships or events. This authorization was for the existing test deployment, not future user data or other deployments.

## Implemented authentication

`@convex-dev/auth` 2.0.0 mounts the `auth`, `authEmail`, `authUsername` and `authPassword` components plus Resend. The application owns a separate plain `users` table. `getAuthUserId` resolves live Auth 2 sessions; app mutations keep their author and membership checks. Tests use genuine component sessions and password hashing, rather than spoofing a v1 subject.

Email/password signup requires an email verification link and a secret retained by the requesting client. Password recovery likewise requires the link and client secret, replaces the password and revokes previous sessions. The minimum new-password length is ten characters; common passwords are rejected. Open links on the requesting device in the same app/browser. Verified universal/app links are necessary for native handoff; their real-device behavior still needs validation.

The frontend uses `ConvexAuthProvider` with the exported `api.auth` and a deployment-specific v2 storage namespace. Browser storage and native SecureStore keep the flow secrets locally. Old v1 sessions are not reused. Invitations are validated and saved per deployment across signup and recovery. The new `/validate-email` and `/reset-password` routes handle missing/invalid codes; changed codes remount their one-shot completion hooks.

Auth 2 currently uses verified email/password here. The old magic-link providers, development authentication bypass, authTables and JWT key configuration are removed from code. Legacy environment variables are unused, not reused as Auth 2 configuration. See [Auth 2 setup](https://docs.convex.dev/auth/convex-auth/getting-started), [email/password](https://docs.convex.dev/auth/convex-auth/methods/email-password) and [v1 migration](https://docs.convex.dev/auth/convex-auth/migrating/from-convex-auth-v1).

## Executed reset

The selected deployment was `blissful-spaniel-445`, identified by Convex as `[Development] mail-ee893:bandwithme:dev/david-jebing`. Existing client and EAS profile URLs also point to it; despite the old `PRODUCTION_URL` constant name, this is the shared test backend.

A temporary ZIP containing an empty `users/documents.jsonl` was imported with the installed CLI's `--replace-all`, explicit deployment name and the user's deletion authorization. It deleted **316 records** across the old auth and app tables. A one-shot `convex dev` with an explicit deployment env file then installed Auth 2 components, the new schema and current functions. The command completed successfully.

Subsequent bounded reads confirmed every root table and `_storage` was empty. Six unused Auth 1 table definitions remain empty. An attempted second broad import solely to remove their definitions was rejected by automatic approval review because it could also erase any newly created data. It was not executed or bypassed. Their presence does not preserve old accounts or sessions and does not affect Auth 2; no further reset is needed.

Old installed/hosted clients need the updated frontend. The backend reset is complete; no GitHub release, EAS build, TestFlight submission or web deployment was initiated by this setup. Do not repeat the reset command as a release prerequisite.

## Email readiness

Backend configuration requires `RESEND_API_KEY` and a correct `SITE_URL`. The current sender is `Band With Me <auth@bandwithme.de>`. With explicit user approval, the existing key was used only for `GET https://api.resend.com/domains`; Resend returned `401 restricted_api_key`. The key is restricted and cannot list domains, so that read cannot confirm domain verification. No key value was printed, no permissions were broadened and no real email was sent.

Verify the sender/domain in the Resend dashboard before onboarding users, and run one real signup/recovery round trip on each target platform. The Vitest Resend stub confirms message/link construction, but does not establish deliverability. Do not replace the restricted sending key with a broad key merely to make a setup check pass.

## Validation

The integration suite covers verified signup, missing/wrong client secrets, genuine session issuance, user/band creation, private idea submission, sign-out revocation, password recovery, old-session revocation, old/new passwords and link replay. Invite storage tests cover web/native storage, deployment isolation, removal and hostile redirects. Browser smoke tests cover accessible auth controls and safe invalid-link pages. Real inbox delivery, native link handoff and hardware behavior remain separate checks.

## Login-first navigation and usernames

The app opens `/sign-in` directly for guests. Root protected routes keep tabs, events, song creation, band settings and onboarding unavailable until authentication resolves. Public email callbacks and invitation previews stay reachable. After initial hydration the navigator stays mounted during Auth 2's transient loading state; unmounting it would destroy the one-shot verification flow. Login returns to the tabbed app, or a validated pending invitation; logout removes protected navigation history.

Registration asks for a desired username, email and password. The email/password method remains authoritative: no session or usable username exists before email verification. The desired username and matching email stay in deployment-scoped local storage/SecureStore, never together with a password. After verification the user confirms the name; if another account claimed it meanwhile, they choose another. Existing users can add or change a username from Profile. Names use 3–30 ASCII letters, digits, `.`, `_` or `-`; comparisons are case-insensitive. The official Auth 2 username component atomically enforces uniqueness. Names do not replace profile display names.

`auth.signInWithIdentifier` accepts either username or email, limits lookups per IP before account resolution, resolves the verified primary email only on the server and delegates password/session handling to the existing Auth 2 method. No public username-to-email lookup is exposed. Password recovery continues through the verified email, and the same new password works with the username. `user.setUsername` derives the account from the live session and requires a verified email. No existing user or app data is reset or migrated.

Deploy the additional `authUsername` component and updated Convex functions before serving the updated client; code generation alone does not deploy runtime code. This change does not publish a GitHub release or an EAS deployment. Tests cover real component username collisions, normalization, invalid credentials, per-IP lookup limits, email verification, recovery, web/native preference storage and browser login/logout/refresh/verification/invitation transitions. Browser auth transitions use an isolated transport fixture, not a live inbox. Real-device link handoff and real email delivery still need verification.

Local verification for the login-first update: `pnpm check`, 52 Vitest tests and all 18 production-export Playwright checks passed on 2026-11-14. Authenticated Tour Notes, event header placement and browser date/time controls also passed after switching those checks to the shared isolated band fixture. Two independent review agents found the transient-loading unmount issue; it was corrected and the successful/invalid verification paths now run in CI. No live emails or deployment resets were used for these checks.
