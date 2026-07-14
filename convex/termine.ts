import { v } from "convex/values";
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
    if (!identity) return [];

    const allEvents = await ctx.db.query("events").withIndex("by_dateTime").collect();
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
          let user = cachedUsers.get(response.userId);
          if (!user) {
            user = await ctx.db.get(response.userId);
            cachedUsers.set(response.userId, user);
          }

          const fallbackName = user?.email?.split("@")[0] ?? "Bandmitglied";
          const participant = {
            id: response.userId,
            name: user?.name ?? fallbackName,
            email: user?.email ?? null,
          };

          participants[response.status].push(participant);

          if (identity && user?.email === identity.email) {
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
    const normalizedRepeat = args.kind === "performance" ? "none" : args.repeat;

    return await ctx.db.insert("events", {
      kind: args.kind,
      name: args.name.trim(),
      dateTime: args.dateTime,
      location: args.location.trim(),
      repeat: normalizedRepeat,
      createdBy: args.userId,
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
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Dieser Termin existiert nicht mehr.");
    }

    const existingResponse = await ctx.db
      .query("eventResponses")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId),
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
      userId: args.userId,
      status: args.status,
      respondedAt,
    });
  },
});
