const fs = require('fs');
let content = fs.readFileSync('src/components/admin/admin-shell.tsx', 'utf8');

// The exact string in the file has mojibake for menuGroups
const newMenuGroups = `const menuGroups: MenuItemGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { label: 'Tổng quan điều hành', href: 'dashboard', icon: LayoutDashboard },
      { label: 'Báo cáo nhanh', href: 'reports', icon: FileBarChart },
    ],
  },
  {
    title: 'CHIẾN LƯỢC & KẾ HOẠCH',
    items: [
      { label: 'Chiến lược & OKRs', href: 'okr', icon: Target },
      { label: 'Kế hoạch hoạt động', href: 'plans', icon: ClipboardCheck },
      { label: 'Báo cáo & Phân tích KPI', href: 'kpi', icon: LineChart },
      { label: 'Phân tích & Dự báo', href: 'forecast', icon: TrendingUp },
    ],
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { label: 'Công việc & Quy trình', href: 'tasks', icon: CheckSquare },
      { label: 'Phê duyệt', href: 'approvals', icon: UserCheck },
      { label: 'Lịch & Sự kiện', href: 'events', icon: Calendar },
      { label: 'Thông báo nội bộ', href: 'announcements', icon: Bell },
      { label: 'Quản trị Nhân sự HRM', href: 'hrm', icon: Users },
      { label: 'Quản trị Rủi ro', href: 'risk', icon: ShieldAlert },
      { label: 'Tuyển sinh & CRM', href: 'admissions', icon: Workflow },
      { label: 'Hồ sơ Học sinh 360', href: 'students', icon: GraduationCap },
      { label: 'Thời khóa biểu & Giáo án', href: 'schedule', icon: CalendarDays },
    ],
  },
  {
    title: 'DỮ LIỆU & HỆ THỐNG',
    items: [
      { label: 'Danh mục', href: 'categories', icon: List },
      { label: 'Báo cáo', href: 'system-reports', icon: FileBarChart },
      { label: 'Kho dữ liệu', href: 'data', icon: Database },
      { label: 'Cấu hình hệ thống', href: 'settings', icon: Settings },
    ],
  },
];`;

content = content.replace(/const menuGroups: MenuItemGroup\[\] = \[\s*\{[\s\S]*?\}\,\s*\];/m, newMenuGroups);

// Replace the others manually using regex or string match
content = content.replace(/CÆ¡ sá»Ÿ 1 - TrÆ°á» ng THPT Minh Khai/g, 'Cơ sở 1 - Trường THPT Minh Khai');
content = content.replace(/Nguyá»…n VÄƒn Nam/g, 'Nguyễn Văn Nam');
content = content.replace(/Hiá»‡u trÆ°á»Ÿng/g, 'Hiệu trưởng');
content = content.replace(/CÃ\xa0i Ä‘áº·t tÃ\xa0i khoáº£n/g, 'Cài đặt tài khoản');

fs.writeFileSync('src/components/admin/admin-shell.tsx', content, 'utf8');
