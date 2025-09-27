import { test, expect } from '@playwright/test';

test.describe('General App Tests', () => {
  test('should load homepage without errors', async ({ page }) => {
    await page.goto('/');

    // Verify basic elements are present
    await expect(page.locator('text=Sistema Monitoreo Río Claro')).toBeVisible();
    await expect(page.locator('text=Ver Dashboard')).toBeVisible();
    await expect(page.locator('text=Ver Reportes')).toBeVisible();
  });

  test('should navigate between pages correctly', async ({ page }) => {
    await page.goto('/');

    // Test navigation to dashboard - use specific button text
    await page.locator('a[href="/dashboard"]').filter({ hasText: 'Ver Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();

    // Test navigation back to home
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL('/');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/dashboard"]').filter({ hasText: 'Ver Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for dashboard content to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });

    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="dashboard-content"] .grid').first()).toBeVisible();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="dashboard-content"] .grid').first()).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="dashboard-content"] .grid').first()).toBeVisible();
  });
});
