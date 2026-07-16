import { expect, test } from "@playwright/test";

const developmentAuthEnabled = process.env.E2E_DEVELOPMENT_AUTH === "true";

test.describe("Band creation", () => {
  test.skip(!developmentAuthEnabled, "Requires a dev server with development auth enabled.");

  test("creates a band from the authenticated home screen", async ({ page }) => {
    const name = `E2E Band ${Date.now()}`;

    await page.goto("/user");
    await page.getByText("Entwicklungszugang starten").click();
    await expect(page.getByText(/Angemeldet als/)).toBeVisible();

    await page.goto("/");
    await page.getByText("Band erstellen").click();
    await expect(page.getByText("Neue Band gründen")).toBeVisible();

    await page.getByPlaceholder("z. B. Die Kellerkinder").fill(name);
    await page.getByText("Band erstellen").click();

    await expect(page.getByText("Aktive Band")).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText("Band-Einstellungen")).toBeVisible();
  });

  test("lets a band admin create and copy an invitation link", async ({ page }) => {
    const name = `E2E Invite Band ${Date.now()}`;

    await page.goto("/user");
    await page.getByText("Entwicklungszugang starten").click();
    await page.goto("/onboarding/create");
    await page.getByPlaceholder("z. B. Die Kellerkinder").fill(name);
    await page.getByText("Band erstellen").click();

    await page.getByText("Band-Einstellungen").click();
    await page.getByRole("button", { name: "Einladungslink erstellen" }).click();

    await expect(page.getByText("Einladungslink")).toBeVisible();
    await expect(page.getByLabel("Einladungslink")).toHaveValue(
      /https:\/\/bandwithme\.de\/invite\//,
    );
    await expect(page.getByRole("button", { name: "Link kopieren" })).toBeVisible();
  });
});
