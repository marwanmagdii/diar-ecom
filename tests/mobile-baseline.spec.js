import { test } from '@playwright/test';

const BASE = 'http://localhost:3000';
const MOBILE = { width: 390, height: 844 };

const pages = [
  { name: 'dashboard', url: '/diaradmin26', wait: '.metric-grid' },
  { name: 'orders', url: '/diaradmin26/orders', wait: '.admin-page-header' },
  { name: 'users', url: '/diaradmin26/users', wait: '.admin-page-header' },
  { name: 'products', url: '/diaradmin26/products', wait: '.admin-page-header' },
  { name: 'influencers', url: '/diaradmin26/influencers', wait: '.admin-page-header' },
  { name: 'settings', url: '/diaradmin26/settings/general', wait: '.admin-content' },
];

async function loginAdmin(page) {
  await page.goto(`${BASE}/diaradmin26/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Set localStorage directly to bypass login form
  await page.evaluate(() => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('currentAdmin', 'Marwan');
  });
}

test.describe('Phase 1 — Mobile Baseline Screenshots', () => {
  for (const pg of pages) {
    test(`Capture ${pg.name}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: MOBILE });
      const page = await ctx.newPage();

      // Login first
      await loginAdmin(page);

      // Navigate to target page
      await page.goto(`${BASE}${pg.url}`, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Wait for key element
      try {
        await page.waitForSelector(pg.wait, { state: 'visible', timeout: 15000 });
      } catch {
        console.log(`⚠ Selector "${pg.wait}" not found on ${pg.name}`);
      }

      // Extra settle for data loading
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `tests/screenshots/baseline-${pg.name}.png`,
        fullPage: true,
      });

      await ctx.close();
    });
  }
});
