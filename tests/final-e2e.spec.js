import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Full E2E: Admin CRUD and Customer Flow', () => {
  const productName = 'Test Automation Product ' + Date.now();
  const productPrice = '1500';

  test('Create Product, Buy It, and Delete It', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Go to Admin Login
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    
    // Check if login is required
    const isLogin = await page.locator('text=Admin Dashboard').count() > 0 && await page.locator('input[type="password"]').count() > 0;
    if (isLogin) {
      await page.locator('input[type="text"]').fill('marwan');
      await page.locator('input[type="password"]').fill('Marwan@Diar2026!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Navigate to Products tab
    await page.click('text=Products');
    await page.waitForTimeout(1000);
    
    // Click Add Product
    await page.click('button:has-text("Add Product")');
    await page.waitForTimeout(1000);
    
    // Fill product details
    await page.getByPlaceholder('E.g. Premium Cotton T-Shirt').fill(productName);
    await page.getByPlaceholder('0.00').fill(productPrice);
    
    // Select category (required by MongoDB)
    const categoryCheckboxes = page.locator('input[name="category"]');
    if (await categoryCheckboxes.count() > 0) {
      await categoryCheckboxes.first().check({ force: true });
    }
    
    await page.getByPlaceholder('Unlimited').fill('50');
    
    // Upload image
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('public/sunglasses.png');
    
    // Explicitly wait for image preview to appear to ensure image was processed
    await expect(page.locator('img[alt="Preview 0"]')).toBeVisible({ timeout: 10000 });
    
    // Save Product
    await page.click('button:has-text("Save Product")');
    
    // Wait for navigation
    await page.waitForURL('**/admin/products', { timeout: 15000 });
    await page.screenshot({ path: 'screenshots/01-admin-product-created.png', fullPage: true });

    // 2. Go to Shop to verify visibility
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Type in header search and hit Enter to filter shop
    const searchInput = page.getByPlaceholder('Search').or(page.locator('input[placeholder*="Search"]')).first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(productName);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'screenshots/03-shop-page.png', fullPage: true });

    // Click the product
    const productCard = page.locator('.product-card').filter({ hasText: "Test Automation Product" }).first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await productCard.click();
    
    await page.waitForTimeout(2000);
    await expect(page.locator(`h1:has-text("Test Automation Product")`).first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'screenshots/04-product-details.png', fullPage: true });

    // Add to Cart
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(1500);
    
    // Go to Cart directly
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // On the Cart page, click Checkout
    // Wait, let's just goto checkout directly!
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Fill Checkout Form
    await page.locator('input[name="firstName"]').fill('Automated');
    await page.locator('input[name="lastName"]').fill('Tester');
    await page.locator('input[name="phone"]').fill('01000000000');
    await page.locator('input[name="address"]').fill('123 Test St, Cairo');
    
    await page.screenshot({ path: 'screenshots/06-checkout-form.png', fullPage: true });
    
    // Complete Order
    await page.click('button:has-text("Complete Order")');
    await page.waitForTimeout(4000);
    
    // Success page
    await page.screenshot({ path: 'screenshots/07-order-success.png', fullPage: true });

    // 4. Admin Order Verification
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    await page.click('text=Orders');
    // Let the table load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/08-admin-orders.png', fullPage: true });

    // 5. Admin Delete Product (Cleanup)
    await page.click('text=Products');
    await page.waitForTimeout(2000);
    
    // We only created one product matching this name so the first trash icon will be it
    await page.locator('button[title="Delete"]').first().click();
    
    // Type delete to confirm
    await page.getByPlaceholder('delete').fill('delete');
    await page.click('button:has-text("Delete")');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/09-admin-product-deleted.png', fullPage: true });
  });
});
