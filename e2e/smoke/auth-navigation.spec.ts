import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // CI exercises local UI only, including when the export points at production.
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => route.abort());
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => socket.close());
});

test("sign-in controls are accessible and keep passwords obscured", async ({ page }) => {
  await page.goto("/user");
  const email = page.getByRole("textbox", { name: "E-Mail-Adresse" });
  const password = page.getByLabel("Passwort", { exact: true });
  await expect(email).toBeVisible();
  await email.fill("mitglied@example.com");
  await password.fill("A private password");
  await expect(email).toHaveValue("mitglied@example.com");
  await expect(password).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Account erstellen" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Passwort vergessen?" })).toBeEnabled();
});

test("an email confirmation link without a code offers recovery", async ({ page }) => {
  await page.goto("/validate-email");
  await expect(page.getByText("Dieser Link enthält keinen Bestätigungscode.")).toBeVisible();
  await page.getByRole("button", { name: "Zum Profil" }).click();
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
});

test("a password reset link without a code does not accept a new password", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.getByText("Bitte fordere im Profil einen neuen Link an.")).toBeVisible();
  await expect(page.getByLabel("Neues Passwort", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Zum Profil" }).click();
  await expect(page.getByRole("textbox", { name: "E-Mail-Adresse" })).toBeVisible();
});

test("the design prototype is not exposed in production exports", async ({ page }) => {
  await page.goto("/prototype/songs");
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("vote-s1")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Band", exact: true })).toBeVisible();
});

test("active Tour Notes navigation is accessible without demo records", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Guter Takt.", { exact: false })).toBeVisible();
  for (const [name, path] of [
    ["Übersicht", "/"],
    ["Termine", "/termine"],
    ["Songs", "/songs"],
    ["Band", "/band"],
  ]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("button", { name: "Anmelden oder registrieren" })).toBeVisible();
  }
  await expect(page.getByText("The Sunday Club", { exact: false })).toHaveCount(0);
  await page.getByRole("button", { name: "Anmelden oder registrieren" }).click();
  await expect(page.getByRole("textbox", { name: "E-Mail-Adresse" })).toBeVisible();
});
