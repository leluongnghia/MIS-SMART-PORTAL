const fs = require('fs');

function addImport(file, lib, items) {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('import {') && c.includes(lib)) {
    c = c.replace(new RegExp('import \\\\{([^}]*)\\\\} from [\\'"]' + lib + '[\\'"]'), (match, p1) => {
      const existing = p1.split(',').map(s => s.trim());
      items.forEach(i => { if (!existing.includes(i)) existing.push(i); });
      return 'import { ' + existing.join(', ') + ' } from \'' + lib + '\'';
    });
  } else {
    c = 'import { ' + items.join(', ') + ' } from \'' + lib + '\';\n' + c;
  }
  fs.writeFileSync(file, c);
}

addImport('src/app/[locale]/(admin)/dashboard/dashboard-client.tsx', '@/src/lib/utils', ['cn']);
addImport('src/app/[locale]/(admin)/directives/page.tsx', 'lucide-react', ['ChevronRight', 'ArrowRight']);
addImport('src/app/[locale]/(admin)/kpi/page.tsx', 'lucide-react', ['CheckCircle2', 'AlertTriangle']);
addImport('src/app/[locale]/(admin)/okr/page.tsx', 'lucide-react', ['Users', 'GraduationCap']);
addImport('src/app/[locale]/(admin)/students/page.tsx', 'lucide-react', ['CheckCircle2']);

let pageContent = fs.readFileSync('src/app/[locale]/(admin)/dashboard/page.tsx', 'utf8');
pageContent = pageContent.replace('<DashboardClient locale={locale} stats={stats as any} />', '<DashboardClient />');
fs.writeFileSync('src/app/[locale]/(admin)/dashboard/page.tsx', pageContent);

console.log('Fixed imports');
