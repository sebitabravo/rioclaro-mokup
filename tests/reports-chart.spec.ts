import { test, expect } from '@playwright/test';
import { seedAdminSession } from './utils/auth';

test('Reports page shows chart or placeholder', async ({ page }) => {
  await seedAdminSession(page);
  await page.goto('/reports');
  // Esperar que el título del card esté visible (selector específico para el heading)
  await expect(page.locator('h3:has-text("Promedios Diarios")')).toBeVisible();

  // Verificar que el componente NormalizedChart o MetricChart exista (placeholder o gráfico)
  const normalized = page.locator('[data-testid="normalized-chart"]');
  const metric = page.locator('[data-testid="metric-chart"]');

  await page.waitForTimeout(500);

  const hasNormalized = (await normalized.count()) > 0 && await normalized.isVisible();
  const hasMetric = (await metric.count()) > 0 && await metric.isVisible();

  expect(hasNormalized || hasMetric).toBeTruthy();
});
