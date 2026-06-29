const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// The block to move
const footerBlockStart = `<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px', gap: '16px' }}>`;
const footerBlockEnd = `</section>\n        )}`;

const reviewBlock = `{/* Global Customer Reviews */}\n        <CustomerReviewsMarquee reviews={config.globalReviewImages} />`;

if (content.includes(footerBlockStart) && content.includes(reviewBlock)) {
  // We need to extract the footer block and place it AFTER the review block.
  // Actually, it's safer to just rewrite the whole section in a targeted way.
  
  // Let's use regex to match the Other Offers section and the review block.
  // Or just do simple string replacements.
  
  // 1. Remove the footer block from its current position
  const startIdx = content.indexOf(footerBlockStart);
  let endIdx = content.indexOf('</section>', startIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const footerBlock = content.substring(startIdx, endIdx);
    
    // Remove it from the original place
    content = content.replace(footerBlock, '');
    
    // 2. Insert it AFTER the Customer Reviews block
    const insertPoint = content.indexOf(reviewBlock) + reviewBlock.length;
    
    const before = content.substring(0, insertPoint);
    const after = content.substring(insertPoint);
    
    content = before + '\n\n        {otherOffers.length > 0 && (\n          ' + footerBlock + '\n        )}' + after;
    
    fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
    console.log('Home.jsx updated successfully.');
  } else {
    console.log('Could not find bounds of footer block');
  }
} else {
  console.log('Could not find strings in Home.jsx');
}
