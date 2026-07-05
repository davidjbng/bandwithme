import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const myBand = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!membership) return null;

    const band = await ctx.db.get(membership.bandId);
    if (!band) return null;

    return {
      id: band._id,
      name: band.name,
      role: membership.role,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Du musst eingeloggt sein.");

    const existing = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("Du bist bereits in einer Band.");

    const bandId = await ctx.db.insert("bands", {
      name: args.name.trim(),
      createdBy: userId,
    });

    await ctx.db.insert("bandMembers", {
      bandId,
      userId,
      role: "admin",
    });

    return bandId;
  },
});

export const joinByInvite = mutation({
  args: {
    bandId: v.id("bands"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Du musst eingeloggt sein.");

    const band = await ctx.db.get(args.bandId);
    if (!band) throw new Error("Diese Band existiert nicht.");

    const existing = await ctx.db
      .query("bandMembers")
      .withIndex("by_bandId_and_userId", (q) => q.eq("bandId", args.bandId).eq("userId", userId))
      .first();
    if (existing) throw new Error("Du bist bereits Mitglied dieser Band.");

    // Remove from any existing band first
    const otherMembership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (otherMembership) {
      await ctx.db.delete(otherMembership._id);
    }

    await ctx.db.insert("bandMembers", {
      bandId: args.bandId,
      userId,
      role: "member",
    });

    return args.bandId;
  },
});

export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const myMembership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!myMembership) return [];

    const memberships = await ctx.db
      .query("bandMembers")
      .withIndex("by_bandId", (q) => q.eq("bandId", myMembership.bandId))
      .collect();

    return await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          id: m._id,
          userId: m.userId,
          name: user?.name ?? user?.email?.split("@")[0] ?? "Bandmitglied",
          email: user?.email ?? null,
          role: m.role,
        };
      }),
    );
  },
});

export const leave = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Du musst eingeloggt sein.");

    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!membership) throw new Error("Du bist in keiner Band.");

    // Check: if this user is the last admin, block
    if (membership.role === "admin") {
      const otherAdmins = await ctx.db
        .query("bandMembers")
        .withIndex("by_bandId", (q) => q.eq("bandId", membership.bandId))
        .filter((q) => q.and(q.eq(q.field("role"), "admin"), q.neq(q.field("userId"), userId)))
        .first();
      if (!otherAdmins) {
        throw new Error("Du bist der letzte Admin. Ernennne zuerst jemand anderen zum Admin.");
      }
    }

    await ctx.db.delete(membership._id);
  },
});

export const removeMember = mutation({
  args: {
    membershipId: v.id("bandMembers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Du musst eingeloggt sein.");

    const myMembership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!myMembership || myMembership.role !== "admin") {
      throw new Error("Nur Admins können Mitglieder entfernen.");
    }

    const target = await ctx.db.get(args.membershipId);
    if (!target) throw new Error("Mitglied nicht gefunden.");
    if (target.bandId !== myMembership.bandId) {
      throw new Error("Dieses Mitglied ist nicht in deiner Band.");
    }

    // Cannot remove yourself
    if (target.userId === userId) {
      throw new Error('Nutze "Band verlassen" um dich selbst zu entfernen.');
    }

    // Last admin check
    if (target.role === "admin") {
      const otherAdmins = await ctx.db
        .query("bandMembers")
        .withIndex("by_bandId", (q) => q.eq("bandId", target.bandId))
        .filter((q) =>
          q.and(q.eq(q.field("role"), "admin"), q.neq(q.field("userId"), target.userId)),
        )
        .first();
      if (!otherAdmins) {
        throw new Error("Der letzte Admin kann nicht entfernt werden.");
      }
    }

    await ctx.db.delete(args.membershipId);
  },
});

export const deleteBand = mutation({
  args: {
    nameConfirmation: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Du musst eingeloggt sein.");

    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!membership || membership.role !== "admin") {
      throw new Error("Nur Admins können die Band löschen.");
    }

    const band = await ctx.db.get(membership.bandId);
    if (!band) throw new Error("Band nicht gefunden.");

    if (band.name !== args.nameConfirmation.trim()) {
      throw new Error("Der eingegebene Name stimmt nicht mit dem Bandnamen überein.");
    }

    // Delete all memberships
    const memberships = await ctx.db
      .query("bandMembers")
      .withIndex("by_bandId", (q) => q.eq("bandId", band._id))
      .collect();
    await Promise.all(memberships.map((m) => ctx.db.delete(m._id)));

    // Delete band
    await ctx.db.delete(band._id);
  },
});
