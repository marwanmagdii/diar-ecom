import { test, expect } from '@playwright/test';

test.describe('Phase 2 - Zustand Cart & Product Slices', () => {
  test('Products load on shop page', async ({ page }) => {
    await page.goto('http://localhost:3000/shop');
    
    // Wait for the "Best Seller" or "ProductCard" to be visible
    // We can just wait for any product image or title
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
  });

  test('Add to Cart updates cart count and total', async ({ page }) => {
    await page.goto('http://localhost:3000/shop');
    
    // Wait for products to load
    await page.waitForSelector('.product-card', { timeout: 10000 });
    
    // Check initial cart count (assuming it's displayed in header)
    // In many e-commerce, it's a badge
    const cartBadge = page.locator('.cart-badge, .cart-count').first();
    let initialCount = 0;
    if (await cartBadge.isVisible()) {
      initialCount = parseInt(await cartBadge.innerText(), 10) || 0;
    }
    
    // Click Add to Cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("أضف للسلة")').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    
    // Wait for Toast to appear (from Phase 1)
    await expect(page.locator('.toast').first()).toBeVisible();
    
    // Check if cart count increased
    // Sometimes it takes a moment to update
    await page.waitForTimeout(500);
    if (await cartBadge.isVisible()) {
      const newCount = parseInt(await cartBadge.innerText(), 10) || 0;
      expect(newCount).toBeGreaterThan(initialCount);
    }
    
    // Go to Cart page
    await page.goto('http://localhost:3000/cart');
    
    // Check that cart total is displayed (subtotal or total)
    const cartTotal = page.locator('text=Total').first();
    await expect(cartTotal).toBeVisible();
    
    const removeBtn = page.locator('.btn-remove, button:has-text("Remove"), button:has-text("حذف")').first();
    if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForTimeout(500); // let state update
        // Cart should be empty or have less items
    }
  });
});
