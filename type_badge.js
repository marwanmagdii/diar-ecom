import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[Browser Error]: ${msg.text()}`);
    else console.log(`[Browser]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`[Browser Uncaught Error]: ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3005/admin/products/6a3873b7c4c15d2acf0f3b8a', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Find the badge input by placeholder and type into it
    const inputs = await page.$$('input[placeholder="e.g., Trending, Best Seller, New"]');
    if (inputs.length > 0) {
      console.log('Found badge input, typing...');
      await inputs[0].click();
      await inputs[0].type('Hello World');
      await page.waitForTimeout(1000); // wait to see if error occurs
      console.log('Typing completed without crashing!');
    } else {
      console.log('Badge input not found!');
    }
  } catch (e) {
    console.error('Failed to load page or test input:', e);
  }
  
  await browser.close();
})();
