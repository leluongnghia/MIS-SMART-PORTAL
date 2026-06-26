import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Preparing standalone folder with assets...');

// 1. Copy public folder if exists
if (fs.existsSync('./public')) {
  console.log('Copying public folder to standalone...');
  copyDirSync('./public', './.next/standalone/public');
} else {
  console.log('No public folder found, skipping.');
}

// 2. Copy .next/static folder
if (fs.existsSync('./.next/static')) {
  console.log('Copying .next/static folder to standalone...');
  copyDirSync('./.next/static', './.next/standalone/.next/static');
} else {
  console.log('Warning: .next/static not found!');
}

console.log('Zipping standalone...');
const zip = new AdmZip();
zip.addLocalFolder('./.next/standalone');
zip.writeZip('./app.zip');
console.log('Zipping complete. Created app.zip.');
