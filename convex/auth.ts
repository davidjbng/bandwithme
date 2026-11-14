import { setupConvexAuth } from "@convex-dev/auth/server";
import { setupEmailPassword } from "@convex-dev/auth/methods/email-password/server";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import type { SignInResult } from "@convex-dev/auth/methods/email-password/server";
import { mutation } from "./_generated/server";
import { api, components, internal } from "./_generated/api";

const siteUrl = (process.env.SITE_URL ?? "https://bandwithme.de").replace(/\/$/, "");
const auth = setupConvexAuth({ component: components.auth });
export const { signOut, refreshSession, isAuthenticated } = auth;

export const {
  signUpWithEmailPassword,
  completeSignUpWithEmailPassword,
  signInWithEmailPassword,
  startPasswordRecovery,
  checkPasswordRecovery,
  completePasswordRecovery,
} = setupEmailPassword(auth, {
  component: components.authEmail,
  passwordComponent: components.authPassword,
  emailSender: {
    kind: "resend",
    sendEmail: components.resend.lib.sendEmail,
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: "Band With Me <auth@bandwithme.de>",
  },
  urls: {
    signUp: `${siteUrl}/validate-email`,
    changeEmail: `${siteUrl}/user`,
    recovery: `${siteUrl}/reset-password`,
  },
}).attachUserCallbacks({ createUser: internal.user.createUser });

const loginLimiter = new RateLimiter(components.rateLimiter, {
  loginLookup: { kind: "token bucket", rate: 60, period: HOUR, capacity: 60 },
});

// Resolve aliases server-side; Auth 2 still verifies the email, password and session.
export const signInWithIdentifier = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<SignInResult> => {
    const { ip } = await ctx.meta.getRequestMetadata();
    if (!ip) throw new Error("Client IP required for sign-in.");
    const limit = await loginLimiter.limit(ctx, "loginLookup", { key: ip });
    if (!limit.ok)
      return {
        status: "error",
        userError: { error: "RATE_LIMITED", retryAfterMs: limit.retryAfter },
      };
    const identifier = args.email.trim();
    let email: string | null = identifier.includes("@") ? identifier.toLowerCase() : null;
    if (!email) {
      const userId = await ctx.runQuery(components.authUsername.public.getUserIdByUsername, {
        username: identifier,
      });
      if (userId)
        email = await ctx.runQuery(components.authEmail.verifiedEmails.getPrimaryEmail, { userId });
    }
    if (!email) return { status: "error", userError: { error: "INVALID_CREDENTIALS" } };
    const result = await ctx.runMutation(api.auth.signInWithEmailPassword, {
      email,
      password: args.password,
    });
    if (result.status === "error" && result.userError.error === "USER_NOT_FOUND")
      return { status: "error", userError: { error: "INVALID_CREDENTIALS" } };
    return result;
  },
});
