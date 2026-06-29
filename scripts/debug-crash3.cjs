const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', exception => {
    console.log(`[Browser PageError] ${exception.message}`);
  });

  try {
    await page.goto('http://localhost:3000/product/6a396f7ee65961e766f5d126', { waitUntil: 'networkidle' });
    
    // Explicitly click black using a strict selector
    const blackLocator = page.locator('div[title="Black"]');
    if (await blackLocator.count() > 0) {
      await blackLocator.first().click();
      console.log('[Script] Clicked Black');
      await page.waitForTimeout(1000);
    }

    // Click Add to Cart
    await page.click('.btn-add-cart');
    console.log('[Script] Clicked Add to Cart');
    
    // Wait for effect
    await page.waitForTimeout(3000);
    
    // Check if body is still there and has content
    const bodyContent = await page.textContent('body');
    if (!bodyContent || bodyContent.trim() === '') {
      console.log('[Script] WHITE SCREEN DETECTED: Body is empty!');
    } else {
      console.log('[Script] Body seems to have content, length:', bodyContent.length);
    }
    
  } catch (err) {
    console.error('[Script] Script failed:', err);
  } finally {
    await browser.close();
  }
})();
