# Version control

- Work directly on `main`. Use GitButler (`but`) for status, diffs, commits, pulls, merges, and pushes. Do not create task branches or pull requests for routine work.
- Commit only changes for the current task. Preserve other agents' uncommitted work.
- Before pushing `main`, run `but pull` (including linked worktrees), resolve conflicts while preserving all involved work, and run the relevant checks. Then push `main` directly.
- Do not merge or publish unrelated work as part of a task. Deployments triggered by a `main` push follow the configured workflows.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v58.0.0/ before writing any code.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
