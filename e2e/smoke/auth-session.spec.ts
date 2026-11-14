import { test, expect } from "@playwright/test";
import { bandFixture } from "../fixtures/band";

test("login reveals tabs, survives reload and logout protects history", async ({ page }) => {
  await bandFixture(page, false);
  await page.goto("/");
  await expect(page).toHaveURL("/sign-in");
  await expect(page.getByRole("link", { name: "Band", exact: true })).toHaveCount(0);
  await page.getByLabel("Benutzername oder E-Mail-Adresse").fill("mira.bass");
  await page.getByLabel("Passwort", { exact: true }).fill("Fixture-password-2026");
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("The Sunday Club", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Band", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Band", exact: true })).toBeVisible();
  await page.goto("/user");
  await page.getByRole("button", { name: "Abmelden", exact: true }).click();
  await expect(page).toHaveURL("/sign-in");
  await expect(page.getByRole("link", { name: "Band", exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL("/sign-in");
  await page.reload();
  await expect(page.getByLabel("Benutzername oder E-Mail-Adresse")).toBeVisible();
});

test("verified registration retains the link flow and claims a username before returning to an invite", async ({
  page,
}) => {
  await bandFixture(page, false);
  await page.goto("/sign-in?next=%2Finvite%2Ffixture-token");
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  await page.getByLabel("Benutzername", { exact: true }).fill("mira.bass");
  await page.getByLabel("E-Mail-Adresse", { exact: true }).fill("mira@example.test");
  await page.getByLabel("Passwort", { exact: true }).fill("Fixture-password-2026");
  await page.getByRole("button", { name: "Account erstellen", exact: true }).click();
  await expect(page.getByText("Prüfe dein Postfach", { exact: false })).toBeVisible();
  await page.goto("/validate-email?code=fixture-code");
  await expect(
    page.getByText("Deine E-Mail-Adresse ist bestätigt. Bestätige jetzt deinen Benutzernamen."),
  ).toBeVisible();
  await expect(page.getByLabel("Benutzername", { exact: true })).toHaveValue("mira.bass");
  await page.getByRole("button", { name: "Benutzername speichern & weiter" }).click();
  await expect(page).toHaveURL("/invite/fixture-token");
  await expect(page.getByRole("button", { name: "Band beitreten", exact: true })).toBeVisible();
  await page.goto("/sign-in");
  await expect(page).toHaveURL("/");
});

test("an invalid verification with a retained secret is redeemed only once", async ({ page }) => {
  const fixture = await bandFixture(page, false);
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  await page.getByLabel("Benutzername", { exact: true }).fill("mira.bass");
  await page.getByLabel("E-Mail-Adresse", { exact: true }).fill("mira@example.test");
  await page.getByLabel("Passwort", { exact: true }).fill("Fixture-password-2026");
  await page.getByRole("button", { name: "Account erstellen", exact: true }).click();
  await expect(page.getByText("Prüfe dein Postfach", { exact: false })).toBeVisible();
  await page.goto("/validate-email?code=invalid-code");
  await expect(
    page.getByText(
      "Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen an.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zur Anmeldung", exact: true }).click();
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  expect(
    fixture.mutations.filter((name) => name === "auth:completeSignUpWithEmailPassword"),
  ).toHaveLength(1);
});
