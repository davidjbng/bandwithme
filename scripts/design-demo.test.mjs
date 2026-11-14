import assert from "node:assert/strict";
import { test } from "node:test";
import { demoReducer, initialDemo, durationLabel } from "../src/lib/design-demo-model.ts";

test("attendance can change independently for each event", () => {
  let state = demoReducer(initialDemo, { type: "rsvp", event: "gig", status: "yes" });
  state = demoReducer(state, { type: "rsvp", event: "rehearsal", status: "no" });
  state = demoReducer(state, { type: "rsvp", event: "gig", status: "open" });
  assert.deepEqual(state.attendance, { gig: "open", rehearsal: "no" });
});

test("a vote toggles once per member and archived songs cannot be voted on", () => {
  const vote = { type: "vote", song: "s1" };
  const voted = demoReducer(initialDemo, vote);
  assert.equal(voted.songs[0].votes, 4);
  assert.equal(voted.songs[0].voted, true);
  assert.deepEqual(demoReducer(voted, vote), initialDemo);
  assert.deepEqual(demoReducer(initialDemo, { type: "vote", song: "s4" }), initialDemo);
});

test("setlist selection archives without duplicates, reorders and restores without losing the setlist reference", () => {
  const add = { type: "setlist", song: "s1" };
  let state = demoReducer(initialDemo, add);
  assert.equal(state.songs[0].archived, true);
  assert.equal(demoReducer(state, add), state);
  assert.equal(demoReducer(state, { type: "setlist", song: "missing" }), state);
  state = demoReducer(state, { type: "move", song: "s1", direction: -1 });
  assert.deepEqual(state.setlist, ["s4", "s1", "s5"]);
  assert.equal(demoReducer(state, { type: "move", song: "s4", direction: -1 }), state);
  state = demoReducer(state, { type: "restore", song: "s1" });
  assert.equal(state.songs[0].archived, false);
  assert.ok(state.setlist.includes("s1"));
  assert.equal(durationLabel(125), "2:05");
  assert.deepEqual(demoReducer(state, { type: "reset" }), initialDemo);
});
