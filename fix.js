const fs = require('fs');

function fixFile(p) {
  let c = fs.readFileSync(p, 'utf8');
  
  // Fix toast
  c = c.replace(/variant:\s*['"]destructive['"]/g, "variant: 'error'");
  c = c.replace(/description:/g, 'message:');
  
  // If a toast doesn't have a variant but had 'Thành công', add success
  c = c.replace(/toast\(\{\s*title:\s*['"]Thành công['"],\s*message:\s*([^}]+)\}\)/g, "toast({ title: 'Thành công', message: $1, variant: 'success' })");
  c = c.replace(/toast\(\{\s*title:\s*['"]Kết quả['"],\s*message:\s*([^}]+)\}\)/g, "toast({ title: 'Kết quả', message: $1, variant: 'success' })");
  c = c.replace(/toast\(\{\s*title:\s*['"]Đang xử lý['"],\s*message:\s*([^}]+)\}\)/g, "toast({ title: 'Đang xử lý', message: $1, variant: 'info' })");

  // Fix Label
  c = c.replace(/import\s+\{\s*Label\s*\}\s+from\s+['"]@\/src\/components\/ui\/(label|input)['"];?/g, '');
  c = c.replace(/<Label\s+htmlFor=([^\s>]+)\s*className=([^\s>]+)>/g, '<label htmlFor=$1 className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${$2}`}>');
  c = c.replace(/<Label\s+htmlFor=([^\s>]+)>/g, '<label htmlFor=$1 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">');
  c = c.replace(/<Label>/g, '<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">');
  c = c.replace(/<\/Label>/g, '</label>');

  fs.writeFileSync(p, c);
}

['src/app/[locale]/(admin)/system-data/categories/categories-client.tsx',
 'src/app/[locale]/(admin)/system-data/reports/reports-client.tsx',
 'src/app/[locale]/(admin)/system-data/settings/settings-client.tsx',
 'src/app/[locale]/(admin)/system-data/storage/storage-client.tsx'].forEach(fixFile);

// Add formatBytes to storage-client
let sto = fs.readFileSync('src/app/[locale]/(admin)/system-data/storage/storage-client.tsx', 'utf8');
sto = sto.replace(/import \{ formatBytes \} from '@\/src\/lib\/utils';/, '');
if (!sto.includes('function formatBytes')) {
  sto += '\nfunction formatBytes(bytes: number, decimals = 2) {\n  if (!+bytes) return "0 Bytes";\n  const k = 1024;\n  const dm = decimals < 0 ? 0 : decimals;\n  const sizes = ["Bytes", "KiB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];\n  const i = Math.floor(Math.log(bytes) / Math.log(k));\n  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;\n}\n';
}
fs.writeFileSync('src/app/[locale]/(admin)/system-data/storage/storage-client.tsx', sto);

// Replace missing dialog components in categories-client
let cat = fs.readFileSync('src/app/[locale]/(admin)/system-data/categories/categories-client.tsx', 'utf8');
cat = cat.replace(/<DialogTitle>(.*?)<\/DialogTitle>/g, '<h2 className="text-lg font-black">$1</h2>');
cat = cat.replace(/<DialogHeader>/g, '<div className="mb-4">');
cat = cat.replace(/<\/DialogHeader>/g, '</div>');
cat = cat.replace(/<DialogFooter>/g, '<div className="mt-4 flex justify-end gap-2">');
cat = cat.replace(/<\/DialogFooter>/g, '</div>');
cat = cat.replace(/<DialogContent.*?>/g, '<div className="p-4">');
cat = cat.replace(/<\/DialogContent>/g, '</div>');
fs.writeFileSync('src/app/[locale]/(admin)/system-data/categories/categories-client.tsx', cat);
