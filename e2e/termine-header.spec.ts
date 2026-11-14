import { expect, test } from "@playwright/test";

test("keeps Termine content below the native header", async ({ page }) => {
  await page.goto("/termine");

  const headerTitle = page.locator("h1", { hasText: "Termine" });
  const sectionTitle = page.getByText("Zusammen klingt’s besser.");

  await expect(headerTitle).toBeVisible();
  await expect(sectionTitle).toBeVisible();

  const layout = await page.evaluate(() => {
    const header = Array.from(document.querySelectorAll("h1")).find(
      (element) => element.textContent?.trim() === "Termine",
    );
    const section = Array.from(document.querySelectorAll("*")).find(
      (element) =>
        element.children.length === 0 &&
        element.textContent?.trim() === "Zusammen klingt’s besser.",
    );
    if (!header || !section) return null;

    return { header: header.getBoundingClientRect(), section: section.getBoundingClientRect() };
  });

  expect(layout).not.toBeNull();
  expect(layout!.section.y).toBeGreaterThan(layout!.header.y + layout!.header.height + 16);
});
