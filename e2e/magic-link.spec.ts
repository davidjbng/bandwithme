import { expect, test } from "@playwright/test";

test("a magic-link callback is consumed by exactly one auth handler", async ({ page }) => {
  const authErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("auth:signIn")) {
      authErrors.push(message.text());
    }
  });

  await page.goto("/user?email=e2e%40bandwithme.local&code=invalid-test-code");
  await expect.poll(() => authErrors.length).toBeGreaterThan(0);

  expect(authErrors).toHaveLength(1);
});
