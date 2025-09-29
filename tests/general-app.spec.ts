import { test, expect } from '@playwright/test';
import { seedAdminSession } from './utils/auth';
import { dismissOnboardingIfPresent } from './utils/ui';

test.describe('General App Tests', () => {
  test('should load homepage without errors for visitors', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Sistema Monitoreo Río Claro')).toBeVisible();
    await expect(page.locator('text=Ver Dashboard')).toBeVisible();
    await expect(page.locator('text=Ver Reportes')).toBeVisible();
  });

  test('should redirect authenticated admin from home to dashboard', async ({ page }) => {
    await seedAdminSession(page);
    await page.goto('/');

    await expect(page).toHaveURL('/dashboard');
  await dismissOnboardingIfPresent(page);
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should navigate between admin pages correctly', async ({ page }) => {
    await seedAdminSession(page);
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();

    // Navigate through the admin navigation menu
    await dismissOnboardingIfPresent(page);
    await page.getByRole('link', { name: 'Análisis' }).click();
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('text=Análisis de Datos')).toBeVisible();

    await dismissOnboardingIfPresent(page);
    await page.getByRole('link', { name: 'Historial' }).click();
    await expect(page).toHaveURL('/activity');
    await expect(page.locator('text=Historial del Sistema')).toBeVisible();

    await dismissOnboardingIfPresent(page);
    await page.getByRole('link', { name: 'Alertas' }).click();
    await expect(page).toHaveURL('/alerts/configuration');
    await expect(page.locator('text=Configuración de Alertas')).toBeVisible();

    await dismissOnboardingIfPresent(page);
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL('/admin');
    await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
  });

  test('should handle browser back/forward navigation for admin', async ({ page }) => {
    await seedAdminSession(page);
    await page.goto('/dashboard');

    await dismissOnboardingIfPresent(page);
    await page.getByRole('link', { name: 'Análisis' }).click();
    await expect(page).toHaveURL('/reports');

    await dismissOnboardingIfPresent(page);
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');

    await dismissOnboardingIfPresent(page);
    await page.goForward();
    await expect(page).toHaveURL('/reports');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await seedAdminSession(page);
    await page.goto('/dashboard');

    await dismissOnboardingIfPresent(page);

    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="dashboard-content"] .grid').first()).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="dashboard-content"] .grid').first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="dashboard-content"] .grid').first()).toBeVisible();
  });
});
