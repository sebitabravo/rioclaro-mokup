// Debug script para investigar el problema de Framer Motion
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to dashboard
  await page.goto('http://localhost:5173/dashboard');

  // Wait for content
  await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 5000 });

  // Wait for animations to settle
  await page.waitForTimeout(2000);

  console.log('=== DEBUGGING FRAMER MOTION ELEMENT CLONING ===');

  // Debug 1: Count all elements with data-testid="dashboard-metric-card"
  const allCards = await page.locator('[data-testid="dashboard-metric-card"]').count();
  console.log(`1. Total cards found: ${allCards}`);

  // Debug 2: Count direct children only
  const directChildren = await page.evaluate(() => {
    const grid = document.querySelector('[data-testid="metrics-grid"]');
    if (!grid) return 0;
    return grid.querySelectorAll(':scope > [data-testid="dashboard-metric-card"]').length;
  });
  console.log(`2. Direct children cards: ${directChildren}`);

  // Debug 3: Count visible cards
  const visibleCards = await page.locator('[data-testid="dashboard-metric-card"]:visible').count();
  console.log(`3. Visible cards: ${visibleCards}`);

  // Debug 4: Get HTML structure to see duplicates
  const gridHTML = await page.evaluate(() => {
    const grid = document.querySelector('[data-testid="metrics-grid"]');
    if (!grid) return 'Grid not found';
    return grid.innerHTML;
  });

  console.log('4. Grid HTML structure (first 1000 chars):');
  console.log(gridHTML.substring(0, 1000));

  // Debug 5: Check for motion.div elements
  const motionDivs = await page.locator('div[style*="transform"]').count();
  console.log(`5. Motion divs with transform: ${motionDivs}`);

  // Debug 6: Check for elements with opacity animations
  const opacityElements = await page.locator('div[style*="opacity"]').count();
  console.log(`6. Elements with opacity styles: ${opacityElements}`);

  // Debug 7: Check for Framer Motion specific classes or attributes
  const framerElements = await page.evaluate(() => {
    // Look for any elements that might be created by Framer Motion
    const allDivs = document.querySelectorAll('div');
    let framerRelated = 0;

    allDivs.forEach(div => {
      const style = div.getAttribute('style') || '';
      const classes = div.className || '';

      // Check for Framer Motion specific indicators
      if (style.includes('transform') ||
          style.includes('will-change') ||
          style.includes('backface-visibility') ||
          classes.includes('motion-') ||
          div.hasAttribute('data-framer-motion')) {
        framerRelated++;
      }
    });

    return framerRelated;
  });
  console.log(`7. Framer Motion related elements: ${framerElements}`);

  // Debug 8: Get all cards and their positions
  const cardDetails = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="dashboard-metric-card"]');
    return Array.from(cards).map((card, index) => ({
      index,
      visible: card.offsetParent !== null,
      opacity: getComputedStyle(card).opacity,
      display: getComputedStyle(card).display,
      position: getComputedStyle(card).position,
      transform: getComputedStyle(card).transform,
      rect: card.getBoundingClientRect(),
      textContent: card.textContent.trim().substring(0, 50) + '...'
    }));
  });

  console.log('8. Card details:');
  cardDetails.forEach(card => {
    console.log(`  Card ${card.index}: visible=${card.visible}, opacity=${card.opacity}, text="${card.textContent}"`);
  });

  console.log('\n=== ANALYSIS COMPLETE ===');

  await browser.close();
})();