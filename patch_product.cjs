const fs = require('fs');

let productContent = fs.readFileSync('src/pages/Product.jsx', 'utf8');

// 1. Add import if not exists
if (!productContent.includes('import CustomerReviewsMarquee')) {
  productContent = productContent.replace(
    "import ProductCard from '../components/ProductCard';",
    "import ProductCard from '../components/ProductCard';\nimport CustomerReviewsMarquee from '../components/CustomerReviewsMarquee';"
  );
}

// 2. Replace the manual marquee block with the component
const startTag = '{/* Customer Gallery */}';
const endTag = '{/* Lightbox */}';

if (productContent.includes(startTag) && productContent.includes(endTag)) {
  const startIndex = productContent.indexOf(startTag);
  const endIndex = productContent.indexOf(endTag);
  
  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const before = productContent.substring(0, startIndex);
    const after = productContent.substring(endIndex);
    
    productContent = before + startTag + '\n        <CustomerReviewsMarquee reviews={product.reviewImages} />\n\n        ' + after;
  }
}

fs.writeFileSync('src/pages/Product.jsx', productContent, 'utf8');
console.log('Product.jsx updated successfully.');
