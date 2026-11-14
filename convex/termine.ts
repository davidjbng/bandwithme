import { ConvexError, v } from "convex/values";
import { requireCurrentUserId } from "./authorization";
import { bounded, findMembership } from "./bandAccess";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const eventKind = v.union(v.literal("rehearsal"), v.literal("performance"));
const repeat = v.union(
  v.literal("none"),
  v.literal("weekly"),
  v.literal("biweekly"),
  v.literal("monthly"),
);
const rsvpStatus = v.union(v.literal("yes"), v.literal("maybe"), v.literal("no"));

async function eventMembers(ctx: QueryCtx, bandId: Id<"bands">) {
  const memberships = bounded(
    await ctx.db
      .query("bandMembers")
      .withIndex("by_bandId", (q) => q.eq("bandId", bandId))
      .take(201),
    200,
    "Mitglieder",
  );
  return Promise.all(
    memberships.map(async (member) => ({
      id: member.userId,
      name: (await ctx.db.get(member.userId))?.name ?? "Bandmitglied",
    })),
  );
}
async function eventDetails(
  ctx: QueryCtx,
  event: Doc<"events">,
  viewerId: string,
  members: Awaited<ReturnType<typeof eventMembers>>,
) {
  const responses = bounded(
    await ctx.db
      .query("eventResponses")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .take(501),
    500,
    "Antworten",
  );
  const participants: Record<"yes" | "no" | "open", { id: string; name: string }[]> = {
    yes: [],
    no: [],
    open: [],
  };
  let viewerResponse: "yes" | "no" | null = null;
  for (const member of members) {
    const response = responses.find((item) => item.userId === member.id)?.status;
    const status = response === "yes" || response === "no" ? response : "open";
    participants[status].push(member);
    if (member.id === viewerId && status !== "open") viewerResponse = status;
  }
  return {
    id: event._id,
    kind: event.kind,
    name: event.name,
    dateTime: event.dateTime,
    location: event.location,
    repeat: event.repeat,
    note: event.note ?? "",
    viewerResponse,
    responseCounts: {
      yes: participants.yes.length,
      no: participants.no.length,
      open: participants.open.length,
    },
    participants,
  };
}

export const list = query({
  args: { from: v.optional(v.string()) },
  handler: async (ctx, { from }) => {
    const membership = await findMembership(ctx);
    if (!membership) return [];
    const events = await ctx.db
      .query("events")
      .withIndex("by_bandId_and_dateTime", (q) =>
        q.eq("bandId", membership.bandId).gte("dateTime", from ?? ""),
      )
      .take(201);
    const members = await eventMembers(ctx, membership.bandId);
    return Promise.all(
      bounded(events, 200, "Termine").map((event) =>
        eventDetails(ctx, event, membership.userId, members),
      ),
    );
  },
});

export const detail = query({
  args: { eventId: v.string() },
  handler: async (ctx, { eventId }) => {
    const membership = await findMembership(ctx);
    if (!membership) return null;
    const id = ctx.db.normalizeId("events", eventId);
    const event = id ? await ctx.db.get(id) : null;
    if (!event || event.bandId !== membership.bandId) return null;
    return eventDetails(ctx, event, membership.userId, await eventMembers(ctx, membership.bandId));
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    kind: eventKind,
    name: v.string(),
    dateTime: v.string(),
    location: v.string(),
    note: v.optional(v.string()),
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

    if (
      !args.name.trim() ||
      args.name.trim().length > 160 ||
      !args.location.trim() ||
      args.location.trim().length > 300 ||
      (args.note?.length ?? 0) > 4000
    ) {
      throw new ConvexError(
        "Bitte prüfe Name (max. 160), Ort (max. 300) und Notiz (max. 4000 Zeichen).",
      );
    }
    if (!Number.isFinite(Date.parse(args.dateTime)))
      throw new ConvexError("Bitte wähle ein gültiges Datum.");
    const existing = await ctx.db
      .query("events")
      .withIndex("by_bandId_and_dateTime", (q) => q.eq("bandId", membership.bandId))
      .take(200);
    if (existing.length >= 200)
      throw new ConvexError(
        "Eure Band hat die Grenze von 200 Terminen erreicht. Bitte kontaktiere den Support.",
      );
    const normalizedRepeat = args.kind === "performance" ? "none" : args.repeat;

    return await ctx.db.insert("events", {
      kind: args.kind,
      name: args.name.trim(),
      dateTime: new Date(args.dateTime).toISOString(),
      location: args.location.trim(),
      note: args.note?.trim(),
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
    status: v.union(rsvpStatus, v.literal("open")),
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

    if (args.status === "open") {
      if (existingResponse) await ctx.db.delete(existingResponse._id);
      return null;
    }
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
