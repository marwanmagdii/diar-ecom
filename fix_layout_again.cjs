const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// The block to move
const reviewBlock = `{/* Global Customer Reviews */}\n        <CustomerReviewsMarquee reviews={config.globalReviewImages} />`;

if (content.includes(reviewBlock)) {
  content = content.replace(reviewBlock, '');
  
  const insertTarget = '        <div ref={bottomRef} style={{ textAlign: \'center\', margin: \'48px 0\' }}>';
  
  if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, reviewBlock + '\n\n' + insertTarget);
    fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
    console.log('Home.jsx layout updated successfully.');
  } else {
    console.log('Could not find insertTarget');
  }
} else {
  console.log('Could not find reviewBlock');
}
