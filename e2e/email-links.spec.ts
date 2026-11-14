import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => route.abort());
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => socket.close());
});

for (const path of ["/validate-email", "/reset-password"]) {
  test(`${path} requires the local secret from the requesting browser`, async ({ page }) => {
    const textWarnings: string[] = [];
    page.on("console", (message) => {
      if (message.text().includes("Unexpected text node")) textWarnings.push(message.text());
    });
    await page.goto(`${path}?code=untrusted-email-code`);
    await expect(
      page.getByText(
        "Öffne den Link in derselben App oder demselben Browser, in dem du ihn angefordert hast.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Neues Passwort", { exact: true })).toHaveCount(0);
    expect(textWarnings).toEqual([]);
    await page.getByRole("button", { name: "Zur Anmeldung", exact: true }).click();
    await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  });
}

test("a legacy magic-link URL cannot sign a user in", async ({ page }) => {
  await page.goto("/user?email=e2e%40example.com&code=invalid-legacy-code");
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  await expect(page.getByText("Dein Profil", { exact: true })).toHaveCount(0);
});
