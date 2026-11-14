import { expect, test } from "vitest";
import { asUser, backendTest } from "../test/backend";
import { api } from "./_generated/api";

async function setup() {
  const t = backendTest();
  const [userId, otherId, outsiderId] = await t.run(async (ctx) =>
    Promise.all(["A", "B", "C"].map((name) => ctx.db.insert("users", { name }))),
  );
  const a = await asUser(t, userId);
  const b = await asUser(t, otherId);
  const outsider = await asUser(t, outsiderId);
  const bandId = await a.mutation(api.bands.create, { userId, name: "Live" });
  await t.run((ctx) => ctx.db.insert("bandMembers", { userId: otherId, bandId, role: "member" }));
  await outsider.mutation(api.bands.create, { userId: outsiderId, name: "Other" });
  const eventId = await a.mutation(api.termine.create, {
    userId,
    kind: "performance",
    name: "Gig",
    dateTime: "2099-01-01T20:00:00Z",
    location: "Stage",
    repeat: "none",
  });
  const songId = await a.mutation(api.songs.create, {
    title: "Dreams",
    artist: "Fleetwood Mac",
    duration: 257,
    reference: "https://example.com/song",
  });
  return { t, a, b, outsider, userId, otherId, bandId, eventId, songId };
}

test("shared votes are idempotent and only current band members count", async () => {
  const { t, a, b, otherId, songId } = await setup();
  await a.mutation(api.songs.setVote, { songId, voted: true });
  await a.mutation(api.songs.setVote, { songId, voted: true });
  await b.mutation(api.songs.setVote, { songId, voted: true });
  expect(await a.query(api.songs.list, {})).toMatchObject([{ votes: 2, voted: true }]);
  await a.mutation(api.songs.setVote, { songId, voted: false });
  await b.mutation(api.bands.leave, { userId: otherId });
  expect(await a.query(api.songs.list, {})).toMatchObject([{ votes: 0, voted: false }]);
  expect(await t.query(api.songs.list, {})).toEqual([]);
});

test("setlists preserve songs and votes across archive, restore, reorder and removal", async () => {
  const { a, b, eventId, songId } = await setup();
  const second = await b.mutation(api.songs.create, {
    title: "Valerie",
    artist: "Amy",
    duration: 219,
  });
  await a.mutation(api.songs.setVote, { songId, voted: true });
  await b.mutation(api.songs.addToSetlist, { eventId, songId });
  await b.mutation(api.songs.addToSetlist, { eventId, songId });
  await a.mutation(api.songs.addToSetlist, { eventId, songId: second });
  await expect(a.mutation(api.songs.setVote, { songId, voted: true })).rejects.toThrow("Archiv");
  await a.mutation(api.songs.archive, { songId, archived: false });
  expect(await b.query(api.songs.list, {})).toMatchObject([
    { archived: false, votes: 1, reference: "https://example.com/song" },
    { archived: true },
  ]);
  await b.mutation(api.songs.move, { eventId, songId: second, direction: -1 });
  expect((await a.query(api.songs.setlist, { eventId })).map((s) => s._id)).toEqual([
    second,
    songId,
  ]);
  await a.mutation(api.songs.move, { eventId, songId: second, direction: -1 });
  await b.mutation(api.songs.removeFromSetlist, { eventId, songId });
  expect((await a.query(api.songs.setlist, { eventId })).map((s) => s._id)).toEqual([second]);
  expect(await a.query(api.songs.list, {})).toHaveLength(2);
});

test("rejects cross-band reads and writes, rehearsals and invalid song input", async () => {
  const { a, outsider, userId, eventId, songId } = await setup();
  await expect(outsider.query(api.songs.setlist, { eventId })).rejects.toThrow("Auftritt");
  await expect(outsider.mutation(api.songs.setVote, { songId, voted: true })).rejects.toThrow(
    "Song",
  );
  await expect(outsider.mutation(api.songs.archive, { songId, archived: true })).rejects.toThrow(
    "Song",
  );
  await expect(
    outsider.mutation(api.songs.move, { eventId, songId, direction: 1 }),
  ).rejects.toThrow("Auftritt");
  await expect(outsider.mutation(api.songs.removeFromSetlist, { eventId, songId })).rejects.toThrow(
    "Auftritt",
  );
  const foreignSong = await outsider.mutation(api.songs.create, {
    title: "Private",
    artist: "Other",
    duration: 120,
  });
  await expect(
    a.mutation(api.songs.addToSetlist, { eventId, songId: foreignSong }),
  ).rejects.toThrow("Song");
  const rehearsal = await a.mutation(api.termine.create, {
    userId,
    kind: "rehearsal",
    name: "Probe",
    dateTime: "2099-01-01T20:00:00Z",
    location: "Room",
    repeat: "none",
  });
  await expect(a.mutation(api.songs.addToSetlist, { eventId: rehearsal, songId })).rejects.toThrow(
    "Auftritt",
  );
  for (const reference of ["javascript:alert(1)", "https://user:secret@example.com"]) {
    await expect(
      a.mutation(api.songs.create, { title: "X", artist: "Y", duration: 120, reference }),
    ).rejects.toThrow("HTTP");
  }
  await expect(
    a.mutation(api.songs.create, { title: " ", artist: "Y", duration: 120 }),
  ).rejects.toThrow("Titel");
  await expect(
    a.mutation(api.songs.create, { title: "X", artist: "Y", duration: -1 }),
  ).rejects.toThrow("Länge");
});

test("event details have real open attendance, resetting removes the response", async () => {
  const { t, a, b, outsider, eventId, userId, otherId } = await setup();
  await t.run((ctx) =>
    ctx.db.insert("eventResponses", {
      eventId,
      userId: otherId,
      status: "maybe",
      respondedAt: new Date().toISOString(),
    }),
  );
  expect(await a.query(api.termine.detail, { eventId })).toMatchObject({
    responseCounts: { open: 2, yes: 0, no: 0 },
  });
  await a.mutation(api.termine.setResponse, { userId, eventId, status: "yes" });
  expect(await b.query(api.termine.detail, { eventId })).toMatchObject({
    responseCounts: { open: 1, yes: 1 },
  });
  await a.mutation(api.termine.setResponse, { userId, eventId, status: "open" });
  expect(await a.query(api.termine.detail, { eventId })).toMatchObject({
    viewerResponse: null,
    responseCounts: { open: 2 },
  });
  expect(await outsider.query(api.termine.detail, { eventId })).toBeNull();
  expect(await t.query(api.termine.detail, { eventId })).toBeNull();
  expect(await a.query(api.termine.detail, { eventId: "broken-link" })).toBeNull();
});
