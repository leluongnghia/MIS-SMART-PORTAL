const fs = require('fs');
let c;

c = fs.readFileSync('src/app/[locale]/(admin)/dashboard/dashboard-client.tsx', 'utf8');
if (!c.includes('cn } from')) { c = c.replace('import {', 'import { cn } from \"@/src/lib/utils\";\nimport {'); }
fs.writeFileSync('src/app/[locale]/(admin)/dashboard/dashboard-client.tsx', c);

c = fs.readFileSync('src/app/[locale]/(admin)/directives/page.tsx', 'utf8');
if (!c.includes('ChevronRight,')) { c = c.replace('import {', 'import { ChevronRight, ArrowRight, '); }
fs.writeFileSync('src/app/[locale]/(admin)/directives/page.tsx', c);

c = fs.readFileSync('src/app/[locale]/(admin)/kpi/page.tsx', 'utf8');
if (!c.includes('CheckCircle2,')) { c = c.replace('import {', 'import { CheckCircle2, AlertTriangle, '); }
fs.writeFileSync('src/app/[locale]/(admin)/kpi/page.tsx', c);

c = fs.readFileSync('src/app/[locale]/(admin)/okr/page.tsx', 'utf8');
if (!c.includes('Users,')) { c = c.replace('import {', 'import { Users, GraduationCap, '); }
fs.writeFileSync('src/app/[locale]/(admin)/okr/page.tsx', c);

c = fs.readFileSync('src/app/[locale]/(admin)/students/page.tsx', 'utf8');
if (!c.includes('CheckCircle2,')) { c = c.replace('import {', 'import { CheckCircle2, '); }
fs.writeFileSync('src/app/[locale]/(admin)/students/page.tsx', c);

c = fs.readFileSync('src/app/[locale]/(admin)/dashboard/page.tsx', 'utf8');
c = c.replace('<DashboardClient locale={locale} stats={stats as any} />', '<DashboardClient />');
fs.writeFileSync('src/app/[locale]/(admin)/dashboard/page.tsx', c);

