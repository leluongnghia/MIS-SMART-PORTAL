const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/(admin)/dashboard/dashboard-client.tsx', 'utf8');

content = content.replace(
  '<Link href="students"><Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">Xem chi tiết</Button></Link>',
  '<Link href="tasks"><Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">Xem chi tiết</Button></Link>'
);

content = content.replace(
  '<Link href="hrm"><Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100 hover:text-orange-700">Xem chi tiết</Button></Link>',
  '<Link href="approvals"><Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100 hover:text-orange-700">Xem chi tiết</Button></Link>'
);

content = content.replace(
  '<Link href="tasks"><Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-100 hover:text-rose-700">Xem chi tiết</Button></Link>',
  '<Link href="risk"><Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-100 hover:text-rose-700">Xem chi tiết</Button></Link>'
);

fs.writeFileSync('src/app/[locale]/(admin)/dashboard/dashboard-client.tsx', content, 'utf8');
console.log("Fixed");
