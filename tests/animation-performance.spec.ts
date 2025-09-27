import { test, expect } from '@playwright/test';

test.describe('Animation Performance Tests', () => {
  test('should have optimized animation timings', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Navigate to dashboard
    await page.locator('a[href="/dashboard"]').filter({ hasText: 'Ver Dashboard' }).click();

    // Measure time for cards to appear
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="dashboard-content"]');
    const cardsLoadTime = Date.now() - startTime;

    console.log(`Cards load time: ${cardsLoadTime}ms`);
    expect(cardsLoadTime).toBeLessThan(2000); // Should be reasonable for test environment

    // Verify that we can interact with elements immediately
    const refreshButton = page.locator('button').filter({ hasText: 'Actualizar' });
    await expect(refreshButton).toBeEnabled();

    // Test that clicking works without delays
    await refreshButton.click();
    // Just verify the button is still there and enabled after click
    await expect(refreshButton).toBeEnabled();
  });

  test('should not have blocking animations on navigation', async ({ page }) => {
    // Test navigation between pages
    await page.goto('/');

    // Click on dashboard link - use more specific selector
    const dashboardLink = page.locator('a[href="/dashboard"]').filter({ hasText: 'Ver Dashboard' });
    const startNavTime = Date.now();

    await dashboardLink.click();

    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]');

    const navTime = Date.now() - startNavTime;
    console.log(`Navigation time: ${navTime}ms`);

    // Navigation should be fast
    expect(navTime).toBeLessThan(2000);
  });

  test('should handle window resize without animation issues', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-content"]');

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
