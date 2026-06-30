const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace strict paths and links
    content = content.replace(/'\/admin\/?'/g, "'/diaradmin26'");
    content = content.replace(/'\/admin\//g, "'/diaradmin26/");
    
    // Replace JSX paths
    content = content.replace(/"\/admin\/?"/g, '"/diaradmin26"');
    content = content.replace(/"\/admin\//g, '"/diaradmin26/');
    
    // Replace string literals starting with /admin
    content = content.replace(/`\/admin\/?`/g, '`/diaradmin26`');
    content = content.replace(/`\/admin\//g, '`/diaradmin26/');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(directoryPath);
console.log('Done!');
