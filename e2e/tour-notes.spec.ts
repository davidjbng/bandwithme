import { test, expect } from "@playwright/test";

import { bandFixture } from "./fixtures/band";

test("Tour Notes connects attendance, voting, ordered setlists and band profiles", async ({
  page,
}, testInfo) => {
  const fixture = await bandFixture(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("The Sunday Club", { exact: true })).toBeVisible();
  await expect(page.getByText("1 dabei · 0 abgesagt · 1 offen")).toBeVisible();
  await page.getByRole("button", { name: "Bin dabei", exact: true }).click();
  await expect(page.getByText("2 dabei · 0 abgesagt · 0 offen")).toBeVisible();
  await page.getByRole("button", { name: "Antwort zurücksetzen" }).click();
  await expect(page.getByText("1 dabei · 0 abgesagt · 1 offen")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("tour-home.png"), fullPage: true });
  await page.getByRole("link", { name: "Songs", exact: true }).click();
  await page.getByRole("button", { name: "Dreams: abstimmen, 1 Stimmen" }).click();
  await expect(
    page.getByRole("button", { name: "Dreams: Stimme zurücknehmen, 2 Stimmen" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Live im Stadtgarten ·/ }).click();
  await page.getByRole("button", { name: "Zur Setlist hinzufügen", exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: "Zur Setlist hinzufügen", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Zur Setlist hinzufügen", exact: true }).click();
  await page.getByRole("button", { name: "Setlist für Live im Stadtgarten öffnen" }).click();
  await expect(page.getByText("2 Songs · 7:56 min")).toBeVisible();
  await page.getByRole("button", { name: "Valerie nach oben" }).click();
  await expect(page.getByRole("button", { name: "Valerie nach oben" })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("button", { name: "Valerie nach oben" })).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath("tour-setlist.png"), fullPage: true });
  await page.getByRole("button", { name: "Songs auswählen" }).click();
  await page.getByText("Archiv", { exact: true }).click();
  await page.getByRole("button", { name: "Zurück ins Voting" }).first().click();
  await page.getByRole("button", { name: "Song vorschlagen", exact: true }).click();
  await page.getByLabel("Titel", { exact: true }).fill("Come Together");
  await page.getByLabel("Artist", { exact: true }).fill("The Beatles");
  await page.getByLabel("Länge (Minuten:Sekunden)").fill("4:19");
  await page.getByRole("button", { name: "Song vorschlagen", exact: true }).click();
  await expect(page.getByText("Come Together", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Band", exact: true }).click();
  await expect(page.getByText("Mira Winter · Du")).toBeVisible();
  await expect(page.getByText("Gesang", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Profil & Ideen" }).click();
  await expect(page.getByLabel("Instrument", { exact: true })).toHaveValue("Gesang");
  expect(errors).toEqual([]);
  expect(fixture.mutations).toContain("songs:move");
});

test("dark Tour Notes layouts keep content and navigation readable", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await bandFixture(page);
  await page.goto("/");
  await expect(page.getByText("The Sunday Club", { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("tour-home-dark.png"),
    animations: "disabled",
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole("link", { name: "Songs", exact: true }).click();
  await page.getByLabel("Songs durchsuchen").fill("kein treffer");
  await expect(page.getByText("Kein Treffer.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Suche leeren" }).click();
  await expect(page.getByText("Dreams", { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("tour-songs-dark.png"),
    animations: "disabled",
  });
  await page.goto("/event?id=invalid");
  await expect(page.getByText("Termin nicht gefunden.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Zu euren Terminen" }).click();
  await expect(page.getByRole("button", { name: "Termin erstellen" })).toBeVisible();
});
