import { expect, test } from "@playwright/test";

// This is a genuine Auth2 flow, never a mail sender or a development-auth shortcut.
// Provide a fresh, verified, bandless account in an explicitly disposable deployment.
const enabled = process.env.E2E_DISPOSABLE_BACKEND === "true";
const backendUrl = process.env.E2E_CONVEX_URL;
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test("a verified member saves their profile, creates a band and an invitation", async ({
  page,
}, info) => {
  test.skip(
    !enabled || !backendUrl || !email || !password,
    "Requires E2E_DISPOSABLE_BACKEND=true, E2E_CONVEX_URL, E2E_EMAIL and E2E_PASSWORD for a fresh verified account.",
  );
  test.skip(
    info.project.name !== "chromium",
    "One disposable account is consumed once per run, on desktop Chromium.",
  );
  const target = new URL(backendUrl!);
  expect(target.protocol).toBe("https:");
  expect(target.hostname).toMatch(/\.convex\.cloud$/);
  expect(target.hostname).not.toBe("blissful-spaniel-445.eu-west-1.convex.cloud");

  // Fail closed before typing credentials if Metro is serving the wrong deployment.
  const connectedHosts: string[] = [];
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, async (socket) => {
    const hostname = new URL(socket.url()).hostname;
    connectedHosts.push(hostname);
    if (hostname === target.hostname) socket.connectToServer();
    else await socket.close();
  });
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, (route) => {
    if (new URL(route.request().url()).hostname === target.hostname) return route.continue();
    return route.abort();
  });
  await page.goto("/");
  await expect.poll(() => connectedHosts).toContain(target.hostname);
  expect(connectedHosts.every((hostname) => hostname === target.hostname)).toBe(true);
  await page.goto("/user");
  await page.getByRole("textbox", { name: "E-Mail-Adresse" }).fill(email!);
  await page.getByLabel("Passwort", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await expect(page.getByText("Dein Profil", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Dein Name" }).fill("E2E Bandmitglied");
  await page.getByRole("button", { name: "Name speichern", exact: true }).click();
  await expect(page.getByText("Name gespeichert.")).toBeVisible();

  const name = `E2E Band ${Date.now()}`;
  await page.goto("/");
  await page.getByText("Band erstellen", { exact: true }).click();
  await expect(page.getByText("Neue Band gründen")).toBeVisible();
  await page.getByPlaceholder("z. B. Die Kellerkinder").fill(name);
  await page.getByRole("button", { name: "Band erstellen", exact: true }).click();
  await expect(page.getByText("Aktive Band")).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await page.getByText("Band-Einstellungen", { exact: true }).click();
  await page.getByRole("button", { name: "Einladungslink erstellen" }).click();
  await expect(page.getByLabel("Einladungslink")).toHaveValue(
    /https:\/\/bandwithme\.de\/invite\?token=/,
  );
  await expect(page.getByRole("button", { name: "Link kopieren" })).toBeVisible();
});
