import { getAuthUserId } from "@convex-dev/auth/server";
import { requireCurrentUser, requireCurrentUserId } from "./authorization";
import { internalMutation, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { ConvexError, v } from "convex/values";

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
          email: await ctx.runQuery(components.authEmail.verifiedEmails.getPrimaryEmail, {
            userId,
          }),
          username: await ctx.runQuery(components.authUsername.public.getUsername, { userId }),
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

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await requireCurrentUser(ctx);
    const email = await ctx.runQuery(components.authEmail.verifiedEmails.getPrimaryEmail, {
      userId: user._id,
    });
    if (!email) throw new ConvexError("Bitte bestätige zuerst deine E-Mail-Adresse.");
    const value = username.trim();
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(value))
      throw new ConvexError(
        "Nutze 3–30 Zeichen: Buchstaben a–z, Zahlen, Punkt, Bindestrich oder Unterstrich.",
      );
    const result = await ctx.runMutation(components.authUsername.public.setUsername, {
      userId: user._id,
      username: value,
    });
    if (!result.success)
      throw new ConvexError(
        result.userError.error === "USERNAME_TAKEN"
          ? "Dieser Benutzername ist schon vergeben. Wähle bitte einen anderen."
          : "Dieser Benutzername ist ungültig.",
      );
  },
});
