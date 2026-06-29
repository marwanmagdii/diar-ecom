const fs = require('fs');

let homeContent = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Add import if not exists
if (!homeContent.includes('import CustomerReviewsMarquee')) {
  homeContent = homeContent.replace(
    "import ProductCard from '../components/ProductCard';",
    "import ProductCard from '../components/ProductCard';\nimport CustomerReviewsMarquee from '../components/CustomerReviewsMarquee';"
  );
}

// 2. Replace the manual marquee block with the component
const startTag = '{/* Customer Reviews Section */}';
const endTag = '{/* Lightbox */}';
const altEndTag = '</main>';

let startIndex = homeContent.indexOf(startTag);
if (startIndex !== -1) {
  let endIndex = homeContent.indexOf(endTag);
  if (endIndex === -1) {
     // If lightbox block is missing or something, try finding </main>
     endIndex = homeContent.indexOf(altEndTag);
  }
  
  if (endIndex !== -1 && startIndex < endIndex) {
    const before = homeContent.substring(0, startIndex);
    
    // We only want to replace the Customer Reviews section, not EVERYTHING up to </main>
    // Let's find the closing tag of the <section> that contains the customer reviews
    let sectionCode = homeContent.substring(startIndex, endIndex);
    
    if (endIndex === homeContent.indexOf(altEndTag)) {
       // Just find the last section before main closes
       // Actually it's easier to just do a string replacement on the whole block
    }
    
    // Let's use regex to replace the section
    // Actually, Home.jsx doesn't have reviewImages on a `product` object, it uses `storeConfig?.reviews?.images` or `reviewSettings?.images`. Let's check how it gets images.
  }
}

// Read Home.jsx to see how it gets images
console.log(homeContent.includes('storeConfig?.reviews?.images'));
console.log(homeContent.includes('config?.reviews?.images'));
