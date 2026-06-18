export const STORAGE_FILE_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
} as const;

export const STORAGE_SCOPE = {
  PRIVATE: 'PRIVATE',
  DEPARTMENT: 'DEPARTMENT',
  SCHOOL_WIDE: 'SCHOOL_WIDE',
  ADMIN_ONLY: 'ADMIN_ONLY',
} as const;

export const FILE_CATEGORIES = [
  'Văn bản điều hành',
  'Biểu mẫu',
  'Tuyển sinh',
  'Nhân sự',
  'Học sinh',
  'Quy trình',
  'Báo cáo',
  'Tài liệu hệ thống',
  'Khác'
];

export const RELATED_MODULES = [
  'Tổng quan',
  'Công việc & Quy trình',
  'Phê duyệt',
  'Lịch & Sự kiện',
  'Chỉ đạo BGH',
  'Thông báo nội bộ',
  'Quản trị Nhân sự HRM',
  'Quản trị Rủi ro',
  'Tuyển sinh & CRM',
  'Hồ sơ Học sinh 360',
  'Thời khóa biểu & Giáo án',
  'Chat nội bộ',
  'Báo cáo',
  'Cấu hình hệ thống',
  'Khác'
];
