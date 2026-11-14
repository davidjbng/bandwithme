---
name: convex-setup-auth
description: Set up or change authentication and identity mapping in this Convex app. Use for sign-in methods, auth providers, profile linkage, and protected backend functions.
---

# Convex authentication

This is a repository-maintained adaptation of `get-convex/agent-skills`, updated for Convex Auth v2. Read `convex/_generated/ai/guidelines.md` first.

## Determine the actual version

Read `package.json`, the lockfile and the installed package exports before using an auth API. Band With Me uses Convex Auth v2. Follow [the current getting-started guide](https://docs.convex.dev/auth/convex-auth/getting-started) and [the local reference](references/convex-auth.md). Do not copy legacy v1 examples into a v2 app.

Existing choices and the user's current instructions settle the provider, sign-in methods and environment scope. Ask only when a required choice remains unclear. Changes to login methods must reach backend configuration, profile mapping, the client provider, forms, tests and deployment documentation.

For a different provider explicitly chosen by the user, read its official guide and matching reference: [Clerk](references/clerk.md), [WorkOS](references/workos-authkit.md), or [Auth0](references/auth0.md).

## Implementation

- Use the provider's current documentation and the installed types as the API contract.
- For Auth v2, register the auth and selected method components, configure `convexAuthProvider()`, and use `setupConvexAuth`. Auth keys are managed by the deployment.
- Do not run the v1 `npx @convex-dev/auth` initializer, add `authTables`, or generate JWT keys for v2.
- Keep app profile data separate from component-owned auth data and derive the association from authenticated server identity. Never accept a client-provided user ID as authorization.
- Every protected query, mutation and action must enforce identity and resource ownership. Authentication alone does not grant access to every band.
- Preserve the existing native secure-storage adapter and web behavior when changing the client provider. Use `ConvexAuthProvider` with the current package contract.
- Resolve schema and data migration separately. A request to update auth never implicitly authorizes deleting existing data.
- Follow the user's existing deployment authorization; a local typecheck does not deploy or prove a login round-trip.

## Verification

Run the repository's typecheck and meaningful auth/authorization tests. Test sign-up, sign-in, sign-out, refresh/persistence, invalid credentials and forbidden access. Exercise native and web redirect/storage paths when those platforms are affected. Report any untested real-provider or device-dependent behavior explicitly.
