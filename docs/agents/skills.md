# Repository skills

`.agents/skills` is the canonical source. `.claude/skills` uses relative symlinks. Existing `agent/skills` directories retain identical compatibility copies; newly added skills link to the canonical source. GitButler could not safely commit an in-place directory-to-symlink conversion, so existing directories were preserved. `skills-lock.json` records source paths, resolved commits and content hashes for installed upstream skills. Repo-specific skills remain local.

## Selection

- Matt Pocock's current engineering collection provides planning, research, specifications, implementation, review and retrospectives. Existing non-engineering skills are retained when upstream still maintains them. Upstream-deleted skills were removed rather than keeping stale duplicate workflows.
- `agent-device` is the device controller. Reuse the existing client and coordinate simulator ownership; see [local design workflow](local-design-workflow.md). Argent skills are no longer installed.
- Impeccable provides design review and implementation guidance, including native platform references. Load its `SKILL.md` before use; no design hook or global agent configuration is installed by this repository setup.
- `pnpm` and `vitest`, discovered in the Meine GAG repository, come from `antfu/skills` at a recorded upstream commit. They match this project's package management and tests.
- Existing Expo, Convex, Playwright and Ease guidance remains available. `convex-setup-auth` is a repository-maintained Auth v2 adaptation: never replace it blindly with an older v1 upstream workflow.

## Repository rules win

Skills do not grant publishing, merging, deployment, reset or credential access authority. Follow `AGENTS.md` and the user's current request. Use GitButler for version-control operations even when an upstream example uses Git. The `pr` skill does not override this repository's publishing rules.

Use the structured question tool for decisions. Batch independent questions and put the recommended option first; do not ask again about choices already established in the current task.

The Matt setup is configured for GitHub Issues, the existing default triage labels, and a single `GLOSSARY.md` with `docs/adr/`. Read [issue tracker](issue-tracker.md), [triage labels](triage-labels.md), and [domain docs](domain.md) when the engineering skills request them. Wayfinder uses native GitHub sub-issues and dependency edges, and claims tickets by assigning the driving developer.

## Updating

1. Inspect `skills-lock.json`, local changes, and the upstream release/source before replacing files. Keep local adaptations and project-specific skills.
2. Install only the selected skill directories into `.agents/skills`, including their referenced files and executable launchers. Record the source commit and the skills CLI v2 folder hash.
3. Reconcile removed/renamed upstream skills, update relative links, and synchronize the existing `agent/skills` compatibility copies. Compare each copy with its canonical folder hash.
4. Re-run `setup-matt-pocock-skills` as an audit of existing choices. Preserve established tracker and label conventions; inspect current templates for new requirements.
5. Validate skill discovery, relative links, recorded hashes and local references. Upstream skill changes can introduce new tools or assumptions; installed instructions are not evidence that those tools are configured.

Newly installed skills are available to agents after their skill catalog refreshes, normally on the next turn.
