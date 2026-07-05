import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

function redirectUrl(redirectTo: string) {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");

  if (siteUrl) {
    if (redirectTo.startsWith("?") || redirectTo.startsWith("/")) {
      return `${siteUrl}${redirectTo}`;
    }
    if (redirectTo.startsWith(siteUrl)) {
      return redirectTo;
    }
  }

  if (redirectTo.startsWith("/")) {
    return `bandwithme://${redirectTo.slice(1)}`;
  }
  if (redirectTo.startsWith("?")) {
    return `bandwithme://user${redirectTo}`;
  }
  if (redirectTo.startsWith("bandwithme://")) {
    return redirectTo;
  }

  throw new Error("Invalid sign-in redirect URL.");
}

function resendApiKey() {
  return process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY;
}

const Resend = Email({
  id: "resend",
  apiKey: resendApiKey(),
  async sendVerificationRequest({ identifier, provider, url }) {
    const apiKey = provider.apiKey;

    if (!apiKey) {
      console.log(
        `Magic link for ${identifier}: ${url}. Set AUTH_RESEND_KEY or RESEND_API_KEY in Convex to send email.`,
      );
      return;
    }

    if (apiKey === "dev" || apiKey === "local") {
      console.log(
        `Magic link for ${identifier}: ${url}. AUTH_RESEND_KEY is set to local log mode.`,
      );
      return;
    }

    console.log(`Sending magic link to ${identifier} with Resend.`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Band With Me <onboarding@resend.dev>",
        to: identifier,
        subject: "Sign in to Band With Me",
        text: `Sign in to Band With Me: ${url}`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Resend],
  callbacks: {
    async redirect({ redirectTo }) {
      return redirectUrl(redirectTo);
    },
  },
});
