import { expect, test } from "@playwright/test";

test("keeps Termine content below the native header", async ({ page }) => {
  await page.goto("/termine");

  const headerTitle = page.locator("h1", { hasText: "Termine" });
  const sectionTitle = page.getByText("Nächste Termine");

  await expect(headerTitle).toBeVisible();
  await expect(sectionTitle).toBeVisible();

  const headerBox = await headerTitle.boundingBox();
  const sectionBox = await sectionTitle.boundingBox();

  expect(headerBox).not.toBeNull();
  expect(sectionBox).not.toBeNull();
  expect(sectionBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height + 16);
});
