import { registerCore, sessionIdentity } from "@convex-dev/auth/test";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { vi } from "vitest";
import { convexTest } from "convex-test";
import { components } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");
export function backendTest() {
  vi.stubEnv("CONVEX_CLOUD_URL", "https://test.convex.cloud");
  const t = convexTest(schema, modules);
  registerCore(t);
  registerRateLimiter(t);
  return t;
}

// Only tests mint identities directly; production sign-in goes through verified credentials.
export async function asUser(t: ReturnType<typeof backendTest>, userId: Id<"users">) {
  // oxlint-disable-next-line no-underscore-dangle -- Official internal fixture API; never exported by the app.
  const tokens = await t.mutation(components.auth.public._internal_dangerous_signIn, {
    userId,
    claims: { method: "test", profile: {} },
    componentPath: "test",
    accessTokenTtlSeconds: 60,
    refreshInactivityTimeoutSeconds: 3600,
    sessionMaxLifetimeSeconds: 3600,
  });
  return t.withIdentity(sessionIdentity(tokens));
}
