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
    // Go to the edit product page
    await page.goto('http://localhost:3005/admin/products/6a3873b7c4c15d2acf0f3b8a', { waitUntil: 'networkidle' });
    
    // Wait for the form to render (give it 3 seconds to be safe)
    await page.waitForTimeout(3000);
    
    // Take a full-page screenshot and save it directly to the artifacts directory
    await page.screenshot({ 
      path: 'C:\\Users\\MARWAN MAGDY\\.gemini\\antigravity\\brain\\cb6991fd-1358-472f-99e1-d233270a4aaa\\screenshot.png',
      fullPage: true 
    });
    console.log('Screenshot saved successfully!');
    
  } catch (e) {
    console.error('Failed to load page or take screenshot:', e);
  }
  
  await browser.close();
})();
