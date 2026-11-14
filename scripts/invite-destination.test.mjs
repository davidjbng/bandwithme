import { beforeEach, expect, test, vi } from "vite-plus/test";

const { platform, secure } = vi.hoisted(() => ({
  platform: { OS: "web" },
  secure: new Map(),
}));
vi.mock("react-native", () => ({ Platform: platform }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: async (key) => secure.get(key) ?? null,
  setItemAsync: async (key, value) => {
    secure.set(key, value);
  },
  deleteItemAsync: async (key) => {
    secure.delete(key);
  },
}));

import {
  inviteDestination,
  readInviteDestination,
  saveInviteDestination,
} from "../src/lib/invite-destination.ts";

beforeEach(() => {
  secure.clear();
  const browser = new Map();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key) => browser.get(key) ?? null,
      setItem: (key, value) => {
        browser.set(key, value);
      },
      removeItem: (key) => {
        browser.delete(key);
      },
    },
  });
});

test("only invite links become return destinations", () => {
  expect(inviteDestination("/invite?token=band_123-abc")).toBe("/invite/band_123-abc");
  expect(inviteDestination("/invite/band_123-abc")).toBe("/invite/band_123-abc");
  for (const value of [
    undefined,
    ["/invite/token"],
    "https://evil.test",
    "//evil.test",
    "/invite/../user",
    "/invite/%2f%2fevil.test",
    "/invite?token=abc&next=https://evil.test",
    "/user",
    "/invite/",
  ]) {
    expect(inviteDestination(value)).toBeNull();
  }
});

for (const os of ["web", "ios", "android"]) {
  test(`${os} keeps the invite through verification and removes it after return`, async () => {
    platform.OS = os;
    await saveInviteDestination("/invite?token=band-123", "https://prod.convex.cloud");
    expect(await readInviteDestination("https://prod.convex.cloud")).toBe("/invite/band-123");
    expect(await readInviteDestination("https://dev.convex.cloud")).toBeNull();
    await saveInviteDestination(null, "https://prod.convex.cloud");
    expect(await readInviteDestination("https://prod.convex.cloud")).toBeNull();
  });
}

test("a new non-invite sign-up clears an older pending invite", async () => {
  platform.OS = "web";
  await saveInviteDestination("/invite/old", "deployment");
  await saveInviteDestination(undefined, "deployment");
  expect(await readInviteDestination("deployment")).toBeNull();
});

test("invalid stored data never becomes a redirect", async () => {
  platform.OS = "ios";
  secure.set("bandwithme_pending_invite_deployment", "https://evil.test");
  expect(await readInviteDestination("deployment")).toBeNull();
});
