import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Known directories that have index.js files
const KNOWN_DIRS = ['models', 'utils', 'routes'];

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix relative imports
  content = content.replace(/from '(\.\.?\/[^']+?)';/g, (match, p1) => {
    if (/\.\w+$/.test(p1)) return match; // Already has extension
    
    // Check if it's a known directory
    const basename = path.basename(p1);
    if (KNOWN_DIRS.includes(basename)) {
      return `from '${p1}/index.js';`;
    }
    
    return `from '${p1}.js';`;
  });
  
  content = content.replace(/from "(\.\.?\/[^"]+?)";/g, (match, p1) => {
    if (/\.\w+$/.test(p1)) return match;
    
    const basename = path.basename(p1);
    if (KNOWN_DIRS.includes(basename)) {
      return `from "${p1}/index.js";`;
    }
    
    return `from "${p1}.js";`;
  });
  
  // Fix dayjs plugin imports
  content = content.replace(/from '(dayjs\/plugin\/[^']+?)';/g, (match, p1) => {
    if (p1.endsWith('.js')) return match;
    return `from '${p1}.js';`;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${filePath}`);
  }
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) fixImportsInFile(p);
  }
}

walk('./dist/server');
console.log('✅ ESM imports fixed');
