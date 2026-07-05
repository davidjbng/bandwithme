import { test, expect } from '@playwright/test';

test.describe('Termine page', () => {
  test('loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/termine');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('shows empty state for unauthenticated users', async ({ page }) => {
    await page.goto('/termine');
    await expect(page.getByText(/Noch keine Probe/).or(page.getByText(/Login für Zusagen/))).toBeVisible();
  });

  test('shows login prompt card', async ({ page }) => {
    await page.goto('/termine');
    await expect(page.getByText(/Login für Zusagen/)).toBeVisible();
    await expect(page.getByText(/Zum Profil/)).toBeVisible();
  });
});