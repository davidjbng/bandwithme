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
  const attackerId = await t.run((ctx) =>
    ctx.db.insert("users", { email: "attacker@example.com" }),
  );

  await expect(
    t.withIdentity({ subject: `${attackerId}|session` }).mutation(api.bands.create, {
      name: "Übernommene Band",
      userId: victimId,
    }),
  ).rejects.toThrow("Du darfst keine Aktionen für andere Benutzer ausführen.");
});

test("lets an admin create an invitation and a new user join with it", async () => {
  const t = convexTest(schema, modules);
  const fixture = await t.run(async (ctx) => {
    const adminId = await ctx.db.insert("users", { email: "admin@example.com" });
    const bandId = await ctx.db.insert("bands", { name: "Die Kellerkinder", createdBy: adminId });
    await ctx.db.insert("bandMembers", { bandId, role: "admin", userId: adminId });
    const newUserId = await ctx.db.insert("users", { email: "new@example.com" });
    return { adminId, bandId, newUserId };
  });

  const { acceptInvite, createInvite, previewInvite } = api.bands;

  const invite = await t
    .withIdentity({ subject: `${fixture.adminId}|session` })
    .mutation(createInvite, {});
  expect(invite.token).toEqual(expect.any(String));
  expect(invite.token.length).toBeGreaterThan(20);

  await expect(t.query(previewInvite, { token: invite.token })).resolves.toMatchObject({
    bandName: "Die Kellerkinder",
  });

  await t
    .withIdentity({ subject: `${fixture.newUserId}|session` })
    .mutation(acceptInvite, { token: invite.token });

  const memberships = await t.run((ctx) =>
    ctx.db
      .query("bandMembers")
      .withIndex("by_bandId", (q) => q.eq("bandId", fixture.bandId))
      .collect(),
  );
  expect(memberships).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ userId: fixture.adminId, role: "admin" }),
      expect.objectContaining({ userId: fixture.newUserId, role: "member" }),
    ]),
  );
});

test("does not allow a band member to create invitation links", async () => {
  const t = convexTest(schema, modules);

  const memberId = await t.run(async (ctx) => {
    const adminId = await ctx.db.insert("users", { email: "admin@example.com" });
    const createdMemberId = await ctx.db.insert("users", { email: "member@example.com" });
    const bandId = await ctx.db.insert("bands", { name: "Die Kellerkinder", createdBy: adminId });
    await ctx.db.insert("bandMembers", { bandId, role: "admin", userId: adminId });
    await ctx.db.insert("bandMembers", { bandId, role: "member", userId: createdMemberId });
    return createdMemberId;
  });

  const { createInvite } = api.bands;
  await expect(
    t.withIdentity({ subject: `${memberId}|session` }).mutation(createInvite, {}),
  ).rejects.toThrow("Nur Admins können Einladungslinks erstellen.");
});
