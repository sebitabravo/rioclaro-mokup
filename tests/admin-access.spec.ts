import { expect, test, Page } from '@playwright/test';
import { seedAdminSession } from './utils/auth';

type RouteCheck = {
  path: string;
  expectedPath?: string;
  assertion: (page: Page) => Promise<void>;
};

const routes: RouteCheck[] = [
  {
    path: '/dashboard',
    assertion: async (page) => {
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    },
  },
  {
    path: '/reports',
    assertion: async (page) => {
      await expect(page.getByRole('heading', { name: 'Análisis de Datos' })).toBeVisible();
    },
  },
  {
    path: '/activity',
    assertion: async (page) => {
      await expect(page.getByRole('heading', { name: 'Historial del Sistema' })).toBeVisible();
    },
  },
  {
    path: '/admin',
    assertion: async (page) => {
      await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
    },
  },
  {
    path: '/alerts/configuration',
    assertion: async (page) => {
      await expect(page.getByRole('heading', { name: 'Configuración de Alertas' })).toBeVisible();
    },
  },
];

test.describe('Acceso del administrador a rutas protegidas', () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminSession(page);
  });

  for (const route of routes) {
    test(`el administrador puede acceder a ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      const expectedPath = route.expectedPath ?? route.path;

      await expect(page).toHaveURL((url) => url.pathname === expectedPath);
      await expect(page).not.toHaveURL(/unauthorized/);
      await route.assertion(page);
    });
  }

  test('el administrador que visita la raíz es redirigido al dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL((url) => url.pathname === '/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });
});
