# Convex Auth v2

Use the installed `@convex-dev/auth` version and current [getting-started guide](https://docs.convex.dev/auth/convex-auth/getting-started). The [overview](https://docs.convex.dev/auth/convex-auth) identifies v2 as stable and distinguishes it from v1.

## Core wiring

1. Register the core auth component in `convex/convex.config.ts` using `@convex-dev/auth/convex.config.js`.
2. In `convex/auth.config.ts`, use `providers: [convexAuthProvider()]` from `@convex-dev/auth/server`.
3. In `convex/auth.ts`, call `setupConvexAuth({ component: components.auth })` and export its required core functions.
4. Follow the selected method's linked guide from the getting-started page to register its component and expose its methods. Select methods from the user's requirements and actual platform support.
5. Wire the React provider and method hooks from the installed package, retaining the app's native secure storage and web session behavior.
6. Use the authenticated identity to link app-owned profile records; component auth records are not a replacement for the app's domain model.

The deployment signs access tokens itself. V2 does not need the legacy initializer, app-schema `authTables`, manually generated `JWT_PRIVATE_KEY`/`JWKS`, or an `@auth/core` pin copied from a v1 guide. Remove legacy code only as part of a deliberate migration with tests.

## Existing installations

For a v1 project that must preserve accounts, read the migration guide linked from the current docs before changing schema or session handling. Never infer authorization to reset data from an upgrade request. A specifically authorized clean start must name its target deployment and preserve the separation between authentication and application data.

## Checks

- Core and method components are installed in the intended deployment.
- Generated APIs match the configured components.
- Authenticated requests reach protected functions; anonymous requests and cross-band access fail.
- Native storage, browser refresh, sign-out and sign-in are exercised.
- Redirect URLs and provider configuration match the intended environment.

Use the repository's package scripts for validation. Code generation and local tests alone do not establish that remote sign-in is configured or working.
