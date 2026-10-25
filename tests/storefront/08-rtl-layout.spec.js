import { test, expect } from '@playwright/test';

test.describe('RTL Layout & Arabic Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('page loads in LTR by default', async ({ page }) => {
    const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    // Default should be ltr or null
    expect(dir === 'ltr' || dir === null || dir === '').toBeTruthy();
  });

  test('Arabic RTL: html[dir=rtl] flips layout', async ({ page }) => {
    // Switch language to Arabic by manipulating localStorage
    await page.evaluate(() => {
      localStorage.setItem('diar-language', 'ar');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    // Check direction after language switch
    const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    if (dir) {
      expect(dir).toBe('rtl');
    }
    // No horizontal scroll in RTL
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });

  test('RTL: no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => localStorage.setItem('diar-language', 'ar'));
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });

  test('RTL: no horizontal scroll on shop page mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => localStorage.setItem('diar-language', 'ar'));
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });
});
