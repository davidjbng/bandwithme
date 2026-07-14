import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function requireCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const email = identity?.email?.trim().toLowerCase();

  if (!email) {
    throw new Error("Du musst eingeloggt sein.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("email", (query) => query.eq("email", email))
    .unique();

  if (!user) {
    throw new Error("Dein Benutzerkonto wurde nicht gefunden.");
  }

  return user;
}

export async function requireCurrentUserId(ctx: MutationCtx, userId: Id<"users">) {
  const user = await requireCurrentUser(ctx);

  if (user._id !== userId) {
    throw new Error("Du darfst keine Aktionen für andere Benutzer ausführen.");
  }

  return user;
}
