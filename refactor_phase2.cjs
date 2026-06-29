const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let modified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  const depth = file.split(path.sep).length - path.join(__dirname, 'src').split(path.sep).length - 1;
  const storePath = depth === 0 ? './store' : '../'.repeat(depth) + 'store';

  let hasCart = content.includes('useCart');
  let hasProducts = content.includes('useProducts');

  if (!hasCart && !hasProducts) return;

  content = content.replace(/import\s*{\s*useCart\s*}\s*from\s*['"][^'"]+CartContext['"];?\n?/g, '');
  content = content.replace(/import\s*{\s*useProducts\s*}\s*from\s*['"][^'"]+ProductContext['"];?\n?/g, '');

  if (!content.includes(`import { useStore }`)) {
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + `import { useStore } from '${storePath}';\n` + content.slice(endOfLine + 1);
    } else {
      content = `import { useStore } from '${storePath}';\n` + content;
    }
  }

  content = content.replace(/useCart\(\)/g, 'useStore()');
  content = content.replace(/useProducts\(\)/g, 'useStore()');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modified++;
    console.log(`Modified ${file}`);
  }
});

console.log(`Phase 2 refactoring complete. Modified ${modified} files.`);
