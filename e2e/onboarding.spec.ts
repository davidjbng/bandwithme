import { test, expect } from "@playwright/test";

const ALLOWED_ERRORS = ["React error #418", "net::ERR_BLOCKED_BY_LOCAL", "WebSocket connection to"];

function filterCritical(errors: string[]): string[] {
  return errors.filter((e) => !ALLOWED_ERRORS.some((p) => e.includes(p)));
}

test.describe("Band onboarding", () => {
  test("/onboarding/create redirects unauthenticated users to sign-in without critical errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/onboarding/create");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  });

  test("/onboarding/profile redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/onboarding/profile");
    await expect(page).toHaveURL("/sign-in");
    await expect(
      page.getByRole("textbox", { name: "Benutzername oder E-Mail-Adresse" }),
    ).toBeVisible();
  });

  test("/onboarding/join loads without critical errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/onboarding/join");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
    await expect(page.getByLabel("Benutzername oder E-Mail-Adresse")).toBeVisible();
  });

  test("/onboarding/join is protected", async ({ page }) => {
    await page.goto("/onboarding/join");
    await expect(page.getByLabel("Benutzername oder E-Mail-Adresse")).toBeVisible();
  });

  test("an invalid invitation link shows a safe error state", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/invite?token=not-a-real-token");
    await expect(page.getByText("Link nicht gefunden")).toBeVisible();
    expect(filterCritical(errors)).toEqual([]);
  });
});
