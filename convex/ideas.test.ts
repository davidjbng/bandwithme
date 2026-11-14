import { backendTest, asUser } from "../test/backend";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";

afterEach(() => vi.useRealTimers());

test("ideas require authentication and remain private to the author", async () => {
  const t = backendTest();
  const owner = await t.run((ctx) => ctx.db.insert("users", {}));
  const other = await t.run((ctx) => ctx.db.insert("users", {}));
  const idea = { text: "Eine gemeinsame Packliste für Auftritte", requestId: "first" };
  await expect(t.mutation(api.ideas.submit, idea)).rejects.toThrow();
  const session = await asUser(t, owner);
  await session.mutation(api.ideas.submit, idea);
  expect(await session.query(api.ideas.mine, {})).toMatchObject([{ text: idea.text }]);
  expect(await (await asUser(t, other)).query(api.ideas.mine, {})).toEqual([]);
  expect(await t.query(api.ideas.mine, {})).toEqual([]);
});

test("idea retries are idempotent and submissions are bounded", async () => {
  vi.useFakeTimers();
  const t = backendTest();
  const owner = await t.run((ctx) => ctx.db.insert("users", {}));
  const session = await asUser(t, owner);
  for (const text of ["   ", "zu kurz", "x".repeat(4001)]) {
    await expect(
      session.mutation(api.ideas.submit, { text, requestId: "invalid" }),
    ).rejects.toThrow();
  }
  const idea = { text: "  Eine gemeinsame Packliste  ", requestId: "retry" };
  const id = await session.mutation(api.ideas.submit, idea);
  expect(await session.mutation(api.ideas.submit, idea)).toBe(id);
  await expect(
    session.mutation(api.ideas.submit, { ...idea, text: "Eine andere gute Idee" }),
  ).rejects.toThrow();
  for (let i = 0; i < 4; i++) {
    await session.mutation(api.ideas.submit, {
      text: `Noch eine Idee ${i}`,
      requestId: `more-${i}`,
    });
  }
  await expect(
    session.mutation(api.ideas.submit, { text: "Noch eine Idee zu viel", requestId: "limit" }),
  ).rejects.toThrow("12 Minuten");
  expect(await session.mutation(api.ideas.submit, idea)).toBe(id);
  expect(await session.query(api.ideas.mine, {})).toHaveLength(5);

  // Tokens refill continuously: five per hour means one more idea after 12 minutes.
  // Step 1ms beyond the boundary to avoid floating-point rounding of fractional tokens.
  vi.setSystemTime(Date.now() + 12 * 60_000 + 1);
  const refreshedSession = await asUser(t, owner);
  await refreshedSession.mutation(api.ideas.submit, {
    text: "Eine neue Idee nach der Pause",
    requestId: "refilled",
  });
  await expect(
    refreshedSession.mutation(api.ideas.submit, {
      text: "Noch eine Idee direkt danach",
      requestId: "still-limited",
    }),
  ).rejects.toThrow("12 Minuten");
  const other = await t.run((ctx) => ctx.db.insert("users", {}));
  await (
    await asUser(t, other)
  ).mutation(api.ideas.submit, {
    text: "Ein anderes Mitglied hat eine eigene Quote",
    requestId: "independent",
  });
});
