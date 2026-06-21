const STORAGE_FILE_STATUS = {
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
  'CSVC',
  'Học sinh',
  'Quy trình',
  'Báo cáo',
  'Tài liệu hệ thống',
  'Khác'
];

export const RELATED_MODULES = [
  'Tổng quan điều hành',
  'Công việc & Quy trình',
  'Phê duyệt',
  'Lịch & Sự kiện',
  'Chỉ đạo BGH',
  'Thông báo nội bộ',
  'Chat nội bộ',
  'Quản trị Nhân sự HRM',
  'Quản trị Rủi ro',
  'Tuyển sinh & CRM',
  'CSVC, Thiết bị & Mua sắm',
  'Hồ sơ Học sinh 360',
  'Thời khóa biểu & Giáo án',
  'Lưu trữ & Dữ liệu',
  'Trung tâm báo cáo',
  'Cấu hình hệ thống',
  'Quản lý người dùng & phân quyền',
  'Khác'
];

const FILE_TYPES = [
  'document',
  'spreadsheet',
  'presentation',
  'image',
  'pdf',
  'video',
  'archive',
  'other'
] as const;

const STATUS_STYLES = {
  ACTIVE: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
  ARCHIVED: { label: 'Lưu trữ', color: 'bg-orange-100 text-orange-800' },
  DELETED: { label: 'Đã xóa', color: 'bg-red-100 text-red-800' },
} as const;
