# Modernization integration review

Reviewed 2026-11-14. [Decision map](https://github.com/davidjbng/bandwithme/issues/27). Work remains on scoped local GitButler branches; no branch, release or app build was published.

## Delivered

- Updated agent-device, Matt Pocock, Impeccable, pnpm/Vitest and Ease guidance, with source provenance and compatibility aliases. Matt setup verified the GitHub tracker, labels and glossary convention. See [skills audit](skills-modernization.md).
- Latest dependencies, Vite+ lint/format/native TypeScript checks, Vitest, Playwright, monthly grouped Dependabot and an explicit dependency PR review/fix/merge skill. See [dependency decisions](tooling-modernization.md).
- Main/PR CI and GitHub-release-driven EAS build, TestFlight submission and web delivery. Changesets and an explicit release skill own versioning/release notes. See [release prerequisites](../deployment/expo-eas-publishing.md).
- Convex Auth 2, verified email/password, recovery, invitation continuity and the user-authorized complete test-data reset. See [reset record](auth-v2-reset.md).
- Private idea capture with a large text field, strictly local speech recognition and text fallback, quota/idempotency, author isolation and a manual feedback-review skill. See [feedback and AI research](feedback-and-device-ai.md).

## Integrated evidence

- Frozen pnpm installation succeeds; Vite+ formatting, lint and Go-powered TypeScript checks pass.
- 38 Vitest tests pass: real Auth 2 hashing/session/recovery, authorization, bands/events, private ideas and rate-limit refill, invitation storage, release metadata, prototype state and ten native speech lifecycle cases.
- Web, iOS and Android production JavaScript/Hermes exports succeed. All eight production-web smoke cases pass on desktop/mobile browser viewports. The actual mobile sign-in layout was visually checked.
- The expanded development browser suite also checks legacy-bypass removal, Auth 2 link handling, onboarding guards, date input, navigation and prototype interactions. See the final run below; authenticated band creation is deliberately gated on a separate disposable backend and verified fixture credentials.
- Native iOS `xcodebuild` succeeds with Xcode 27.2, generic Simulator Debug, ARM64 and x86_64, signing disabled. Patched Swift recognition code, Skia, Ease, Keyboard Controller and Expo UI compile. No simulator was started. Temporary 8.3 GB DerivedData was removed; small logs/metadata remain in `/tmp/bwm-native-verification-20261114/`.
- Named Convex test deployment reset/deploy succeeds. Bounded reads confirm all root tables and file storage empty after reset; live anonymous auth returns false and private-ideas query returns an empty list.
- GitHub Actions linting, EAS workflow JSON schema, Dependabot schema, Changeset metadata and custom skill YAML were checked. The bundled Python skill validator requires unavailable PyYAML; equivalent metadata parsing/constraints were checked using the installed YAML parser. Full EAS account-backed validation is blocked as described below.

## Review corrections

Independent review caught and fixed invitation loss during password recovery, one-shot link hooks retaining an old code, React Native's missing `window.location`, skipped-user-query loading loops, redirects before auth hydration, and raw string children in Expo UI Buttons. Regression checks cover the affected routes/flows. Expo UI Buttons now use `label`; React Native text fields remain because Keyboard Controller does not reliably observe Compose/SwiftUI fields. This keeps keyboard-aware forms functional while adopting native Expo UI actions.

The on-device speech implementation rejects unsupported locale/device paths before recording, never persists audio, ignores cancelled permission results, waits for final transcripts, aborts on background/unmount and bounds recording/final-result waits. The iOS package patch closes an upstream conditional offline-flag fallback.

## Remaining operational gates

- Current Expo account cannot access the configured EAS project; current App Store Connect profile cannot see the app. Set the correct access, actual `ascAppId`, signing/API credentials and repository connection before publishing a release. The workflow intentionally fails before a paid build if those are absent.
- Resend returned `restricted_api_key` for the explicitly approved domain read. Confirm the sender domain in its dashboard and perform a real inbox signup/recovery test. Sending keys should remain least-privilege.
- Rebuilt-device tests are still required for iOS/Android offline speech with missing/installed German models, microphone denial, keyboard behavior, accessibility and universal/app-link handoff. Compilation and JS tests do not prove these behaviors.
- Expo Doctor reports 18/20: documented newer React/native versions and the deliberate local EAS CLI pin. Both native compilation checks now provide evidence for those versions; device runtime still needs separate verification.
- Convex's generated guidelines are current. Its CLI still reports the vendored skill snapshot out of date; the local auth skill intentionally contains Auth 2 guidance absent from the old initializer. Do not blindly overwrite that correction with an upstream v1 recipe.
- Six old Auth 1 table definitions remain empty after reset. Automatic approval review rejected a second broad deletion, which was not executed. New data must not be erased to tidy table definitions.

## Final browser/native follow-up

Android ARM64 Debug `assembleDebug` succeeds with the existing JDK 21 / Gradle 9.4.1 / SDK 37 / NDK 27.1 toolchain (898 tasks, 2 minutes 25 seconds). No SDK, NDK or emulator image was added; only normal Maven artifacts were fetched. The debug APK is `/tmp/bwm-native-verification-20261114/bandwithme-debug.apk`, with `android-summary.json` beside it. Task-owned intermediate build files were removed; shared caches were preserved. No device was started or APK installed.

The final full development browser run passes **52 cases**, with **two explicit fixture skips** and no failures, across desktop Chromium and Pixel 7/mobile Chrome. The skips are the same authenticated band/invitation scenario in two browser projects: no preverified disposable-backend account was supplied. All unauthenticated Auth 2, missing-secret, removed-bypass, legacy URL, onboarding, home, event/date-picker and prototype cases pass. A stale Metro module cache required a clean restart; the final run used the stable tree. Its temporary Metro process was stopped. Setup for the optional fixture is in `e2e/README.md`.
