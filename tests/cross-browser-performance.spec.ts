import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Performance Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('should load dashboard quickly in all browsers', async ({ page, browserName }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`${browserName}: Dashboard load time: ${loadTime}ms`);

    // Different thresholds for different browsers due to engine differences
    const maxLoadTime = browserName === 'chromium' ? 1000 : 1500;

    expect(loadTime).toBeLessThan(maxLoadTime);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle animations smoothly in all browsers', async ({ page, browserName }) => {
    await page.goto('/dashboard');

    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Measure animation performance by checking if UI remains responsive
    const startTime = Date.now();

    // Click on "Ver Estaciones" button
    await page.getByRole('button', { name: 'Ver Estaciones' }).click();

    // Wait for stations to appear and measure response time
    await page.waitForSelector('[data-testid="station-marker"]', { timeout: 5000 });

    const responseTime = Date.now() - startTime;
    console.log(`${browserName}: Station display time: ${responseTime}ms`);

    // Different thresholds for different browsers
    const maxResponseTime = browserName === 'chromium' ? 500 : 800;

    expect(responseTime).toBeLessThan(maxResponseTime);
  });

  test('should handle map interactions without lag in all browsers', async ({ page, browserName }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Ver Estaciones' }).click();

    // Wait for map to be ready
    await page.waitForSelector('.leaflet-container', { timeout: 5000 });

    const startTime = Date.now();

    // Try to click on a station marker
    const markers = page.locator('.leaflet-marker-icon');
    if (await markers.count() > 0) {
      await markers.first().click();

      // Check if popup appears quickly
      await page.waitForSelector('.leaflet-popup', { timeout: 3000 });

      const interactionTime = Date.now() - startTime;
      console.log(`${browserName}: Map interaction time: ${interactionTime}ms`);

      // Different thresholds for different browsers
      const maxInteractionTime = browserName === 'chromium' ? 300 : 500;

      expect(interactionTime).toBeLessThan(maxInteractionTime);
    }
  });

  test('should not have memory leaks from infinite animations', async ({ page, browserName }) => {
    await page.goto('/dashboard');

    // Let the page run for a few seconds to see if animations cause performance issues
    await page.waitForTimeout(3000);

    // Check if the page is still responsive by trying a simple interaction
    const startTime = Date.now();
    await page.getByRole('button', { name: 'Actualizar' }).click();
    const refreshTime = Date.now() - startTime;

    console.log(`${browserName}: Refresh button response time: ${refreshTime}ms`);

    // Refresh should be quick regardless of browser
    expect(refreshTime).toBeLessThan(200);
  });

  test('should handle page navigation smoothly', async ({ page, browserName }) => {
    await page.goto('/dashboard');

    const startTime = Date.now();

    // Navigate to reports page
    await page.getByRole('link', { name: 'Análisis' }).click();
    await page.waitForLoadState('networkidle');

    const navigationTime = Date.now() - startTime;
    console.log(`${browserName}: Navigation to reports time: ${navigationTime}ms`);

    // Different thresholds for different browsers
    const maxNavigationTime = browserName === 'chromium' ? 300 : 500;

    expect(navigationTime).toBeLessThan(maxNavigationTime);
    await expect(page.locator('text=Análisis de Datos')).toBeVisible();
  });
});
