const fs = require('fs');
const path = require('path');

function getStructure(dir, indent = '') {
  const files = fs.readdirSync(dir);
  let output = '';

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const isLast = index === files.length - 1;
    const prefix = isLast ? '└── ' : '├── ';

    // Ignore node_modules, .git, and dist folders
    if (file === 'node_modules' || file === '.git' || file === 'dist') return;

    output += `${indent}${prefix}${file}\n`;

    if (stats.isDirectory()) {
      output += getStructure(filePath, indent + (isLast ? '    ' : '│   '));
    }
  });
  return output;
}

console.log(getStructure('.'));