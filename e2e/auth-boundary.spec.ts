import { expect, test } from "@playwright/test";

test("development builds expose no passwordless authentication bypass", async ({ page }) => {
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => route.abort());
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => socket.close());
  await page.goto("/user");
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  await expect(page.getByText("Entwicklungszugang starten")).toHaveCount(0);
  await expect(page.getByText("Dein Profil", { exact: true })).toHaveCount(0);
});
