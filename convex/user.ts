import { getAuthUserId } from "@convex-dev/auth/server";
import { requireCurrentUserId } from "./authorization";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
  args: {
    method: v.object({ name: v.literal("emailPassword"), profile: v.object({}) }),
  },
  returns: v.id("users"),
  handler: async (ctx) => await ctx.db.insert("users", {}),
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);

    return user === null
      ? null
      : {
          id: user._id,
          email: user.email ?? null,
          name: user.name ?? null,
          instrument: user.instrument ?? "",
        };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCurrentUserId(ctx, args.userId);

    const trimmed = args.name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error("Name darf nicht leer sein.");

    if ((args.instrument?.length ?? 0) > 100)
      throw new Error("Instrument darf höchstens 100 Zeichen lang sein.");
    await ctx.db.patch(args.userId, {
      name: trimmed,
      ...(args.instrument !== undefined ? { instrument: args.instrument.trim() } : {}),
    });
  },
});
