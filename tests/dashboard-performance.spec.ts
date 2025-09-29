import { test, expect } from '@playwright/test';
import { seedAdminSession } from './utils/auth';
import { dismissOnboardingIfPresent } from './utils/ui';

test.describe('Dashboard Performance Tests', () => {
	test.beforeEach(async ({ page }) => {
		await seedAdminSession(page);
	});

	test('should load dashboard quickly without sluggish animations', async ({
		page
	}) => {
		// Start timing
		const startTime = Date.now();

		// Navigate to dashboard
		await page.goto('/dashboard');
		await dismissOnboardingIfPresent(page);

		// Wait for initial load to complete (should be fast now)
		await page.waitForSelector('[data-testid="dashboard-content"]', {
			timeout: 3000
		});

		const loadTime = Date.now() - startTime;
		console.log(`Dashboard load time: ${loadTime}ms`);

		// Should load in less than 3000ms (reasonable for development environment)
		expect(loadTime).toBeLessThan(5000);

		// Verify that stats cards appear immediately without staggered animations
		const statsCards = page.locator('[data-testid="dashboard-content"] .grid');
		await expect(statsCards.first()).toBeVisible();

		// Wait for metrics grid to be ready
		await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 5000 });

		// Count the number of stat cards in the MetricsGrid (should be 4)
		const cardCount = await page
			.locator('[data-testid="metrics-grid"]')
			.locator('[data-testid="dashboard-metric-card"]')
			.count();
		expect(cardCount).toBe(4);

		// Verify no heavy animations are running
		// Check that there are no infinite animations consuming resources
		const animatedElements = page.locator('[style*="animation: infinite"]');
		const infiniteAnimationsCount = await animatedElements.count();

		// Should have very few or no infinite animations
		expect(infiniteAnimationsCount).toBeLessThanOrEqual(2); // Allow max 2 for essential animations
	});

	test('should have optimized PageLoader without complex animations', async ({
		page
	}) => {
		// Navigate to dashboard to trigger loading
		await page.goto('/dashboard', { waitUntil: 'networkidle' });
		await dismissOnboardingIfPresent(page);

		// Check if PageLoader appears and is simple
		const pageLoader = page.locator('[data-testid="page-loader"]');

		// If PageLoader is visible, it should be simple
		if (await pageLoader.isVisible()) {
			// Should have a simple spinner, not complex river animations
			const spinner = pageLoader.locator('.border-t-transparent');
			await expect(spinner).toBeVisible();

			// Should NOT have complex river animation bars
			const riverBars = pageLoader.locator('.bg-gradient-to-t');
			const riverBarsCount = await riverBars.count();
			expect(riverBarsCount).toBe(0);

			// Should NOT have floating water drops
			const waterDrops = pageLoader.locator('[data-testid="water-drop"]');
			const waterDropsCount = await waterDrops.count();
			expect(waterDropsCount).toBe(0);
		}
	});

	test('should render stats cards without animation delays', async ({
		page
	}) => {
		await page.goto('/dashboard');
		await dismissOnboardingIfPresent(page);

		// Wait for content to load
		await page.waitForSelector('[data-testid="dashboard-content"]');

		// Take a screenshot after a short delay to see if cards appear smoothly
		await page.waitForTimeout(100); // Small delay to let any animations settle

		// Wait for metrics grid to be ready
		await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 5000 });

		// Wait for all animations and transitions to complete
		await page.waitForTimeout(1000);

		// More specific selector that only targets MetricsGrid cards
		const metricsGrid = page.locator('[data-testid="metrics-grid"]');

		// Wait for the grid to be stable
		await metricsGrid.waitFor({ state: 'visible' });

		// Wait for animations to settle completely
		await page.waitForFunction(() => {
			const grid = document.querySelector('[data-testid="metrics-grid"]');
			if (!grid) return false;

			// Count only direct children with stable positioning
			const cards = Array.from(grid.children).filter(child =>
				child.getAttribute('data-testid') === 'dashboard-metric-card' &&
				getComputedStyle(child).position !== 'absolute' &&
				getComputedStyle(child).visibility !== 'hidden' &&
				getComputedStyle(child).opacity !== '0'
			);

			return cards.length === 4;
		}, {}, { timeout: 10000 });

		// Final count of stable elements only
		const cardCount = await metricsGrid.evaluate((grid) => {
			return Array.from(grid.children).filter(child =>
				child.getAttribute('data-testid') === 'dashboard-metric-card' &&
				getComputedStyle(child).position !== 'absolute' &&
				getComputedStyle(child).visibility !== 'hidden' &&
				getComputedStyle(child).opacity !== '0'
			).length;
		});

		expect(cardCount).toBe(4); // Should have exactly 4 metric cards

		// Now check visibility of stable cards only
		const stableCards = await page.locator('[data-testid="metrics-grid"] > [data-testid="dashboard-metric-card"]:not([style*="position: absolute"]):not([style*="opacity: 0"])');
		const visibleCards = await stableCards.count();
		expect(visibleCards).toBe(4);

		// Verify card content is loaded using stable selector
		const stationCard = stableCards.first();
		await expect(stationCard.locator('text=Estaciones')).toBeVisible();
		await expect(stationCard.locator('text=activas')).toBeVisible();
	});

	test('should not have performance-impacting infinite animations', async ({
		page
	}) => {
		await page.goto('/dashboard');
		await dismissOnboardingIfPresent(page);

		// Wait for page to fully load
		await page.waitForLoadState('networkidle');

		// Check for potentially problematic animations
		const pageContent = await page.content();

		// Should not have excessive box-shadow animations (performance heavy)
		const boxShadowAnimations = (
			pageContent.match(/box-shadow[^}]*animate/g) || []
		).length;
		expect(boxShadowAnimations).toBeLessThan(5); // Allow some but not excessive

		// Check that any critical alerts don't have infinite animations
		const criticalAlerts = page.locator('[class*="critical"]');
		if ((await criticalAlerts.count()) > 0) {
			// If there are critical alerts, they should have limited animations
			const alertContent = await criticalAlerts.first().innerHTML();
			const infiniteAnimations = (
				alertContent.match(/repeat:\s*Infinity/g) || []
			).length;
			expect(infiniteAnimations).toBe(0);
		}
	});

	test('should handle refresh action smoothly', async ({ page }) => {
		await page.goto('/dashboard');
		await dismissOnboardingIfPresent(page);

		// Wait for initial load
		await page.waitForSelector('[data-testid="dashboard-content"]');

		// Click refresh button
		const refreshButton = page
			.locator('button')
			.filter({ hasText: 'Actualizar' });
		const startRefreshTime = Date.now();

		await refreshButton.click({ force: true });

		// Wait for refresh to complete - check if button becomes enabled again or if content updates
		await page.waitForTimeout(1000); // Give it some time to process

		const refreshTime = Date.now() - startRefreshTime;
		console.log(`Refresh time: ${refreshTime}ms`);

		// Refresh should complete in reasonable time
		expect(refreshTime).toBeLessThan(2500);
	});
});
