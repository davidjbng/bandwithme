# Version control

- Keep `origin/main` as GitButler's target. Do each task on its own local GitButler branch so parallel work can stay applied in the shared workspace. Use `but` for all version-control operations.
- Commit only the task's files or hunks to its branch. Preserve other agents' uncommitted changes and branches. Do not push task branches or open pull requests.
- When the task is ready to publish, run `but pull` to update the workspace and linked worktrees, resolve conflicts while preserving all involved work, and run relevant checks. Then use `but land <task-branch> --yes` to land that branch directly on `origin/main`. Land a whole stack only when all its branches belong to the task.
- A land pushes `main` and may trigger the configured deployment workflows. Never land another task's branch without an explicit request.

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
