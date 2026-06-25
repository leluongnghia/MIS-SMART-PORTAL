import AdmZip from 'adm-zip';
import fs from 'fs';

console.log('Zipping standalone...');
const zip = new AdmZip();
zip.addLocalFolder('./.next/standalone');
zip.writeZip('./app.zip');
console.log('Zipping complete. Created app.zip.');
