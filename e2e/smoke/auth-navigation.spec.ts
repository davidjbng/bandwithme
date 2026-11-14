import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // CI exercises local UI only, including when the export points at production.
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => route.abort());
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => socket.close());
});

test("sign-in controls are accessible and keep passwords obscured", async ({ page }) => {
  await page.goto("/user");
  const email = page.getByRole("textbox", { name: "Benutzername oder E-Mail-Adresse" });
  const password = page.getByLabel("Passwort", { exact: true });
  await expect(email).toBeVisible();
  await email.fill("mitglied@example.com");
  await password.fill("A private password");
  await expect(email).toHaveValue("mitglied@example.com");
  await expect(password).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Registrieren" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Passwort vergessen?" })).toBeEnabled();
});

test("an email confirmation link without a code offers recovery", async ({ page }) => {
  await page.goto("/validate-email");
  await expect(page.getByText("Dieser Link enthält keinen Bestätigungscode.")).toBeVisible();
  await page.getByRole("button", { name: "Zur Anmeldung" }).click();
  await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
});

test("a password reset link without a code does not accept a new password", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(
    page.getByText("Bitte fordere bei der Anmeldung einen neuen Link an."),
  ).toBeVisible();
  await expect(page.getByLabel("Neues Passwort", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Zur Anmeldung" }).click();
  await expect(
    page.getByRole("textbox", { name: "Benutzername oder E-Mail-Adresse" }),
  ).toBeVisible();
});

test("the design prototype is not exposed in production exports", async ({ page }) => {
  await page.goto("/prototype/songs");
  await expect(page).toHaveURL("/sign-in");
  await expect(page.getByTestId("vote-s1")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Band", exact: true })).toHaveCount(0);
});

test("guest entry and protected deep links show the login form without tabs", async ({ page }) => {
  for (const path of [
    "/",
    "/termine",
    "/songs",
    "/band",
    "/event?id=missing",
    "/onboarding/create",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByLabel("Benutzername oder E-Mail-Adresse")).toBeVisible();
    await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
    for (const name of ["Übersicht", "Termine", "Songs", "Band"]) {
      await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
    }
    await expect(page.getByRole("button", { name: "Anmelden oder registrieren" })).toHaveCount(0);
  }
});

test("registration and recovery have the right fields and preserve a tab-free entry", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByLabel("Benutzername oder E-Mail-Adresse")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("login.png"), animations: "disabled" });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.screenshot({ path: testInfo.outputPath("login-dark.png"), animations: "disabled" });
  await page.getByRole("button", { name: "Registrieren", exact: true }).click();
  await expect(page.getByLabel("Benutzername", { exact: true })).toBeVisible();
  await expect(page.getByLabel("E-Mail-Adresse", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Passwort", { exact: true })).toHaveAttribute(
    "autocomplete",
    "new-password",
  );
  await page.getByRole("button", { name: "Account erstellen", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("3–30 Zeichen");
  await page.screenshot({ path: testInfo.outputPath("register.png"), animations: "disabled" });
  await page.getByRole("button", { name: "Zur Anmeldung", exact: true }).click();
  await page.getByRole("button", { name: "Passwort vergessen?", exact: true }).click();
  await expect(page.getByLabel("E-Mail-Adresse", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Passwort", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Link anfordern" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
