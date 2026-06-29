const fs = require('fs');

let content = fs.readFileSync('src/store/index.js', 'utf8');

// 1. Remove the WELCOME10 dummy promo code
const dummyPromoRegex = /promoCodes:\s*\[\s*\{\s*id:\s*'promo1'[\s\S]*?\}\s*\]/;
content = content.replace(dummyPromoRegex, 'promoCodes: []');

// 2. Fix fetchConfig so it doesn't force default promo codes when empty
const syncPromoRegex = /if\s*\(!parsed\.promoCodes\s*\|\|\s*parsed\.promoCodes\.length\s*===\s*0\)\s*\{\s*parsed\.promoCodes\s*=\s*defaultSettings\.promoCodes;\s*needsSync\s*=\s*true;\s*\}\s*else\s*\{([\s\S]*?)\}/;

content = content.replace(syncPromoRegex, `if (!parsed.promoCodes) {
          parsed.promoCodes = [];
        } else {
$1}`);

fs.writeFileSync('src/store/index.js', content, 'utf8');
console.log('Fixed store/index.js');
