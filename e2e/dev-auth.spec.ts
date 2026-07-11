import { expect, test } from "@playwright/test";

const developmentAuthEnabled = process.env.E2E_DEVELOPMENT_AUTH === "true";

test.describe("Development authentication", () => {
  test.skip(!developmentAuthEnabled, "Requires a dev server with development auth enabled.");

  test("starts a local session and saves a profile name without email", async ({ page }) => {
    await page.goto("/user");
    await page.getByText("Entwicklungszugang starten").click();

    await expect(page.getByText(/Angemeldet als/)).toBeVisible();

    const nameInput = page.getByPlaceholder("Dein Name").last();
    await nameInput.fill("E2E Entwicklungstest");
    await page.getByText("Name speichern").click();

    await expect(page.getByText("Name gespeichert.")).toBeVisible();
  });
});
