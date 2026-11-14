import { backendTest, asUser } from "../test/backend";
import { expect, test } from "vitest";
import { api } from "./_generated/api";

test("does not return appointments to unauthenticated users", async () => {
  const t = backendTest();

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
  const t = backendTest();

  const firstUserId = await t.run(async (ctx) => {
    const createdFirstUserId = await ctx.db.insert("users", { email: "first@example.com" });
    const secondUserId = await ctx.db.insert("users", { email: "second@example.com" });
    const firstBandId = await ctx.db.insert("bands", {
      name: "Die Kellerkinder",
      createdBy: createdFirstUserId,
    });
    const secondBandId = await ctx.db.insert("bands", {
      name: "Die Kellerkinder",
      createdBy: secondUserId,
    });

    await ctx.db.insert("bandMembers", {
      bandId: firstBandId,
      role: "admin",
      userId: createdFirstUserId,
    });
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
      createdBy: createdFirstUserId,
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
    return createdFirstUserId;
  });

  await expect((await asUser(t, firstUserId)).query(api.termine.list, {})).resolves.toMatchObject([
    { name: "Erste Probe" },
  ]);
});

test("rejects event overflow before a new event can break the band's lists", async () => {
  const t = backendTest();
  const userId = await t.run((ctx) => ctx.db.insert("users", { name: "Mira" }));
  const member = await asUser(t, userId);
  const bandId = await member.mutation(api.bands.create, { userId, name: "Band" });
  const event = {
    kind: "rehearsal" as const,
    name: "Probe",
    dateTime: "2099-01-01T20:00:00.000Z",
    location: "Room",
    repeat: "none" as const,
  };
  await t.run(async (ctx) => {
    for (let i = 0; i < 200; i++)
      await ctx.db.insert("events", { ...event, bandId, createdBy: userId });
  });
  await expect(member.mutation(api.termine.create, { ...event, userId })).rejects.toThrow(
    "200 Terminen",
  );
  expect(await member.query(api.termine.list, {})).toHaveLength(200);
});
