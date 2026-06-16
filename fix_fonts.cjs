const fs = require('fs');
let content = fs.readFileSync('src/components/admin/admin-shell.tsx', 'utf8');
const replacements = {
  'Tá»”NG QUAN': 'TỔNG QUAN',
  'Tá»•ng quan Ä‘iá» u hÃ\xa0nh': 'Tổng quan điều hành',
  'BÃ¡o cÃ¡o nhanh': 'Báo cáo nhanh',
  'CHIáº¾N LÆ¯á»¢C & Káº¾ HOáº\xa0CH': 'CHIẾN LƯỢC & KẾ HOẠCH',
  'Chiáº¿n lÆ°á»£c & OKRs': 'Chiến lược & OKRs',
  'Káº¿ hoáº¡ch hoáº¡t Ä‘á»™ng': 'Kế hoạch hoạt động',
  'BÃ¡o cÃ¡o & PhÃ¢n tÃ\xadch KPI': 'Báo cáo & Phân tích KPI',
  'PhÃ¢n tÃ\xadch & Dá»± bÃ¡o': 'Phân tích & Dự báo',
  'Váº¬N HÃ€NH': 'VẬN HÀNH',
  'CÃ´ng viá»‡c & Quy trÃ¬nh': 'Công việc & Quy trình',
  'PhÃª duyá»‡t': 'Phê duyệt',
  'Lá»‹ch & Sá»± kiá»‡n': 'Lịch & Sự kiện',
  'ThÃ´ng bÃ¡o ná»™i bá»™': 'Thông báo nội bộ',
  'Quáº£n trá»‹ NhÃ¢n sá»± HRM': 'Quản trị Nhân sự HRM',
  'Quáº£n trá»‹ Rá»§i ro': 'Quản trị Rủi ro',
  'Tuyá»ƒn sinh & CRM': 'Tuyển sinh & CRM',
  'Há»“ sÆ¡ Há» c sinh 360': 'Hồ sơ Học sinh 360',
  'Thá» i khÃ³a biá»ƒu & GiÃ¡o Ã¡n': 'Thời khóa biểu & Giáo án',
  'Dá»® LIá»†U & Há»† THá» NG': 'DỮ LIỆU & HỆ THỐNG',
  'Danh má»¥c': 'Danh mục',
  'BÃ¡o cÃ¡o': 'Báo cáo',
  'Kho dá»¯ liá»‡u': 'Kho dữ liệu',
  'Cáº¥u hÃ¬nh há»‡ thá»‘ng': 'Cấu hình hệ thống',
  'CÆ¡ sá»Ÿ 1 - TrÆ°á» ng THPT Minh Khai': 'Cơ sở 1 - Trường THPT Minh Khai',
  'Nguyá»…n VÄƒn Nam': 'Nguyễn Văn Nam',
  'Hiá»‡u trÆ°á»Ÿng': 'Hiệu trưởng',
  'CÃ\xa0i Ä‘áº·t tÃ\xa0i khoáº£n': 'Cài đặt tài khoản',
  'BÃ¡o cÃ¡o & PhÃ¢n tÃ­ch KPI': 'Báo cáo & Phân tích KPI',
  'PhÃ¢n tÃ­ch & Dá»± bÃ¡o': 'Phân tích & Dự báo',
  'CÃ\xa0i Ä‘áº·t': 'Cài đặt',
  'Ä‘': 'đ', 'á»': 'ộ', 'Ãª': 'ê', 'Ã´': 'ô', 'Æ°': 'ư', 'áº': 'ạ', 'Ã­': 'í'
};
for (const [bad, good] of Object.entries(replacements)) {
  content = content.split(bad).join(good);
}
fs.writeFileSync('src/components/admin/admin-shell.tsx', content, 'utf8');
console.log('Fixed');
