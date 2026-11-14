import { setupConvexAuth } from "@convex-dev/auth/server";
import { setupEmailPassword } from "@convex-dev/auth/methods/email-password/server";
import { components, internal } from "./_generated/api";

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
