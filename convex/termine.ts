import { v } from "convex/values";
import { requireCurrentUserId } from "./authorization";
import { mutation, query } from "./_generated/server";

const eventKind = v.union(v.literal("rehearsal"), v.literal("performance"));
const repeat = v.union(
  v.literal("none"),
  v.literal("weekly"),
  v.literal("biweekly"),
  v.literal("monthly"),
);
const rsvpStatus = v.union(v.literal("yes"), v.literal("maybe"), v.literal("no"));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email?.trim().toLowerCase();
    if (!email) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    if (!user) return [];

    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!membership) return [];

    const allEvents = await ctx.db
      .query("events")
      .withIndex("by_bandId_and_dateTime", (q) => q.eq("bandId", membership.bandId))
      .collect();
    const upcomingEvents = allEvents.filter((event) => event.dateTime >= new Date().toISOString());
    const cachedUsers = new Map();

    return await Promise.all(
      upcomingEvents.map(async (event) => {
        const responses = await ctx.db
          .query("eventResponses")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        const participants = {
          yes: [] as { id: string; name: string; email: string | null }[],
          maybe: [] as { id: string; name: string; email: string | null }[],
          no: [] as { id: string; name: string; email: string | null }[],
        };

        let viewerResponse: "yes" | "maybe" | "no" | null = null;

        for (const response of responses) {
          let responseUser = cachedUsers.get(response.userId);
          if (!responseUser) {
            responseUser = await ctx.db.get(response.userId);
            cachedUsers.set(response.userId, responseUser);
          }

          const fallbackName = responseUser?.email?.split("@")[0] ?? "Bandmitglied";
          const participant = {
            id: response.userId,
            name: responseUser?.name ?? fallbackName,
            email: responseUser?.email ?? null,
          };

          participants[response.status].push(participant);

          if (response.userId === user._id) {
            viewerResponse = response.status;
          }
        }

        return {
          id: event._id,
          kind: event.kind,
          name: event.name,
          dateTime: event.dateTime,
          location: event.location,
          repeat: event.repeat,
          viewerResponse,
          responseCounts: {
            yes: participants.yes.length,
            maybe: participants.maybe.length,
            no: participants.no.length,
          },
          participants,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    kind: eventKind,
    name: v.string(),
    dateTime: v.string(),
    location: v.string(),
    repeat,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUserId(ctx, args.userId);
    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!membership) {
      throw new Error("Du musst Mitglied einer Band sein, um einen Termin zu erstellen.");
    }

    const normalizedRepeat = args.kind === "performance" ? "none" : args.repeat;

    return await ctx.db.insert("events", {
      kind: args.kind,
      name: args.name.trim(),
      dateTime: args.dateTime,
      location: args.location.trim(),
      repeat: normalizedRepeat,
      createdBy: user._id,
      bandId: membership.bandId,
    });
  },
});

export const setResponse = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
    status: rsvpStatus,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUserId(ctx, args.userId);
    const membership = await ctx.db
      .query("bandMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!membership) {
      throw new Error("Du musst Mitglied einer Band sein, um zuzusagen.");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event || event.bandId !== membership.bandId) {
      throw new Error("Dieser Termin existiert nicht oder gehört nicht zu deiner Band.");
    }

    const existingResponse = await ctx.db
      .query("eventResponses")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id),
      )
      .unique();

    const respondedAt = new Date().toISOString();

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        status: args.status,
        respondedAt,
      });
      return existingResponse._id;
    }

    return await ctx.db.insert("eventResponses", {
      eventId: args.eventId,
      userId: user._id,
      status: args.status,
      respondedAt,
    });
  },
});
