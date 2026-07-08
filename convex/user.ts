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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Nicht eingeloggt.");

    // Find user by email
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.email === identity.email);

    if (!user) throw new Error("Benutzer nicht gefunden.");

    const trimmed = args.name.trim();
    if (!trimmed) throw new Error("Name darf nicht leer sein.");

    await ctx.db.patch(user._id, { name: trimmed });
  },
});
