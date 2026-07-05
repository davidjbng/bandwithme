---
name: implement
description: "Implement a piece of work based on a PRD or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the PRD or issues.

## Project Context

- **Stack**: Expo SDK 56, React Native, Convex (backend), TypeScript
- **Package manager**: pnpm (not npm)
- **Dev command**: `pnpm web` (Expo web)
- **Convex dev**: `npx convex dev` (runs alongside web)
- **Web port**: 8081
- **Workflow**: web-first development, validate later with Expo Go

## Process

1. Read the relevant PRD/issue from `docs/prd/` and `docs/prd/implementation-breakdown.md`
2. Use project domain vocabulary from `CONTEXT.md`
3. Respect ADRs in `docs/adr/`

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /review to review the work.

Commit your work to the current branch with trailer `Assisted-By: Hermes Agent`.