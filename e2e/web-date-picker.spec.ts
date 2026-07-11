import { expect, test } from "@playwright/test";

test.describe("Web event date and time inputs", () => {
  test("uses native browser date and time controls", async ({ page, isMobile }) => {
    await page.goto("/termine/create");

    const dateInput = page.locator('input[type="date"]');
    const timeInput = page.locator('input[type="time"]');

    await expect(dateInput).toBeVisible();
    await expect(timeInput).toBeVisible();

    if (!isMobile) {
      await dateInput.fill("2026-12-24");
      await timeInput.fill("18:30");

      await expect(dateInput).toHaveValue("2026-12-24");
      await expect(timeInput).toHaveValue("18:30");
    }
  });
});
