import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = new Set(['.ts', '.tsx']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) files.push(full);
  }
}

function relativeImport(fromFile) {
  const fromDir = path.dirname(fromFile);
  const target = path.join(root, 'src', 'libs', 'client', 'server-storage');
  let rel = path.relative(fromDir, target).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function addImport(content, file) {
  if (content.includes('server-storage')) return content;
  const stmt = `import { serverStorage } from '${relativeImport(file)}';\n`;
  if (content.startsWith("'use client';\n\n")) return content.replace("'use client';\n\n", `'use client';\n\n${stmt}`);
  if (content.startsWith('"use client";\n\n')) return content.replace('"use client";\n\n', `"use client";\n\n${stmt}`);
  return stmt + content;
}

walk(path.join(root, 'src'));
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!/localStorage|window\.localStorage/.test(content)) continue;
  content = content
    .replace(/window\.localStorage\./g, 'serverStorage.')
    .replace(/\blocalStorage\./g, 'serverStorage.')
    .replace(/localStorage/g, 'server storage');
  content = addImport(content, file);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`patched ${path.relative(root, file)}`);
}
