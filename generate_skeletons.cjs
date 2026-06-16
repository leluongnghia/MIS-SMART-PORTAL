const fs = require('fs');

const pages = [
  { path: 'approvals', title: 'Phê duyệt', desc: 'Quản lý các yêu cầu phê duyệt', icon: 'UserCheck' },
  { path: 'events', title: 'Lịch & Sự kiện', desc: 'Lịch công tác và sự kiện sắp tới', icon: 'Calendar' },
  { path: 'announcements', title: 'Thông báo nội bộ', desc: 'Thông báo từ Ban Giám Hiệu', icon: 'Bell' },
  { path: 'categories', title: 'Danh mục', desc: 'Quản lý danh mục hệ thống', icon: 'List' },
  { path: 'system-reports', title: 'Báo cáo', desc: 'Báo cáo trích xuất từ hệ thống', icon: 'FileBarChart' },
  { path: 'data', title: 'Kho dữ liệu', desc: 'Lưu trữ và đồng bộ dữ liệu', icon: 'Database' },
  { path: 'settings', title: 'Cấu hình hệ thống', desc: 'Thiết lập tham số phần mềm', icon: 'Settings' }
];

for (const p of pages) {
  const code = `'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ${p.icon} } from 'lucide-react';

export default function ${p.title.replace(/\s+/g, '')}Page() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">${p.title}</h2>
        <p className="text-sm text-slate-500">${p.desc}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mục {i}</CardTitle>
              <${p.icon} className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(\`src/app/[locale]/(admin)/\${p.path}/page.tsx\`, code, 'utf8');
}
console.log("Done");
