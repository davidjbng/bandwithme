import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { bounded, findMembership, requireMembership } from "./bandAccess";

async function bandSong(ctx: QueryCtx | MutationCtx, songId: Id<"songs">) {
  const membership = await requireMembership(ctx);
  const song = await ctx.db.get(songId);
  if (!song || song.bandId !== membership.bandId) throw new ConvexError("Song nicht gefunden.");
  return { song, membership };
}
async function performance(ctx: QueryCtx | MutationCtx, eventId: Id<"events">) {
  const membership = await requireMembership(ctx);
  const event = await ctx.db.get(eventId);
  if (!event || event.bandId !== membership.bandId || event.kind !== "performance") {
    throw new ConvexError("Auftritt nicht gefunden.");
  }
  return event;
}
async function entries(ctx: QueryCtx | MutationCtx, eventId: Id<"events">) {
  return bounded(
    await ctx.db
      .query("setlistEntries")
      .withIndex("by_eventId_and_position", (q) => q.eq("eventId", eventId))
      .take(201),
    200,
    "Setlist",
  );
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const membership = await findMembership(ctx);
    if (!membership) return [];
    const songs = bounded(
      await ctx.db
        .query("songs")
        .withIndex("by_bandId", (q) => q.eq("bandId", membership.bandId))
        .take(501),
      500,
      "Songs",
    );
    const members = bounded(
      await ctx.db
        .query("bandMembers")
        .withIndex("by_bandId", (q) => q.eq("bandId", membership.bandId))
        .take(201),
      200,
      "Mitglieder",
    );
    const memberIds = new Set(members.map((member) => member.userId));
    // Every vote belongs to one of at most 500 band songs; count only current members.
    const votes = bounded(
      await ctx.db
        .query("songVotes")
        .withIndex("by_bandId", (q) => q.eq("bandId", membership.bandId))
        .take(5001),
      5000,
      "Stimmen",
    );
    return songs.map((song) => {
      const currentVotes = votes.filter(
        (vote) => vote.songId === song._id && memberIds.has(vote.userId),
      );
      return Object.assign(song, {
        votes: currentVotes.length,
        voted: currentVotes.some((vote) => vote.userId === membership.userId),
      });
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    duration: v.number(),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await requireMembership(ctx);
    const title = args.title.trim();
    const artist = args.artist.trim();
    if (!title || title.length > 160 || !artist || artist.length > 160)
      throw new ConvexError("Titel und Artist brauchen jeweils 1–160 Zeichen.");
    if (!Number.isInteger(args.duration) || args.duration < 1 || args.duration > 7200)
      throw new ConvexError("Die Länge muss zwischen 0:01 und 120:00 liegen.");
    const reference = args.reference?.trim() || undefined;
    if (reference) {
      let valid = false;
      try {
        const url = new URL(reference);
        valid = ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        /* Invalid URL is reported below. */
      }
      if (!valid || reference.length > 2048)
        throw new ConvexError("Bitte verwende einen gültigen HTTP(S)-Link ohne Zugangsdaten.");
    }
    const existing = await ctx.db
      .query("songs")
      .withIndex("by_bandId", (q) => q.eq("bandId", member.bandId))
      .take(500);
    if (existing.length >= 500) throw new ConvexError("Eure Band hat bereits 500 Songs.");
    return ctx.db.insert("songs", {
      title,
      artist,
      duration: args.duration,
      reference,
      bandId: member.bandId,
      createdBy: member.userId,
      archived: false,
    });
  },
});

export const setVote = mutation({
  args: { songId: v.id("songs"), voted: v.boolean() },
  handler: async (ctx, { songId, voted }) => {
    const { song, membership } = await bandSong(ctx, songId);
    if (song.archived)
      throw new ConvexError("Dieser Song liegt im Archiv. Hole ihn zuerst zurück ins Voting.");
    const existing = await ctx.db
      .query("songVotes")
      .withIndex("by_songId_and_userId", (q) =>
        q.eq("songId", songId).eq("userId", membership.userId),
      )
      .unique();
    if (voted && !existing) {
      const votes = await ctx.db
        .query("songVotes")
        .withIndex("by_bandId", (q) => q.eq("bandId", membership.bandId))
        .take(5000);
      if (votes.length >= 5000)
        throw new ConvexError("Eure Band hat die Grenze von 5000 Stimmen erreicht.");
      await ctx.db.insert("songVotes", {
        songId,
        userId: membership.userId,
        bandId: membership.bandId,
      });
    }
    if (!voted && existing) await ctx.db.delete(existing._id);
  },
});
export const archive = mutation({
  args: { songId: v.id("songs"), archived: v.boolean() },
  handler: async (ctx, { songId, archived }) => {
    await bandSong(ctx, songId);
    await ctx.db.patch(songId, { archived });
  },
});
export const setlist = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    await performance(ctx, eventId);
    return Promise.all(
      (await entries(ctx, eventId)).map(async (entry) => {
        const { song } = await bandSong(ctx, entry.songId);
        return song;
      }),
    );
  },
});
export const addToSetlist = mutation({
  args: { eventId: v.id("events"), songId: v.id("songs") },
  handler: async (ctx, { eventId, songId }) => {
    await performance(ctx, eventId);
    await bandSong(ctx, songId);
    const ordered = await entries(ctx, eventId);
    if (ordered.some((entry) => entry.songId === songId)) return;
    if (ordered.length >= 200)
      throw new ConvexError("In diese Setlist passen höchstens 200 Songs.");
    await ctx.db.insert("setlistEntries", {
      eventId,
      songId,
      position: (ordered.at(-1)?.position ?? -1) + 1,
    });
    await ctx.db.patch(songId, { archived: true });
  },
});
export const move = mutation({
  args: {
    eventId: v.id("events"),
    songId: v.id("songs"),
    direction: v.union(v.literal(-1), v.literal(1)),
  },
  handler: async (ctx, { eventId, songId, direction }) => {
    await performance(ctx, eventId);
    const ordered = await entries(ctx, eventId);
    const index = ordered.findIndex((entry) => entry.songId === songId);
    if (index === -1) throw new ConvexError("Der Song ist nicht mehr in dieser Setlist.");
    const neighbor = ordered[index + direction];
    if (!neighbor) return;
    await ctx.db.patch(ordered[index]._id, { position: neighbor.position });
    await ctx.db.patch(neighbor._id, { position: ordered[index].position });
  },
});
export const removeFromSetlist = mutation({
  args: { eventId: v.id("events"), songId: v.id("songs") },
  handler: async (ctx, { eventId, songId }) => {
    await performance(ctx, eventId);
    const entry = (await entries(ctx, eventId)).find((item) => item.songId === songId);
    if (entry) await ctx.db.delete(entry._id);
  },
});
