import { test, expect } from "@playwright/test";

test.describe("Band onboarding", () => {
  test("/onboarding/create loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/onboarding/create");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
    // Shows login prompt since user is unauthenticated
    await expect(page.getByText(/Bitte zuerst einloggen|Neue Band gründen/)).toBeVisible();
  });

  test("/onboarding/create shows login prompt when unauthenticated", async ({ page }) => {
    await page.goto("/onboarding/create");
    await expect(page.getByText("Bitte zuerst einloggen")).toBeVisible();
    await expect(page.getByText("Zum Login")).toBeVisible();
  });

  test("/onboarding/join loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/onboarding/join");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
    // Shows either placeholder or header
    await expect(page.getByText(/Band beitreten|Einladungslink/).first()).toBeVisible();
  });

  test("/onboarding/join shows invite link info", async ({ page }) => {
    await page.goto("/onboarding/join");
    await expect(page.getByText(/Einladungslink/).first()).toBeVisible();
  });
});
