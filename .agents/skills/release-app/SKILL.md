---
name: release-app
disable-model-invocation: true
description: Prepare and publish a Band With Me GitHub release from its Changesets changelog, triggering the repository's Expo/TestFlight release workflow. Invoke manually for an app release.
---

# Release Band With Me

Read `docs/deployment/expo-eas-publishing.md` and the GitButler skill first. Publishing
the GitHub release starts backend deployment, a native EAS build, TestFlight upload
and Expo Hosting deployment. This skill is manual; do not invoke it as a side effect
of dependency maintenance or a normal implementation task.

## Prepare the exact version

1. Read `but status`, `.changeset/*.md`, `CHANGELOG.md` if present, `package.json`,
   `app.json` and `eas.json`. Preserve unrelated applied branches and uncommitted
   work. The release contains only work that has reached `origin/main`.
2. Prepare from the exact current `origin/main` tree. If the shared workspace has
   other applied branches or uncommitted changes, create an isolated release
   checkout at that SHA with the available worktree tooling; this is a concrete
   isolation requirement. Do not unapply or modify other agents' branches. Never
   consume changesets from unlanded work. In that release checkout, run
   `pnpm version-packages`, inspect the generated version and changelog, and commit
   only the release preparation files with GitButler. Follow the repository's
   normal landing procedure when publishing this version is authorized. Never
   publish a local workspace merge. Continue all release checks from this checkout.
3. Require a numeric `X.Y.Z` app version and tag `vX.Y.Z`. Run
   `node scripts/release-metadata.mjs --release vX.Y.Z`. This checks version parity,
   the changelog, consumed changesets and the App Store Connect app ID. Resolve
   signing/project-access prerequisites in the release guide before publication.
4. Fetch the remote main SHA using `gh api repos/davidjbng/bandwithme/commits/main
   --jq .sha`. Read the version and changelog at that exact SHA, and verify the
   latest CI push run for that SHA succeeded (`gh run list`/`gh run view`). Wait for
   a running check. Do not treat an older successful run or a PR merge SHA as proof.
   Confirm the target tag/release does not already exist. Do not move a tag or
   replace an existing release to retry.

## Write release notes

Read only that version's generated changelog and the corresponding merged changes.
Write a warm, short title and notes in the user's language. Lead with what band
members can now do, group related improvements, and mention migration or known
limits honestly. Do not invent features, fixes, test results or performance claims.
Include meaningful acknowledgements when supported by the change history. Keep
internal package bumps out of the headline unless they change user behavior.

Show the final version, exact main SHA and notes. If the user asked to publish the
release, that authorization is sufficient; if they asked only for a draft or preview,
stop before publication. Keep note text in a temporary UTF-8 file outside the repo.

## Publish and follow through

Use `gh release create vX.Y.Z --target EXACT_MAIN_SHA --title "TITLE"
--notes-file /tmp/RELEASE_NOTES.md`. Use an existing authorized GitHub user session,
not a workflow's `GITHUB_TOKEN`, because token-created events may not trigger another
workflow. If the user requested a GitHub prerelease, add `--prerelease`; keep the
native app version numeric. A draft uses `--draft` and intentionally does not deploy.

Follow the **Deploy release** GitHub run and linked EAS workflow to completion.
Report the release link, target SHA, build ID and furthest verified Apple state.
Do not equate a queued submission with tester availability. For submission-only
failure, inspect and reuse the successful build; do not blindly dispatch another
build. A code fix gets a new changeset/version. Do not send invitations or submit
public App Review unless separately requested.
