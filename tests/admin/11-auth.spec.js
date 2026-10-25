import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('redirects unauthenticated user from /diaradmin26 to login', async ({ page }) => {
    await page.goto('/diaradmin26');
    await page.waitForLoadState('domcontentloaded');
    // Should be on the login page
    await expect(page).toHaveURL(/login/);
  });

  test('redirects unauthenticated user from /diaradmin26/orders to login', async ({ page }) => {
    await page.goto('/diaradmin26/orders');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    // Email/password form should exist
    const emailInput = page.locator('input[type="email"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    const emailInput = page.locator('input[type="email"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"], .btn-primary').first();
    await emailInput.fill('wrong@test.com');
    await passwordInput.fill('wrongpassword');
    await submitBtn.click();
    // Should show an error (toast or inline error)
    await page.waitForTimeout(2000);
    const errorVisible = await page.locator('.toast, [class*="error"], [class*="alert"]').isVisible();
    expect(errorVisible).toBeTruthy();
  });

  test('login page has no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/diaradmin26/login');
    await page.waitForLoadState('domcontentloaded');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });
});
