import { Page } from '@playwright/test';

export async function dismissOnboardingIfPresent(page: Page) {
  const overlay = page.locator('div.fixed.inset-0.bg-black.bg-opacity-50');
  const dismissPromptButton = page.getByRole('button', { name: 'Más tarde' });
  const skipTourButton = page.getByRole('button', { name: /Omitir Tour/i });
  const closeTourButton = page.getByRole('button', { name: /Cerrar|Finalizar tour/i });

  let promptWasVisible = false;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const isDismissPromptVisible = await dismissPromptButton.isVisible();
    const isSkipTourVisible = await skipTourButton.isVisible();
    const isCloseTourVisible = await closeTourButton.isVisible();
    const isOverlayVisible = await overlay.isVisible();

    if (isDismissPromptVisible) {
      promptWasVisible = true;
      await dismissPromptButton.click();
      await page.waitForTimeout(200);
      continue;
    }

    if (isSkipTourVisible) {
      promptWasVisible = true;
      await skipTourButton.click();
      await page.waitForTimeout(200);
      continue;
    }

    if (isCloseTourVisible) {
      promptWasVisible = true;
      await closeTourButton.click();
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
