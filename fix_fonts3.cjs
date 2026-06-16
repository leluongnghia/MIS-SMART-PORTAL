const fs = require('fs');
const content = fs.readFileSync('src/components/admin/admin-shell.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('placeholder=')) {
    lines[i] = lines[i].replace(/placeholder=.*/, 'placeholder="Tìm kiếm nhanh..."');
  }
  if (lines[i].includes('<option>C')) {
    lines[i] = lines[i].replace(/<option>C.*/, '<option>Cơ sở 1 - Trường THPT Minh Khai</option>');
  }
  if (lines[i].includes('ng xu')) {
    lines[i] = lines[i].replace(/.*ng xu.*/, '                    Đăng xuất');
  }
}

fs.writeFileSync('src/components/admin/admin-shell.tsx', lines.join('\n'));
