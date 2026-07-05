import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Allow Convex/network errors in production (static export hits remote backend)
    const criticalErrors = errors.filter(
      (e) => !e.includes("Convex") && !e.includes("fetch") && !e.includes("network"),
    );
    expect(criticalErrors).toEqual([]);
  });

  test("shows app branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Band With Me").first()).toBeVisible();
  });

  test("shows welcome card for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Willkommen!")).toBeVisible();
    await expect(page.getByText("Zum Login")).toBeVisible();
  });

  test("has working tab navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Termine" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Profil" })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navigates to Termine", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/termine");
    await page.waitForLoadState("networkidle");

    const criticalErrors = errors.filter(
      (e) => !e.includes("Convex") && !e.includes("fetch") && !e.includes("network"),
    );
    expect(criticalErrors).toEqual([]);
    await expect(page.getByText("Nächste Termine")).toBeVisible();
  });

  test("navigates to Profil", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/user");
    await page.waitForLoadState("networkidle");

    const criticalErrors = errors.filter(
      (e) => !e.includes("Convex") && !e.includes("fetch") && !e.includes("network"),
    );
    expect(criticalErrors).toEqual([]);
  });
});
