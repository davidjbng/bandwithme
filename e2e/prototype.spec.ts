import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // The demo's state is local. Fail closed if it tries to contact a backend.
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => route.abort());
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => socket.close());
});

test("attendance changes and can be reset", async ({ page }) => {
  await page.goto("/prototype");
  const attendance = page.getByTestId("attendance-count").first();
  await expect(attendance).toHaveText("4 dabei · 0 abgesagt · 1 offen");
  await page.getByTestId("yes-rehearsal").click();
  await expect(attendance).toHaveText("5 dabei · 0 abgesagt · 0 offen");
  await page.getByTestId("no-rehearsal").click();
  await expect(attendance).toHaveText("4 dabei · 1 abgesagt · 0 offen");
  await page.getByRole("button", { name: "Antwort zurücksetzen" }).click();
  await expect(attendance).toHaveText("4 dabei · 0 abgesagt · 1 offen");
});

test("song voting, search and setlist selection keep their state", async ({ page }) => {
  await page.goto("/prototype/songs");
  const vote = page.getByTestId("vote-s1");
  await expect(vote).toHaveAccessibleName("Dreams: abstimmen, 3 Stimmen");
  await vote.click();
  await expect(vote).toHaveAccessibleName("Dreams: Stimme zurücknehmen, 4 Stimmen");
  await vote.click();
  await expect(vote).toHaveAccessibleName("Dreams: abstimmen, 3 Stimmen");

  await page.getByTestId("song-search").fill("no matching song");
  await expect(page.getByText("Kein Treffer.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Suche leeren" }).click();
  await page.getByTestId("select-s1").click();
  await expect(vote).toHaveCount(0);
  await page.getByRole("button", { name: "Stadtgarten-Setlist öffnen" }).click();
  await expect(page.getByTestId("setlist-s1")).toBeVisible();
  await page.getByTestId("move-s1--1").click();
  await expect(page.getByTestId("setlist-s1")).toContainText("02");
});

test("unknown event links offer a route back", async ({ page }) => {
  await page.goto("/prototype/event?id=missing");
  await expect(page.getByText("Termin nicht gefunden.")).toBeVisible();
  await page.getByRole("button", { name: "Zur Übersicht" }).click();
  await expect(page.getByTestId("home-songs")).toBeVisible();
});
