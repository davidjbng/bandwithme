import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("shows app branding", async ({ page }) => {
    await page.goto("/");
    // "Band With Me" appears in both hero and tab bar — use .first()
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

    expect(errors).toEqual([]);
    await expect(page.getByText("Nächste Termine")).toBeVisible();
  });

  test("navigates to Profil", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/user");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
});
