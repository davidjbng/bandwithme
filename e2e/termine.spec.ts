import { test, expect } from "@playwright/test";

const ALLOWED_ERRORS = ["React error #418", "net::ERR_BLOCKED_BY_LOCAL", "WebSocket connection to"];

function filterCritical(errors: string[]): string[] {
  return errors.filter((e) => !ALLOWED_ERRORS.some((p) => e.includes(p)));
}

test.describe("Termine page", () => {
  test("loads without critical errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/termine");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
  });

  test("shows login for unauthenticated users", async ({ page }) => {
    await page.goto("/termine");
    await expect(page.getByLabel("Benutzername oder E-Mail-Adresse")).toBeVisible();
    await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  });

  test("requires no extra click to reach the form", async ({ page }) => {
    await page.goto("/termine");
    await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
    await expect(page.getByLabel("Passwort", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  });
});
