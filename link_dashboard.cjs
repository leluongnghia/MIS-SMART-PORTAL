const fs = require('fs');
const file = 'src/app/[locale]/(admin)/dashboard/dashboard-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to add Link to the imports if it doesn't exist
if (!content.includes("import Link from 'next/link';")) {
  content = content.replace("'use client';", "'use client';\nimport Link from 'next/link';");
}

// 1. Xem chi tiết (Top warning cards)
// Học sinh vắng mặt
content = content.replace(
  /<Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">\s*Xem chi tiết\s*<\/Button>/g,
  '<Link href="students"><Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">Xem chi tiết</Button></Link>'
);

// Giáo viên nghỉ phép
content = content.replace(
  /<Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100 hover:text-orange-700">\s*Xem chi tiết\s*<\/Button>/g,
  '<Link href="hrm"><Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100 hover:text-orange-700">Xem chi tiết</Button></Link>'
);

// Báo cáo CSVC hỏng
content = content.replace(
  /<Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-100 hover:text-rose-700">\s*Xem chi tiết\s*<\/Button>/g,
  '<Link href="tasks"><Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-100 hover:text-rose-700">Xem chi tiết</Button></Link>'
);

// 2. Xem tất cả links
content = content.replace(
  /<span>Phê duyệt khẩn cấp<\/span>\s*<a href="#" className="text-blue-600 font-medium">Xem tất cả<\/a>/g,
  '<span>Phê duyệt khẩn cấp</span>\n                <Link href="approvals" className="text-blue-600 font-medium">Xem tất cả</Link>'
);

content = content.replace(
  /<span>Công việc ưu tiên<\/span>\s*<a href="#" className="text-blue-600 font-medium">Xem tất cả<\/a>/g,
  '<span>Công việc ưu tiên</span>\n                <Link href="tasks" className="text-blue-600 font-medium">Xem tất cả</Link>'
);

content = content.replace(
  /<CardTitle className="text-base font-bold">Hoạt động gần đây<\/CardTitle>\s*<a href="#" className="text-xs font-medium text-blue-600">Xem tất cả<\/a>/g,
  '<CardTitle className="text-base font-bold">Hoạt động gần đây</CardTitle>\n                <Link href="events" className="text-xs font-medium text-blue-600">Xem tất cả</Link>'
);

content = content.replace(
  /<h4 className="text-sm font-bold">Rủi ro nổi bật<\/h4>\s*<a href="#" className="text-xs text-blue-600 font-medium">Xem tất cả<\/a>/g,
  '<h4 className="text-sm font-bold">Rủi ro nổi bật</h4>\n                  <Link href="risk" className="text-xs text-blue-600 font-medium">Xem tất cả</Link>'
);

// 3. Buttons that should be Links
content = content.replace(
  /<Button variant="ghost" className="w-full text-sm text-blue-600">\s*Xem tất cả công việc <ChevronRight className="h-4 w-4 ml-1" \/>\s*<\/Button>/g,
  '<Link href="tasks" className="block w-full"><Button variant="ghost" className="w-full text-sm text-blue-600">Xem tất cả công việc <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>'
);

content = content.replace(
  /<Button variant="ghost" className="text-sm text-blue-600 h-auto p-0">\s*Xem phân tích chi tiết <ChevronRight className="h-4 w-4 ml-1" \/>\s*<\/Button>/g,
  '<Link href="reports"><Button variant="ghost" className="text-sm text-blue-600 h-auto p-0">Xem phân tích chi tiết <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>'
);

content = content.replace(
  /<Button variant="ghost" className="text-sm text-blue-600">\s*Xem chi tiết phễu tuyển sinh <ChevronRight className="h-4 w-4 ml-1" \/>\s*<\/Button>/g,
  '<Link href="admissions"><Button variant="ghost" className="text-sm text-blue-600">Xem chi tiết phễu tuyển sinh <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Done");
