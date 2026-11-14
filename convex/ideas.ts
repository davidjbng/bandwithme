import { getAuthUserId } from "@convex-dev/auth/server";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./authorization";
import { components } from "./_generated/api";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  submitIdea: { kind: "token bucket", rate: 5, period: HOUR, capacity: 5 },
});

export const submit = mutation({
  args: { text: v.string(), requestId: v.string() },
  returns: v.id("ideas"),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const text = args.text.trim();
    if (text.length < 10 || text.length > 4000) {
      throw new ConvexError("Bitte beschreibe deine Idee mit 10 bis 4.000 Zeichen.");
    }
    if (!args.requestId || args.requestId.length > 100) {
      throw new ConvexError("Ungültige Anfrage. Bitte öffne das Formular erneut.");
    }
    const existing = await ctx.db
      .query("ideas")
      .withIndex("by_userId_and_requestId", (q) =>
        q.eq("userId", user._id).eq("requestId", args.requestId),
      )
      .unique();
    if (existing) {
      if (existing.text !== text) throw new ConvexError("Diese Anfrage wurde bereits gespeichert.");
      return existing._id;
    }
    const limit = await rateLimiter.limit(ctx, "submitIdea", { key: user._id });
    if (!limit.ok) {
      const minutes = Math.max(1, Math.ceil(limit.retryAfter / 60_000));
      throw new ConvexError(
        `Danke für deine Ideen! Bitte versuche es in ${minutes} ${minutes === 1 ? "Minute" : "Minuten"} erneut.`,
      );
    }
    return await ctx.db.insert("ideas", { userId: user._id, text, requestId: args.requestId });
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("ideas")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});
