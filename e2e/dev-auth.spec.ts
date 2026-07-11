import { expect, test } from "@playwright/test";

async function startDevelopmentSession(page: import("@playwright/test").Page) {
  await page.goto("/user");
  await page.getByText("Entwicklungszugang starten").click();
  await expect(page.getByText(/Angemeldet als/)).toBeVisible();
}

test.describe("Development authentication", () => {
  test("starts a local development session without email", async ({ page }) => {
    await startDevelopmentSession(page);

    await expect(page.getByText("Name speichern")).toBeVisible();
  });
});
