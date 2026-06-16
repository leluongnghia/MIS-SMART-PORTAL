import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
walk(path.join(root, 'src'));
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("'use client';")) continue;
  if (content.startsWith("'use client';")) continue;
  content = content.replace(/\n?'use client';\n?/, '\n');
  content = `'use client';\n${content.replace(/^\n+/, '')}`;
  fs.writeFileSync(file, content, 'utf8');
  console.log(`fixed ${path.relative(root, file)}`);
}
