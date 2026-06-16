
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/dashboard/dashboard-client.tsx");
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /\{\[\s*\{\s*task:\s*'Báo cáo tài chính Quý II\/2025',\s*dept:\s*'Phòng Tài chính',\s*date:\s*'20\/05\/2025'\s*\},\s*\{\s*task:\s*'Rà soát h? so h?c sinh l?p 10',\s*dept:\s*'Phòng Tuy?n sinh',\s*date:\s*'19\/05\/2025'\s*\},\s*\]\.map\(\(act,\s*i\)\s*=>\s*\(/g,
  "(initialData?.actionCenter?.priorityTasks || []).map((act: any, i: number) => ("
);

content = content.replace(
  /\{\[\s*\{\s*time:\s*'16\/05\/2025 09:24',\s*text:\s*'Nguy?n Van Nam dã phê duy?t K? ho?ch d?y h?c HKII',\s*dept:\s*'Phòng Ðào t?o'\s*\},\s*[\s\S]*?\]\.map\(\(act,\s*i\)\s*=>\s*\(/g,
  "(initialData?.recentActivities || []).map((act: any, i: number) => ("
);

content = content.replace(
  /\{\[\s*\{\s*id:\s*'3',\s*text:\s*'R?i ro v? thi?u GV b? môn Toán',\s*tag:\s*'Cao'\s*\},\s*[\s\S]*?\]\.map\(\(r,\s*i\)\s*=>\s*\(/g,
  "(initialData?.risks || []).map((r: any, i: number) => ("
);

fs.writeFileSync(file, content);
console.log("Patched dashboard client.");

