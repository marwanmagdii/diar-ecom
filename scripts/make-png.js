import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Create a simple HTML page that displays the SVG
  const svgPath = path.resolve(__dirname, '../public/logo.svg');
  
  await page.goto(`file://${svgPath}`);
  
  // Set viewport to 192x192, which is the standard push icon size
  await page.setViewportSize({ width: 192, height: 192 });
  
  // Take screenshot with solid white background
  await page.evaluate(() => {
    document.body.style.backgroundColor = 'white';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    
    // Scale SVG slightly so it has some padding
    const svg = document.querySelector('svg');
    if (svg) {
      svg.style.width = '70%';
      svg.style.height = '70%';
    }
  });

  await page.screenshot({ 
    path: path.resolve(__dirname, '../public/logo.png'),
    omitBackground: false,
    clip: { x: 0, y: 0, width: 192, height: 192 }
  });
  
  await browser.close();
  console.log("Successfully created public/logo.png");
}

convertSvgToPng().catch(console.error);
