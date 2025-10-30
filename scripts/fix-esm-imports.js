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
    
    const basename = path.basename(p1);
    
    // Check if it's a known directory with index.js
    if (KNOWN_DIRS.includes(basename)) {
      return `from '${p1}/index.js';`;
    }
    
    // Check if path ends with a known directory (e.g., '../models/user')
    const parts = p1.split('/');
    if (parts.length >= 2) {
      const parentDir = parts[parts.length - 2];
      if (KNOWN_DIRS.includes(parentDir)) {
        // This is a file inside a known directory
        return `from '${p1}.js';`;
      }
    }
    
    return `from '${p1}.js';`;
  });
  
  content = content.replace(/from "(\.\.?\/[^"]+?)";/g, (match, p1) => {
    if (/\.\w+$/.test(p1)) return match;
    
    const basename = path.basename(p1);
    if (KNOWN_DIRS.includes(basename)) {
      return `from "${p1}/index.js";`;
    }
    
    const parts = p1.split('/');
    if (parts.length >= 2) {
      const parentDir = parts[parts.length - 2];
      if (KNOWN_DIRS.includes(parentDir)) {
        return `from "${p1}.js";`;
      }
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
