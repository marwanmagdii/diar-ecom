const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// The block to move
const reviewBlock = `{/* Global Customer Reviews */}\n        <CustomerReviewsMarquee reviews={config.globalReviewImages} />`;

if (content.includes(reviewBlock)) {
  content = content.replace(reviewBlock, '');
  
  const insertTarget = '{otherOffers.length > 0 && (\n          <div style={{ display: \'flex\', flexDirection: \'column\', alignItems: \'center\', marginTop: \'24px\', gap: \'16px\' }}>';
  
  if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, reviewBlock + '\n\n        ' + insertTarget);
    fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
    console.log('Home.jsx layout fixed perfectly.');
  } else {
    console.log('Could not find insertTarget');
  }
} else {
  console.log('Could not find reviewBlock');
}
