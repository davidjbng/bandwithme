import { getAuthUserId } from "@convex-dev/auth/server";
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
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Nicht eingeloggt.");

    const trimmed = args.name.trim();
    if (!trimmed) throw new Error("Name darf nicht leer sein.");

    await ctx.db.patch(userId, { name: trimmed });
  },
});
