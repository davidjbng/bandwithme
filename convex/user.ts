import { getAuthUserId } from "@convex-dev/auth/server";
import { requireCurrentUserId } from "./authorization";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
        };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireCurrentUserId(ctx, args.userId);

    const trimmed = args.name.trim();
    if (!trimmed) throw new Error("Name darf nicht leer sein.");

    await ctx.db.patch(args.userId, { name: trimmed });
  },
});
