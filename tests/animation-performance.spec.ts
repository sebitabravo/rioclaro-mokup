import { test, expect } from '@playwright/test';
import { seedAdminSession } from './utils/auth';
import { dismissOnboardingIfPresent } from './utils/ui';

test.describe('Animation Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminSession(page);
  });

  test('should have optimized animation timings', async ({ page }) => {
    await page.goto('/');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');

  await dismissOnboardingIfPresent(page);

  // Measure time for cards to appear
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="dashboard-content"]');
    const cardsLoadTime = Date.now() - startTime;

    console.log(`Cards load time: ${cardsLoadTime}ms`);
  expect(cardsLoadTime).toBeLessThan(4000);

    // Verify that we can interact with elements immediately
    const refreshButton = page.locator('button').filter({ hasText: 'Actualizar' });
    await expect(refreshButton).toBeEnabled();

    // Test that clicking works without delays
  await refreshButton.click({ force: true });
    // Just verify the button is still there and enabled after click
    await expect(refreshButton).toBeEnabled();
  });

  test('should not have blocking animations on navigation', async ({ page }) => {
    await page.goto('/');

    const startNavTime = Date.now();

  // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]');

  await dismissOnboardingIfPresent(page);

    const navTime = Date.now() - startNavTime;
    console.log(`Navigation time: ${navTime}ms`);

    // Navigation should be fast
  expect(navTime).toBeLessThan(10000);
  });

  test('should handle window resize without animation issues', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-content"]');

  await dismissOnboardingIfPresent(page);

    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
    await page.waitForTimeout(200);

    // Verify content is still accessible
    const statsCards = page.locator('[data-testid="dashboard-content"] .grid');
    await expect(statsCards.first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.waitForTimeout(200);

    // Should adapt to mobile layout
    const mobileCards = page.locator('[data-testid="dashboard-content"] .grid');
    await expect(mobileCards.first()).toBeVisible();
  });
});
