import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // These UI checks must never send credentials or mail to a backend.
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => route.abort());
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => socket.close());
});

test("Auth2 sign-in renders without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.text().includes("Unexpected text node")) errors.push(message.text());
  });
  await page.goto("/user");
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("email and password inputs are labeled and keep the password obscured", async ({ page }) => {
  await page.goto("/user");
  const email = page.getByRole("textbox", { name: "E-Mail-Adresse" });
  const password = page.getByLabel("Passwort", { exact: true });
  await email.fill("mitglied@example.com");
  await password.fill("Kein-echtes-Passwort-2026");
  await expect(email).toHaveValue("mitglied@example.com");
  await expect(password).toHaveAttribute("type", "password");
});

test("offers sign-in, verified registration and password recovery", async ({ page }) => {
  await page.goto("/user");
  for (const name of ["Anmelden", "Account erstellen", "Passwort vergessen?"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeEnabled();
  }
  await expect(page.getByText("Send magic link", { exact: true })).toHaveCount(0);
});
