import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix relative imports: from '../something' -> from '../something.js'
  content = content.replace(/from '(\.\.?\/[^']+?)';/g, (match, p1) => {
    if (/\.\w+$/.test(p1)) return match;
    return `from '${p1}.js';`;
  });
  
  content = content.replace(/from "(\.\.?\/[^"]+?)";/g, (match, p1) => {
    if (/\.\w+$/.test(p1)) return match;
    return `from "${p1}.js";`;
  });
  
  // Fix dayjs plugin imports: dayjs/plugin/timezone -> dayjs/plugin/timezone.js
  content = content.replace(/from '(dayjs\/plugin\/[^']+?)';/g, (match, p1) => {
    if (p1.endsWith('.js')) return match;
    return `from '${p1}.js';`;
  });
  
  content = content.replace(/from "(dayjs\/plugin\/[^"]+?)";/g, (match, p1) => {
    if (p1.endsWith('.js')) return match;
    return `from "${p1}.js";`;
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
