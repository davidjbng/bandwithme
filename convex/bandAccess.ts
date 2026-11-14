import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function findMembership(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId || !(await ctx.db.get(userId))) return null;
  const membership = await ctx.db
    .query("bandMembers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!membership || !(await ctx.db.get(membership.bandId))) return null;
  return membership;
}

export async function requireMembership(ctx: QueryCtx | MutationCtx) {
  const membership = await findMembership(ctx);
  if (!membership) throw new ConvexError("Du musst Mitglied einer Band sein.");
  return membership;
}

export function bounded<T>(rows: T[], limit: number, label: string) {
  if (rows.length > limit)
    throw new ConvexError(
      `${label}: Die Grenze von ${limit} ist erreicht. Bitte kontaktiere den Support.`,
    );
  return rows;
}
