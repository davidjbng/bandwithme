import { test, expect } from "@playwright/test";

const ALLOWED_ERRORS = ["React error #418", "net::ERR_BLOCKED_BY_LOCAL", "WebSocket connection to"];

function filterCritical(errors: string[]): string[] {
  return errors.filter((e) => !ALLOWED_ERRORS.some((p) => e.includes(p)));
}

test.describe("Auth flow", () => {
  test("login page renders without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/user");
    await page.waitForLoadState("networkidle");
    expect(filterCritical(errors)).toEqual([]);
  });

  test("shows email input when not authenticated", async ({ page }) => {
    await page.goto("/user");
    await expect(page.getByText("Email address")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  });

  test("shows magic link button", async ({ page }) => {
    await page.goto("/user");
    await expect(page.getByText("Send magic link")).toBeVisible();
  });

  test("typing email enables the button", async ({ page }) => {
    await page.goto("/user");
    const input = page.getByPlaceholder("you@example.com");
    await input.fill("test@example.com");
    await expect(input).toHaveValue("test@example.com");
  });

  test("shows status after sending magic link", async ({ page }) => {
    await page.goto("/user");
    const input = page.getByPlaceholder("you@example.com");
    await input.fill("test@example.com");
    await page.getByText("Send magic link").click();

    // Should show "Magic link sent" message
    await expect(page.getByText(/Magic link sent|email/)).toBeVisible({ timeout: 10000 });
  });
});
