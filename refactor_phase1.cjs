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

  let hasToast = content.includes('useToast');
  let hasLanguage = content.includes('useLanguage');
  let hasStoreConfig = content.includes('useStoreConfig');

  if (!hasToast && !hasLanguage && !hasStoreConfig) return;

  content = content.replace(/import\s*{\s*useToast\s*}\s*from\s*['"][^'"]+ToastContext['"];?\n?/g, '');
  content = content.replace(/import\s*{\s*useLanguage\s*}\s*from\s*['"][^'"]+LanguageContext['"];?\n?/g, '');
  content = content.replace(/import\s*{\s*useStoreConfig\s*}\s*from\s*['"][^'"]+StoreConfigContext['"];?\n?/g, '');

  if (!content.includes(`import { useStore }`)) {
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + `import { useStore } from '${storePath}';\n` + content.slice(endOfLine + 1);
    } else {
      content = `import { useStore } from '${storePath}';\n` + content;
    }
  }

  // Handle double hooks like `const { addToast } = useToast(); const { t } = useLanguage();`
  // Both would become `const { ... } = useStore();`. This is fine as long as variables are distinct.
  // Wait, if they do `const { config, updateConfig } = useStoreConfig(); const { configLoading } = useStoreConfig();` it's rare.
  // Let's replace the right side of the assignment.
  content = content.replace(/useToast\(\)/g, 'useStore()');
  content = content.replace(/useLanguage\(\)/g, 'useStore()');
  content = content.replace(/useStoreConfig\(\)/g, 'useStore()');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modified++;
    console.log(`Modified ${file}`);
  }
});

console.log(`Refactoring complete. Modified ${modified} files.`);
