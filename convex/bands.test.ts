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

test("rejects creating a band on behalf of another user", async () => {
  const t = convexTest(schema, modules);
  const victimId = await t.run((ctx) => ctx.db.insert("users", { email: "victim@example.com" }));
  await t.run((ctx) => ctx.db.insert("users", { email: "attacker@example.com" }));

  await expect(
    t.withIdentity({ email: "attacker@example.com" }).mutation(api.bands.create, {
      name: "Übernommene Band",
      userId: victimId,
    }),
  ).rejects.toThrow("Du darfst keine Aktionen für andere Benutzer ausführen.");
});
