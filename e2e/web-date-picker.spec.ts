import { expect, test } from "@playwright/test";

test.describe("Web event date and time inputs", () => {
  test("uses native browser controls styled like app inputs", async ({ page }) => {
    await page.goto("/termine/create");

    const dateInput = page.locator('input[type="date"]');
    const timeInput = page.locator('input[type="time"]');

    await expect(dateInput).toBeVisible();
    await expect(timeInput).toBeVisible();

    await expect(dateInput).toHaveCSS("font-size", "16px");
    await expect(dateInput).toHaveCSS("font-weight", "600");
    await expect(dateInput).toHaveCSS("height", "46px");
    await expect(timeInput).toHaveCSS("font-size", "16px");
    await expect(timeInput).toHaveCSS("font-weight", "600");
    await expect(timeInput).toHaveCSS("height", "46px");
  });
});
