import { test } from '@playwright/test';

const BASE = 'http://localhost:3000';
const MOBILE = { width: 390, height: 844 };

async function loginAdmin(page) {
  await page.goto(`${BASE}/diaradmin26/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('currentAdmin', 'Marwan');
  });
}

test.describe('Phase 4 Capture', () => {
  test('Capture Dashboard', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await loginAdmin(page);
    await page.goto(`${BASE}/diaradmin26`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.metric-grid', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/phase4-dashboard.png', fullPage: true });
  });

  test('Capture Settings', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await loginAdmin(page);
    await page.goto(`${BASE}/diaradmin26/settings/general`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.admin-content', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/phase4-settings.png', fullPage: true });
  });
});
