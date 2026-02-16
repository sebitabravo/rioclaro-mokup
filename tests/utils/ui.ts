import { Locator, Page } from '@playwright/test';

async function isVisibleQuick(locator: Locator, timeout = 250): Promise<boolean> {
  try {
    return await locator.first().isVisible({ timeout });
  } catch {
    return false;
  }
}

async function clickQuick(locator: Locator, timeout = 1000): Promise<boolean> {
  try {
    await locator.first().click({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function dismissOnboardingIfPresent(page: Page) {
  const overlay = page.locator('div.fixed.inset-0.bg-black.bg-opacity-50');
  const dismissPromptButton = page.getByRole('button', { name: 'Más tarde' });
  const skipTourButton = page.getByRole('button', { name: /Omitir Tour/i });
  const closeTourButton = page.getByRole('button', { name: /Cerrar|Finalizar tour/i });

  let promptWasVisible = false;

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const isDismissPromptVisible = await isVisibleQuick(dismissPromptButton);
    const isSkipTourVisible = await isVisibleQuick(skipTourButton);
    const isCloseTourVisible = await isVisibleQuick(closeTourButton);
    const isOverlayVisible = await isVisibleQuick(overlay);

    if (isDismissPromptVisible) {
      promptWasVisible = true;
      await clickQuick(dismissPromptButton);
      await page.waitForTimeout(200);
      continue;
    }

    if (isSkipTourVisible) {
      promptWasVisible = true;
      await clickQuick(skipTourButton);
      await page.waitForTimeout(200);
      continue;
    }

    if (isCloseTourVisible) {
      promptWasVisible = true;
      await clickQuick(closeTourButton);
      await page.waitForTimeout(200);
      continue;
    }

    if (isOverlayVisible) {
      promptWasVisible = true;
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      continue;
    }

    if (promptWasVisible) {
      break;
    }

    await page.waitForTimeout(200);
  }

  if (promptWasVisible) {
    await page.evaluate(() => {
      try {
        const sessionStorage = localStorage.getItem('rioclaro-auth-storage');
        if (!sessionStorage) return;

        const session = JSON.parse(sessionStorage);
        const userId = session?.state?.user?.id;
        if (!userId) return;

        const onboardingKey = `rioclaro_onboarding_state_${userId}`;
        const currentState = localStorage.getItem(onboardingKey);
        const parsedState = currentState ? JSON.parse(currentState) : {};

        const updatedState = {
          hasSeenDashboardTour: true,
          hasSeenAdminTour: true,
          hasSeenReportsTour: true,
          hasSeenAlertsTour: true,
          isFirstLogin: false,
          ...parsedState,
        };

        localStorage.setItem(onboardingKey, JSON.stringify(updatedState));
      } catch (error) {
        console.warn('Could not persist onboarding state for tests', error);
      }
    });

    await page.evaluate(() => {
      document
        .querySelectorAll(
          'div.fixed.inset-0.bg-black.bg-opacity-50, [data-testid="onboarding-popover"], [data-testid="onboarding-toast"]'
        )
        .forEach((element) => {
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
          }
        });
    });
  }
}
