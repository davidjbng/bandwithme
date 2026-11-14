# Releases and Expo delivery

Every push to `main` and every pull request runs `.github/workflows/ci.yml`:
Vite+ checks, unit tests, script checks, Changesets validation, a static web export,
and backend-independent Playwright smoke tests. CI has no deployment credentials
and never deploys Convex or publishes an app.

## Record changes

Run `pnpm changeset` for every substantial feature or user-visible behavior change.
Commit the changeset with its implementation. Write the benefit in plain language,
including migration or compatibility impact when relevant. A substantial feature
usually means a **minor** bump; a breaking change means **major**.

The private root package is versioned through Changesets, but is never published to
npm. Before a release, `pnpm version-packages` consumes pending changesets, generates
`CHANGELOG.md`, and synchronizes `app.json` with the package version. EAS continues
to manage native build numbers remotely with `autoIncrement`.

## Release deliberately

Invoke `$release-app` to prepare and publish a release. The skill checks the exact
main commit and CI, uses the generated changelog to write short, accurate release
notes, and publishes a `vX.Y.Z` GitHub release for that commit. A draft release does
not deploy. Versioning commits still follow the repository's GitButler rules.

A published GitHub release triggers `.github/workflows/deploy-release.yml`:

1. Run the CI checks again on the release commit.
2. Verify that the tag, package and Expo versions match, the changelog contains the
   version, pending changesets have been consumed, an Apple app is configured, and
   the commit belongs to `main`.
3. Validate the EAS workflow and deploy Convex with the existing deployment key.
4. Start `.eas/workflows/release.yml` with `--ref` set to the exact release SHA.
5. EAS verifies metadata, builds iOS with the store production profile, submits that
   exact build to TestFlight, then deploys the web app to Expo Hosting.

The GitHub job waits for the EAS workflow and reports failure if it fails. Production
runs are serialized. The previous main-push OTA, GitHub Pages and EAS web workflows
were replaced so one release has one delivery path. Expo Hosting remains the web
host. No automatic OTA update bypasses the native release and compatibility checks.

TestFlight upload is not a public App Store release. Apple processing, compliance,
and existing tester-group access still determine when testers can install a build.
The workflow does not create invitations or submit a public App Review.

## One-time operational prerequisites

Before the first release:

- Give the release operator and the GitHub `EXPO_TOKEN` access to
  `@davidjbng/bandwithme` (`fc58fe98-4cff-4da0-bdc7-08fdcfd99a19`). Link
  `davidjbng/bandwithme` in that Expo project's GitHub settings; `--ref` requires the
  linked repository.
- Confirm the App Store Connect record for `com.anonymous.bandwithme` belongs to
  Apple team `DY6QC7DS48`. Add its real numeric Apple ID as
  `submit.production.ios.ascAppId` in `eas.json`. No placeholder ID is committed.
- Configure production signing and an App Store Connect API key in EAS using
  `pnpm exec eas credentials --platform ios`. The app and key must be accessible to
  the intended Apple team. Check existing internal TestFlight groups in App Store
  Connect if tester access is required.
- Keep `EXPO_TOKEN` and `CONVEX_DEPLOY_KEY` in GitHub repository/environment secrets.
  Their names existed when inspected; their values were not retrieved or tested.
- Confirm EAS `production` environment variables `EXPO_PUBLIC_CONVEX_URL` and
  `EXPO_PUBLIC_CONVEX_SITE_URL` point to the deployment selected by
  `CONVEX_DEPLOY_KEY`. Native production values currently remain in `eas.json`;
  Expo Hosting reads the EAS environment. Never mix development and production
  backend URLs. Configure backend auth/email variables before publishing.
- Run `pnpm exec eas workflow:validate .eas/workflows/release.yml --non-interactive`
  with the correct account before publishing. Configure required checks on `main`
  in GitHub branch rules if merges should be enforced by the server.

On 2026-11-14, EAS CLI and the Expo connector both denied access to the configured
project for the current local Expo account. The available App Store Connect profile
returned no app matching the bundle identifier. These are readiness blockers, not
proof that the project or app is absent from another account. No remote build,
submission, release or production deployment was started during this setup. The separately
authorized Convex development reset and Auth2 deployment are outside this release workflow.

## Recover a failed release

Read the failed GitHub step and the linked EAS workflow before retrying. A deployment
is not atomic: Convex may already have deployed when a native build fails. Keep
backend changes compatible with installed clients. For a submission-only failure,
reuse the successful build ID after fixing the Apple prerequisite rather than
blindly rerunning the whole workflow and making a new build. Never move an existing
release tag or silently replace its artifacts. Make a new version for code fixes.
