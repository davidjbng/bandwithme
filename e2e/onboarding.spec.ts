import { test, expect } from "@playwright/test";

const ALLOWED_ERRORS = ["React error #418", "net::ERR_BLOCKED_BY_LOCAL", "WebSocket connection to"];

function filterCritical(errors: string[]): string[] {
  return errors.filter((e) => !ALLOWED_ERRORS.some((p) => e.includes(p)));
}

test.describe("Band onboarding", () => {
  test("/onboarding/create redirects unauthenticated users home without critical errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/onboarding/create");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Willkommen!")).toBeVisible();
  });

  test("/onboarding/join loads without critical errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/onboarding/join");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
    await expect(page.getByText(/Band beitreten|Einladungslink/).first()).toBeVisible();
  });

  test("/onboarding/join shows invite link info", async ({ page }) => {
    await page.goto("/onboarding/join");
    await expect(page.getByText(/Einladungslink/).first()).toBeVisible();
  });
});
