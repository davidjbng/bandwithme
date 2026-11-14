# Release-driven Expo delivery

Research and implementation for [Release-driven Expo delivery](https://github.com/davidjbng/bandwithme/issues/30), 2026-11-14.

## Decisions and evidence

- The repository already had main-push CI plus three independent production paths:
  Convex deployment inside E2E, Pages, EAS web and OTA publication. Replace those
  paths with secret-free CI and one release workflow. GitHub's `release: published`
  event covers published releases, including prereleases, while a draft does not
  deploy. [GitHub event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release).
- The deployment dispatches EAS with an immutable commit SHA using `workflow:run
  --ref` and waits with `--wait`. The CLI help confirms that `--ref` uses that remote
  revision instead of uploading the local checkout, and a failed workflow returns
  a nonzero exit code. This requires the linked GitHub repository.
  [EAS workflow runs](https://docs.expo.dev/eas/workflows/manage-workflow-runs/).
- EAS's `build` job produces `build_id`; pass that output directly to `testflight`
  to avoid selecting a different, newer build. The `deploy` job preserves Expo
  Hosting as the single web publishing destination, after native submission.
  [EAS pre-packaged jobs](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/).
- Noninteractive iOS submission needs a real `ascAppId` and configured credentials.
  A TestFlight upload is distinct from App Review and public distribution.
  [Expo iOS submission](https://docs.expo.dev/submit/ios/).
- Changesets must explicitly version this private root package. Set
  `privatePackages.version: true`, `tag: false`, retain `private: true`, and use
  `changeset version` without npm publication. Synchronize Expo's marketing version
  after versioning; retain EAS remote build-number increments.
  [Changesets configuration](https://github.com/changesets/changesets/blob/main/docs/guide/config.md)
  and [Expo SDK 58 app configuration](https://docs.expo.dev/versions/v58.0.0/config/app/).
- A native app version uses numeric `X.Y.Z`; GitHub can mark its release as a
  prerelease without inserting a suffix into the iOS marketing version. A major
  feature normally receives a minor bump, not an automatically breaking major.

## Scope and validation

Changed CI/deployment YAML, `eas.json`, Changesets config, a guarded version-sync and
release-metadata script with tests, the release guide, and the manual release skill.
The tooling task supplies pinned `eas-cli`/Changesets dependencies and the smoke
suite. The root task documents the agent changeset requirement.

Fetched the live [EAS workflow JSON schema](https://api.expo.dev/v2/workflows/schema),
syntax and pre-packaged-job source before authoring. Verified current upstream
Actions releases (checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2,
pnpm/action-setup v6.1.1) through their repository release APIs.

Release metadata unit checks cover mismatched versions/tags, pending changesets,
missing changelog entries, missing/placeholder Apple app IDs and unsupported native
version suffixes. The ordinary development check accepts unversioned pending work.
The version-sync integration test preserves unrelated Expo configuration. These
checks run with the repository's Vitest suite. GitHub workflow validation with
actionlint 1.7.12 and local validation against the live EAS JSON schema passed.
Changesets status correctly recognized the private root app and its pending bump.

EAS's authoritative CLI validation was attempted and blocked with `Entity Not
Authorized` for the configured project. The Expo connector returned the same access
failure. This prevents claiming server validation or release readiness. See the
[release guide](../deployment/expo-eas-publishing.md) for the exact setup steps.

No release was published, no deployment was executed, and no paid build or Apple
submission was started.
