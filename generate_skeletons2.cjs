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
  const code = "'use client';\\n" +
"import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';\\n" +
"import { " + p.icon + " } from 'lucide-react';\\n\\n" +
"export default function " + p.path.replace(/-/g, '') + "Page() {\\n" +
"  return (\\n" +
"    <div className=\"space-y-6\">\\n" +
"      <div>\\n" +
"        <h2 className=\"text-2xl font-bold tracking-tight text-slate-900 dark:text-white\">" + p.title + "</h2>\\n" +
"        <p className=\"text-sm text-slate-500\">" + p.desc + "</p>\\n" +
"      </div>\\n" +
"      <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-3\">\\n" +
"        {[1,2,3].map(i => (\\n" +
"          <Card key={i}>\\n" +
"            <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">\\n" +
"              <CardTitle className=\"text-sm font-medium\">Mục {i}</CardTitle>\\n" +
"              <" + p.icon + " className=\"h-4 w-4 text-slate-500\" />\\n" +
"            </CardHeader>\\n" +
"            <CardContent>\\n" +
"              <div className=\"text-2xl font-bold\">...</div>\\n" +
"            </CardContent>\\n" +
"          </Card>\\n" +
"        ))}\\n" +
"      </div>\\n" +
"    </div>\\n" +
"  );\\n" +
"}\\n";
  const dir = 'src/app/[locale]/(admin)/' + p.path;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + '/page.tsx', code, 'utf8');
}
console.log("Done");
