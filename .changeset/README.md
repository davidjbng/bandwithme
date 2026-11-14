# Changesets

Run `pnpm changeset` for every substantial user-facing feature and behavior change.
Choose `bandwithme`, select the appropriate semantic version bump, and explain the
benefit for band members. A major feature normally receives a minor bump; use major
for a breaking change. Commit its changeset with the implementation.

Use `pnpm version-packages` only when preparing a release. This consumes the pending
changesets, updates `package.json` and `CHANGELOG.md`, and synchronizes the Expo app
version. Commit those files and the removed changesets together with GitButler.

This is a private app: do not run `changeset publish` or publish it to npm.
The manually invoked `release-app` skill publishes GitHub releases from the generated
changelog. See [the release guide](../docs/deployment/expo-eas-publishing.md).
