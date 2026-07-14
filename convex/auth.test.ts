import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

declare global {
  interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
}

const modules = import.meta.glob("./**/*.ts");

test("creates a password account and signs it in with the same credentials", async () => {
  const t = convexTest(schema, modules);
  const credentials = {
    email: "password-user@example.com",
    password: "correct-horse-battery-staple",
  };

  await expect(
    t.action(api.auth.signIn, {
      provider: "password",
      params: { flow: "signUp", ...credentials },
    }),
  ).rejects.toThrow("Missing environment variable `JWT_PRIVATE_KEY`");

  await expect(
    t.action(api.auth.signIn, {
      provider: "password",
      params: { flow: "signIn", ...credentials },
    }),
  ).rejects.toThrow("Missing environment variable `JWT_PRIVATE_KEY`");
});
