const fs = require('fs');
let content = fs.readFileSync('src/components/admin/admin-shell.tsx', 'utf8');
content = content.replace(
  "{ label: 'Thông báo nội bộ', href: 'announcements', icon: Bell },",
  "{ label: 'Chỉ đạo BGH', href: 'directives', icon: ClipboardCheck },\n      { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell },"
);
fs.writeFileSync('src/components/admin/admin-shell.tsx', content);
