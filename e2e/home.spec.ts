import { test, expect } from "@playwright/test";

// Only filter these specific harmless patterns.
// All other errors (including Convex bugs!) must fail the test.
const ALLOWED_ERRORS = [
  "React error #418", // SSR hydration mismatch (static export)
  "net::ERR_BLOCKED_BY_LOCAL", // localhost WebSocket blocked in headless Chrome
  "WebSocket connection to", // localhost WebSocket unavailable during SSR
];

function filterCritical(errors: string[]): string[] {
  return errors.filter((e) => !ALLOWED_ERRORS.some((p) => e.includes(p)));
}

test.describe("Home page", () => {
  test("loads without critical errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
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
    expect(filterCritical(errors)).toEqual([]);
    await expect(page.getByText("Nächste Termine")).toBeVisible();
  });

  test("navigates to Profil", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/user");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
  });
});
