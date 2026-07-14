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

test("returns appointments only from the viewer's band", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    const firstUserId = await ctx.db.insert("users", { email: "first@example.com" });
    const secondUserId = await ctx.db.insert("users", { email: "second@example.com" });
    const firstBandId = await ctx.db.insert("bands", {
      name: "Die Kellerkinder",
      createdBy: firstUserId,
    });
    const secondBandId = await ctx.db.insert("bands", {
      name: "Die Kellerkinder",
      createdBy: secondUserId,
    });

    await ctx.db.insert("bandMembers", { bandId: firstBandId, role: "admin", userId: firstUserId });
    await ctx.db.insert("bandMembers", {
      bandId: secondBandId,
      role: "admin",
      userId: secondUserId,
    });
    await ctx.db.insert("events", {
      bandId: firstBandId,
      kind: "rehearsal",
      name: "Erste Probe",
      dateTime: "2099-01-01T20:00:00.000Z",
      location: "Proberaum A",
      repeat: "none",
      createdBy: firstUserId,
    });
    await ctx.db.insert("events", {
      bandId: secondBandId,
      kind: "rehearsal",
      name: "Zweite Probe",
      dateTime: "2099-01-02T20:00:00.000Z",
      location: "Proberaum B",
      repeat: "none",
      createdBy: secondUserId,
    });
  });

  await expect(
    t.withIdentity({ email: "first@example.com" }).query(api.termine.list, {}),
  ).resolves.toMatchObject([{ name: "Erste Probe" }]);
});
