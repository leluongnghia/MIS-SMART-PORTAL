const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/[locale]/(admin)');
files.push('src/components/admin/admin-shell.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content
    .replace(/<Badge([^>]*)variant=(['"]outline['"]|['"]secondary['"])/g, '<Badge$1')
    .replace(/<Button([^>]*)variant=['"]link['"]/g, '<Button$1variant="ghost"');

  if (f.includes('students/page.tsx') && !newContent.includes('CheckCircle2')) {
    newContent = newContent.replace('import {', 'import { CheckCircle2, ');
  }

  if (newContent !== content) {
    fs.writeFileSync(f, newContent, 'utf8');
    console.log('Fixed ' + f);
  }
});
