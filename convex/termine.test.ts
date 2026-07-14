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

test("does not return appointments to unauthenticated users", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    await ctx.db.insert("events", {
      kind: "rehearsal",
      name: "Probe",
      dateTime: "2099-01-01T20:00:00.000Z",
      location: "Proberaum",
      repeat: "none",
      createdBy: await ctx.db.insert("users", {
        email: "member@example.com",
      }),
    });
  });

  await expect(t.query(api.termine.list, {})).resolves.toEqual([]);
});
