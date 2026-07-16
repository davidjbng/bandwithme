import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { requireCurrentUser, requireCurrentUserId } from "./authorization";
import { mutation, query } from "./_generated/server";

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
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireCurrentUserId(ctx, args.userId);

    const existing = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) throw new Error("Du bist bereits in einer Band.");

    const bandId = await ctx.db.insert("bands", {
      name: args.name.trim(),
      createdBy: args.userId,
    });

    await ctx.db.insert("bandMembers", {
      bandId,
      userId: args.userId,
      role: "admin",
    });

    return bandId;
  },
});

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const createInvite = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Nur Admins können Einladungslinks erstellen.");
    }

    const token = createToken();
    await ctx.db.insert("bandInvites", {
      bandId: membership.bandId,
      createdBy: user._id,
      token,
    });

    return { token };
  },
});

export const previewInvite = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("bandInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite) return null;

    const band = await ctx.db.get(invite.bandId);
    return band ? { bandName: band.name } : null;
  },
});

export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const invite = await ctx.db
      .query("bandInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite || !(await ctx.db.get(invite.bandId))) {
      throw new Error("Dieser Einladungslink ist ungültig.");
    }

    const existing = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (existing) {
      throw new Error("Du bist bereits in einer Band.");
    }

    await ctx.db.insert("bandMembers", {
      bandId: invite.bandId,
      userId: user._id,
      role: "member",
    });

    return { bandId: invite.bandId };
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
        const member = await ctx.db.get(m.userId);
        return {
          id: m._id,
          userId: m.userId,
          name: member?.name ?? member?.email?.split("@")[0] ?? "Bandmitglied",
          email: member?.email ?? null,
          role: m.role,
        };
      }),
    );
  },
});

export const leave = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCurrentUserId(ctx, args.userId);

    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!membership) throw new Error("Du bist in keiner Band.");

    if (membership.role === "admin") {
      const otherAdmins = await ctx.db
        .query("bandMembers")
        .withIndex("by_bandId", (q) => q.eq("bandId", membership.bandId))
        .filter((q) => q.and(q.eq(q.field("role"), "admin"), q.neq(q.field("userId"), args.userId)))
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
    userId: v.id("users"),
    membershipId: v.id("bandMembers"),
  },
  handler: async (ctx, args) => {
    await requireCurrentUserId(ctx, args.userId);

    const myMembership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!myMembership || myMembership.role !== "admin") {
      throw new Error("Nur Admins können Mitglieder entfernen.");
    }

    const target = await ctx.db.get(args.membershipId);
    if (!target) throw new Error("Mitglied nicht gefunden.");
    if (target.bandId !== myMembership.bandId) {
      throw new Error("Dieses Mitglied ist nicht in deiner Band.");
    }

    if (target.userId === args.userId) {
      throw new Error('Nutze "Band verlassen" um dich selbst zu entfernen.');
    }

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
    userId: v.id("users"),
    nameConfirmation: v.string(),
  },
  handler: async (ctx, args) => {
    await requireCurrentUserId(ctx, args.userId);

    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!membership || membership.role !== "admin") {
      throw new Error("Nur Admins können die Band löschen.");
    }

    const band = await ctx.db.get(membership.bandId);
    if (!band) throw new Error("Band nicht gefunden.");

    if (band.name !== args.nameConfirmation.trim()) {
      throw new Error("Der eingegebene Name stimmt nicht mit dem Bandnamen überein.");
    }

    const memberships = await ctx.db
      .query("bandMembers")
      .withIndex("by_bandId", (q) => q.eq("bandId", band._id))
      .collect();
    await Promise.all(memberships.map((m) => ctx.db.delete(m._id)));

    await ctx.db.delete(band._id);
  },
});
