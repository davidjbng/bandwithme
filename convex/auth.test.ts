import { generateKeyPairSync } from "node:crypto";
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

declare global {
  interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
}

const modules = import.meta.glob("./**/*.ts");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function configureAuth() {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  vi.stubEnv("JWT_PRIVATE_KEY", privateKey.export({ type: "pkcs8", format: "pem" }).toString());
  vi.stubEnv("CONVEX_SITE_URL", "https://review.invalid");
  vi.stubEnv("SITE_URL", "https://bandwithme.de");
}

test("a real password session can update its profile and create a band", async () => {
  configureAuth();
  const t = convexTest(schema, modules);
  const credentials = {
    email: "password-user@example.com",
    password: "correct-horse-battery-staple",
  };

  const signUp = await t.action(api.auth.signIn, {
    provider: "password",
    params: { flow: "signUp", ...credentials },
  });
  expect(signUp.tokens?.token).toEqual(expect.any(String));
  const signIn = await t.action(api.auth.signIn, {
    provider: "password",
    params: { flow: "signIn", ...credentials },
  });
  const claims = JSON.parse(
    Buffer.from(signIn.tokens!.token.split(".")[1], "base64url").toString(),
  );
  expect(claims.email).toBeUndefined();
  const session = t.withIdentity({ subject: claims.sub, issuer: claims.iss });
  const user = await session.query(api.user.current, {});
  expect(user?.email).toBe(credentials.email);
  await session.mutation(api.user.updateProfile, { userId: user!.id, name: "Testmitglied" });
  const bandId = await session.mutation(api.bands.create, { userId: user!.id, name: "Testband" });
  const eventId = await session.mutation(api.termine.create, {
    userId: user!.id,
    kind: "rehearsal",
    name: "Probe",
    dateTime: "2099-01-01T20:00:00.000Z",
    location: "Proberaum",
    repeat: "none",
  });
  expect((await session.query(api.bands.myBand, {}))?.id).toBe(bandId);
  expect(await session.query(api.termine.list, {})).toMatchObject([{ id: eventId }]);
  await session.mutation(api.termine.setResponse, { userId: user!.id, eventId, status: "yes" });
  expect(await session.query(api.termine.list, {})).toMatchObject([{ viewerResponse: "yes" }]);
});

test("magic-link redirects only accept the configured site origin", async () => {
  configureAuth();
  vi.stubEnv("AHASEND_API_KEY", "local");
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const t = convexTest(schema, modules);
  for (const redirectTo of [
    "https://bandwithme.de.attacker.invalid/user",
    "https://bandwithme.de@attacker.invalid/user",
    "https://bandwithme.de:444/user",
    "http://bandwithme.de/user",
    "//attacker.invalid/user",
    "/\\attacker.invalid/user",
  ]) {
    await expect(
      t.action(api.auth.signIn, {
        provider: "ahasend",
        params: { email: "victim@example.com", redirectTo },
      }),
    ).rejects.toThrow();
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Magic link for"));
  }
  await expect(
    t.action(api.auth.signIn, {
      provider: "ahasend",
      params: { email: "victim@example.com", redirectTo: "/user?email=victim%40example.com" },
    }),
  ).resolves.toMatchObject({ started: true });
  expect(log).toHaveBeenCalledWith(expect.stringContaining("https://bandwithme.de/user?"));
  await expect(
    t.action(api.auth.signIn, {
      provider: "ahasend",
      params: { email: "victim@example.com", redirectTo: "bandwithme://user" },
    }),
  ).resolves.toMatchObject({ started: true });
});
