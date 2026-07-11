import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

function getSiteUrl() {
  return process.env.SITE_URL?.replace(/\/$/, "") ?? "https://bandwithme.de";
}

function redirectUrl(redirectTo: string) {
  const siteUrl = getSiteUrl();

  if (redirectTo.startsWith("?") || redirectTo.startsWith("/")) {
    return `${siteUrl}${redirectTo}`;
  }
  if (redirectTo.startsWith(siteUrl)) {
    return redirectTo;
  }
  if (redirectTo.startsWith("bandwithme://")) {
    return redirectTo;
  }

  throw new Error("Invalid sign-in redirect URL.");
}

const AhaSend = Email({
  id: "ahasend",
  apiKey: process.env.AHASEND_API_KEY!,
  async sendVerificationRequest({ identifier, provider, url }) {
    const apiKey = provider.apiKey;

    if (!apiKey) {
      console.log(
        `Magic link for ${identifier}: ${url}. Set AHASEND_API_KEY in Convex to send email.`,
      );
      return;
    }

    if (apiKey === "dev" || apiKey === "local") {
      console.log(
        `Magic link for ${identifier}: ${url}. AHASEND_API_KEY is set to local log mode.`,
      );
      return;
    }

    console.log(`Sending magic link to ${identifier} with AhaSend.`);

    const res = await fetch(
      "https://api.ahasend.com/v2/accounts/8979e7cc-daa5-484e-97c6-cb096ff295b9/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: { email: "auth@bandwithme.de", name: "Band With Me" },
          recipients: [{ email: identifier }],
          subject: "Sign in to Band With Me",
          text_content: `Sign in to Band With Me: ${url}`,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AhaSend error ${res.status}: ${body}`);
    }
  },
});

const isDevelopmentAuthEnabled = process.env.DEVELOPMENT_AUTH_ENABLED === "true";

const DevelopmentAuth = Anonymous({
  id: "development",
  profile: (params) => ({
    email: typeof params.email === "string" ? params.email : "dev@bandwithme.local",
    isAnonymous: true,
    name: typeof params.name === "string" ? params.name : "Entwicklungstest",
  }),
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: isDevelopmentAuthEnabled ? [AhaSend, DevelopmentAuth] : [AhaSend],
  callbacks: {
    async redirect({ redirectTo }) {
      return redirectUrl(redirectTo);
    },
  },
});
