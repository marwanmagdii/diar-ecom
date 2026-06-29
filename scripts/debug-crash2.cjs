const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', exception => {
    errors.push(`PageError: ${exception.message}\n${exception.stack}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`ConsoleError: ${msg.text()}`);
    }
  });

  try {
    // Make sure to use localhost:3000 which routes to Vite correctly in this environment
    await page.goto('http://localhost:3000/product/6a396f7ee65961e766f5d126', { waitUntil: 'networkidle' });
    
    // Wait for the page to load
    await page.waitForSelector('.btn-add-cart', { timeout: 5000 });
    
    // Click on "Black" color option if available (it might be a color swatch div)
    try {
      await page.locator('div[title="Black"]').click({ timeout: 2000 });
      console.log('Clicked Black variant');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('Could not click Black variant or not found');
    }

    // Click add to cart
    await page.click('.btn-add-cart');
    console.log('Clicked Add to Cart');
    
    // Wait a bit to see if it crashes
    await page.waitForTimeout(2000);
    
    console.log('Finished interaction.');
    if (errors.length > 0) {
      console.log('ERRORS FOUND:');
      console.log(errors.join('\n\n'));
    } else {
      console.log('NO ERRORS DETECTED.');
    }
  } catch (err) {
    console.error('Script failed:', err);
  } finally {
    await browser.close();
  }
})();
