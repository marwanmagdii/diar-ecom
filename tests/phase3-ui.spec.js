import { test, expect } from '@playwright/test';

test.describe('Phase 3 - Zustand Auth & Admin Slices', () => {
  test('Admin login and dashboard render', async ({ page }) => {
    // Go to admin login
    await page.goto('http://localhost:3000/admin/login');
    
    // Fill in credentials
    await page.fill('input[type="text"]', 'marwan');
    await page.fill('input[type="password"]', 'Marwan@Diar2026!');
    
    // Click login
    await page.click('button[type="submit"]');
    
    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Verify dashboard renders
    // Look for a link or text that says 'Orders' or 'Dashboard'
    const ordersLink = page.locator('text=Orders').first();
    await expect(ordersLink).toBeVisible();
  });
});
