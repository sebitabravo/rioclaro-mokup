import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'reports-screenshot.png', fullPage: true });
  console.log('Screenshot saved: reports-screenshot.png');
  await browser.close();
})();
