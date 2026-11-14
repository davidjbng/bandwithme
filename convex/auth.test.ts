import { registerPassword } from "@convex-dev/auth/components/password/test";
import {
  registerEmail,
  registerResendStub,
  sentEmails,
} from "@convex-dev/auth/components/email/test";
import { sessionIdentity } from "@convex-dev/auth/test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import { backendTest } from "../test/backend";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("SITE_URL", "https://bandwithme.de");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

function authTest() {
  const t = backendTest();
  registerPassword(t);
  registerEmail(t);
  registerResendStub(t);
  return t;
}

async function signUp(t: ReturnType<typeof authTest>) {
  const credentials = { email: "member@example.com", password: "Trompete!und-Bass-2026" };
  const result = await t
    .withRequestMetadata({ ip: "127.0.0.1" })
    .mutation(api.auth.signUpWithEmailPassword, credentials);
  if (!result.success) throw new Error(result.userError.error);
  await vi.advanceTimersByTimeAsync(100);
  await t.finishInProgressScheduledFunctions();
  const emails = await sentEmails(t);
  const url = emails[0]?.text?.match(/https:\/\/bandwithme\.de\/validate-email\?[^\s]+/)?.[0];
  if (!url) throw new Error("Verification email missing");
  const code = new URL(url).searchParams.get("code");
  if (!code) throw new Error("Verification code missing");
  return { credentials, browserSecret: result.browserSecret, emailCode: code };
}

test("email must be verified with the requesting client's secret before a session is issued", async () => {
  const t = authTest();
  const signup = await signUp(t);
  const premature = await t
    .withRequestMetadata({ ip: "127.0.0.1" })
    .mutation(api.auth.signInWithEmailPassword, signup.credentials);
  expect(premature.status).toBe("error");
  const stolen = await t
    .withRequestMetadata({ ip: "127.0.0.1" })
    .mutation(api.auth.completeSignUpWithEmailPassword, {
      emailCode: signup.emailCode,
      browserSecret: "wrong-secret",
    });
  expect(stolen.status).toBe("error");
  const completed = await t
    .withRequestMetadata({ ip: "127.0.0.1" })
    .mutation(api.auth.completeSignUpWithEmailPassword, {
      emailCode: signup.emailCode,
      browserSecret: signup.browserSecret,
    });
  if (completed.status !== "complete") throw new Error("Verification failed");
  const session = t.withIdentity(sessionIdentity(completed.tokens));
  const user = await session.query(api.user.current, {});
  expect(user).not.toBeNull();
  await session.mutation(api.user.updateProfile, { userId: user!.id, name: "Testmitglied" });
  const band = await session.mutation(api.bands.create, { userId: user!.id, name: "Testband" });
  expect((await session.query(api.bands.myBand, {}))?.id).toBe(band);
  await session.mutation(api.ideas.submit, {
    text: "Mehr Platz für unsere Setlists",
    requestId: "auth-test",
  });
  await t
    .withRequestMetadata({ ip: "127.0.0.1" })
    .mutation(api.auth.signOut, { refreshToken: completed.tokens.refreshToken });
  expect(await session.query(api.user.current, {})).toBeNull();
  await expect(
    session.mutation(api.ideas.submit, {
      text: "Alte Sitzung soll scheitern",
      requestId: "revoked",
    }),
  ).rejects.toThrow();
});

test("new accounts reject weak passwords and old v1 session identities", async () => {
  const t = authTest();
  expect(
    await t.withRequestMetadata({ ip: "127.0.0.1" }).mutation(api.auth.signUpWithEmailPassword, {
      email: "member@example.com",
      password: "short",
    }),
  ).toMatchObject({ success: false });
  const user = await t.run((ctx) => ctx.db.insert("users", {}));
  expect(
    await t.withIdentity({ subject: `${user}|old-session` }).query(api.user.current, {}),
  ).toBeNull();
});

test("password recovery requires the requesting client's secret and revokes old sessions", async () => {
  const t = authTest();
  const signup = await signUp(t);
  const client = t.withRequestMetadata({ ip: "127.0.0.1" });
  const verified = await client.mutation(api.auth.completeSignUpWithEmailPassword, {
    emailCode: signup.emailCode,
    browserSecret: signup.browserSecret,
  });
  if (verified.status !== "complete") throw new Error("Verification failed");
  const originalSession = t.withIdentity(sessionIdentity(verified.tokens));
  const originalUser = await originalSession.query(api.user.current, {});
  expect(originalUser).not.toBeNull();

  const recovery = await client.mutation(api.auth.startPasswordRecovery, {
    email: signup.credentials.email,
  });
  if (!recovery.success) throw new Error(recovery.userError.error);
  await vi.advanceTimersByTimeAsync(100);
  await t.finishInProgressScheduledFunctions();
  const emails = await sentEmails(t);
  const url = emails
    .flatMap((email) => email.text?.match(/https:\/\/bandwithme\.de\/reset-password\?[^\s]+/) ?? [])
    .at(-1);
  if (!url) throw new Error("Recovery email missing");
  const emailCode = new URL(url).searchParams.get("code");
  if (!emailCode) throw new Error("Recovery code missing");
  expect(url).not.toContain(recovery.browserSecret);
  const newPassword = "Neues!Schlagzeug-und-Bass-2026";
  expect(
    await client.mutation(api.auth.completePasswordRecovery, {
      emailCode,
      browserSecret: "wrong-secret",
      newPassword,
    }),
  ).toMatchObject({ status: "error" });
  expect(
    await t.query(api.auth.checkPasswordRecovery, {
      emailCode,
      browserSecret: recovery.browserSecret,
    }),
  ).toEqual({ success: true });

  const recovered = await client.mutation(api.auth.completePasswordRecovery, {
    emailCode,
    browserSecret: recovery.browserSecret,
    newPassword,
  });
  if (recovered.status !== "complete") throw new Error("Recovery failed");
  const recoveredSession = t.withIdentity(sessionIdentity(recovered.tokens));
  expect((await recoveredSession.query(api.user.current, {}))?.id).toBe(originalUser!.id);
  expect(await originalSession.query(api.user.current, {})).toBeNull();
  expect(await client.mutation(api.auth.signInWithEmailPassword, signup.credentials)).toMatchObject(
    { status: "error" },
  );
  expect(
    await client.mutation(api.auth.signInWithEmailPassword, {
      email: signup.credentials.email,
      password: newPassword,
    }),
  ).toMatchObject({ status: "complete" });
  expect(
    await client.mutation(api.auth.completePasswordRecovery, {
      emailCode,
      browserSecret: recovery.browserSecret,
      newPassword,
    }),
  ).toMatchObject({ status: "error" });
  await vi.advanceTimersByTimeAsync(100);
  await t.finishInProgressScheduledFunctions();
});
