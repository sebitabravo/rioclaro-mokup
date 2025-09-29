import { Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

export const adminUser = {
  id: 2,
  username: 'admin',
  email: 'admin@rioclaro.gov.co',
  first_name: 'Administrador',
  last_name: 'Sistema',
  role: 'Administrador' as const,
  is_staff: true,
  is_superuser: true,
  assigned_stations: [1, 2, 3],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function createAdminToken() {
  const payload = {
    userId: adminUser.id,
    username: adminUser.username,
    role: adminUser.role,
    timestamp: Date.now(),
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function seedAdminSession(page: Page) {
  const adminStorageState = {
    state: {
      user: adminUser,
      token: createAdminToken(),
      isAuthenticated: true,
    },
    version: 0,
  };

  const onboardingState = {
    hasSeenDashboardTour: false,
    hasSeenAdminTour: false,
    hasSeenReportsTour: false,
    hasSeenAlertsTour: false,
    isFirstLogin: true,
  };

  await page.addInitScript(({ session, onboarding }) => {
    window.localStorage.setItem('rioclaro-auth-storage', JSON.stringify(session));
    window.localStorage.setItem(`rioclaro_onboarding_state_${session.state.user.id}`, JSON.stringify(onboarding));
  }, { session: adminStorageState, onboarding: onboardingState });
}
