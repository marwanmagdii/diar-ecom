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

test('Capture Order Details', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: MOBILE });
  const page = await ctx.newPage();

  // Login first
  await loginAdmin(page);

  // Go to orders page
  await page.goto(`${BASE}/diaradmin26/orders`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('.admin-table tbody tr', { timeout: 10000 });

  // Click the View Details button in the first row
  const viewBtn = page.locator('button[title="View Details"]').first();
  await viewBtn.click();
  
  // Wait for navigation and layout
  await page.waitForURL(/\/diaradmin26\/orders\/.+/);
  await page.waitForSelector('.admin-order-layout', { timeout: 15000 });
  
  // Wait an extra second for data to load fully
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'tests/screenshots/orderdetails.png', fullPage: true });
  console.log('Successfully captured OrderDetails');
});
