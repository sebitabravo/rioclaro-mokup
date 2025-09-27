import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Performance Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('should load dashboard quickly in all browsers', async ({ page, browserName }) => {
    const startTime = Date.now();

    // Add Playwright parameter to URL for test environment detection
    await page.goto('/dashboard?playwright=true');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`${browserName}: Dashboard load time: ${loadTime}ms`);

    // Different thresholds for different browsers due to engine differences
    const maxLoadTime = browserName === 'chromium' ? 3500 : 4000;

    expect(loadTime).toBeLessThan(maxLoadTime);
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should handle animations smoothly in all browsers', async ({ page, browserName }) => {
    // Add Playwright parameter to URL for test environment detection
    await page.goto('/dashboard?playwright=true');

    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Wait for dashboard content to be ready
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 5000 });

    // Measure animation performance by checking if UI remains responsive
    const startTime = Date.now();

    // Wait for map container to be ready before clicking Ver Estaciones
    await page.waitForSelector('.leaflet-container', { timeout: 5000 });

    // Click on "Ver Estaciones" button
    await page.getByRole('button', { name: 'Ver Estaciones' }).click();

    // Wait for stations to appear with improved selector strategy
    try {
      // Primary: Look for our optimized test marker
      await page.waitForSelector('[data-testid="station-marker"]', { timeout: 3000 });
    } catch {
      // Fallback: wait for any leaflet markers
      await page.waitForSelector('.leaflet-marker-icon', { timeout: 3000 });
    }

    const responseTime = Date.now() - startTime;
    console.log(`${browserName}: Station display time: ${responseTime}ms`);

    // Different thresholds for different browsers - webkit is notably slower for maps
    const maxResponseTime = browserName === 'chromium' ? 2000 : browserName === 'webkit' ? 10000 : 2500;

    expect(responseTime).toBeLessThan(maxResponseTime);
  });

  test('should handle map interactions without lag in all browsers', async ({ page, browserName }) => {
    await page.goto('/dashboard?playwright=true');

    // Wait for dashboard and map to be ready
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    await page.getByRole('button', { name: 'Ver Estaciones' }).click();

    // Wait for markers to appear
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 8000 });

    const startTime = Date.now();

    // Try to click on a station marker
    const markers = page.locator('.leaflet-marker-icon');
    if (await markers.count() > 0) {
      await markers.first().click();

      // Check if popup appears quickly
      await page.waitForSelector('.leaflet-popup', { timeout: 5000 });

      const interactionTime = Date.now() - startTime;
      console.log(`${browserName}: Map interaction time: ${interactionTime}ms`);

      // Different thresholds for different browsers
      const maxInteractionTime = browserName === 'chromium' ? 2000 : 2500;

      expect(interactionTime).toBeLessThan(maxInteractionTime);
    }
  });

  test('should not have memory leaks from infinite animations', async ({ page, browserName }) => {
    await page.goto('/dashboard?playwright=true');

    // Let the page run for a few seconds to see if animations cause performance issues
    await page.waitForTimeout(3000);

    // Check if the page is still responsive by trying a simple interaction
    const startTime = Date.now();
    await page.getByRole('button', { name: 'Actualizar' }).click();
    const refreshTime = Date.now() - startTime;

    console.log(`${browserName}: Refresh button response time: ${refreshTime}ms`);

    // Refresh should be quick regardless of browser
    expect(refreshTime).toBeLessThan(1000);
  });

  test('should handle page navigation smoothly', async ({ page, browserName }) => {
    await page.goto('/dashboard?playwright=true');

    const startTime = Date.now();

    // Navigate to reports page
    await page.getByRole('link', { name: 'Análisis' }).click();
    await page.waitForLoadState('networkidle');

    const navigationTime = Date.now() - startTime;
    console.log(`${browserName}: Navigation to reports time: ${navigationTime}ms`);

    // Different thresholds for different browsers
    const maxNavigationTime = browserName === 'chromium' ? 2500 : 3000;

    expect(navigationTime).toBeLessThan(maxNavigationTime);
    await expect(page.locator('text=Análisis de Datos')).toBeVisible();
  });
});
