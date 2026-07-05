import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const myBand = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const membership = await ctx.db
      .query('bandMembers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
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
    if (userId === null) throw new Error('Du musst eingeloggt sein.');

    const existing = await ctx.db
      .query('bandMembers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (existing) throw new Error('Du bist bereits in einer Band.');

    const bandId = await ctx.db.insert('bands', {
      name: args.name.trim(),
      createdBy: userId,
    });

    await ctx.db.insert('bandMembers', {
      bandId,
      userId,
      role: 'admin',
    });

    return bandId;
  },
});

export const joinByInvite = mutation({
  args: {
    bandId: v.id('bands'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error('Du musst eingeloggt sein.');

    const band = await ctx.db.get(args.bandId);
    if (!band) throw new Error('Diese Band existiert nicht.');

    const existing = await ctx.db
      .query('bandMembers')
      .withIndex('by_bandId_and_userId', (q) =>
        q.eq('bandId', args.bandId).eq('userId', userId),
      )
      .first();
    if (existing) throw new Error('Du bist bereits Mitglied dieser Band.');

    // Remove from any existing band first
    const otherMembership = await ctx.db
      .query('bandMembers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (otherMembership) {
      await ctx.db.delete(otherMembership._id);
    }

    await ctx.db.insert('bandMembers', {
      bandId: args.bandId,
      userId,
      role: 'member',
    });

    return bandId;
  },
});