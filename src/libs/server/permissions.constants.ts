export const PERMISSION_MODULES = [
  { code: 'SYSTEM', name: 'Hệ thống', sortOrder: 1, isSystem: true },
  { code: 'ACADEMIC', name: 'Học vụ', sortOrder: 2, isSystem: false },
  { code: 'ADMISSIONS', name: 'Tuyển sinh', sortOrder: 3, isSystem: false },
  { code: 'HR', name: 'Nhân sự', sortOrder: 4, isSystem: false },
  { code: 'FINANCE', name: 'Tài chính', sortOrder: 5, isSystem: false },
  { code: 'FACILITIES', name: 'Cơ sở vật chất', sortOrder: 6, isSystem: false },
];

export const PERMISSION_FEATURES = [
  // SYSTEM
  { moduleCode: 'SYSTEM', code: 'SYSTEM.USERS', name: 'Quản lý người dùng' },
  { moduleCode: 'SYSTEM', code: 'SYSTEM.ROLES', name: 'Quản lý vai trò & phân quyền' },
  { moduleCode: 'SYSTEM', code: 'SYSTEM.SETTINGS', name: 'Cấu hình hệ thống' },

  // ACADEMIC
  { moduleCode: 'ACADEMIC', code: 'ACADEMIC.STUDENTS', name: 'Quản lý học sinh' },
  { moduleCode: 'ACADEMIC', code: 'ACADEMIC.CLASSES', name: 'Quản lý lớp học' },
  { moduleCode: 'ACADEMIC', code: 'ACADEMIC.GRADES', name: 'Quản lý điểm số' },
  { moduleCode: 'ACADEMIC', code: 'ACADEMIC.SCHEDULE', name: 'Thời khoá biểu' },

  // ADMISSIONS
  { moduleCode: 'ADMISSIONS', code: 'ADMISSIONS.LEADS', name: 'Quản lý Lead' },
  { moduleCode: 'ADMISSIONS', code: 'ADMISSIONS.CAMPAIGNS', name: 'Chiến dịch tuyển sinh' },

  // HR
  { moduleCode: 'HR', code: 'HR.EMPLOYEES', name: 'Hồ sơ nhân sự' },
  { moduleCode: 'HR', code: 'HR.ATTENDANCE', name: 'Chấm công' },
  { moduleCode: 'HR', code: 'HR.PAYROLL', name: 'Tính lương' },

  // FINANCE
  { moduleCode: 'FINANCE', code: 'FINANCE.FEES', name: 'Thu học phí' },
  { moduleCode: 'FINANCE', code: 'FINANCE.EXPENSES', name: 'Chi phí' },

  // FACILITIES
  { moduleCode: 'FACILITIES', code: 'FACILITIES.ASSETS', name: 'Tài sản' },
  { moduleCode: 'FACILITIES', code: 'FACILITIES.REPAIRS', name: 'Sửa chữa' },
];

export const PERMISSIONS = [
  // SYSTEM.USERS
  { featureCode: 'SYSTEM.USERS', code: 'SYSTEM.USERS.VIEW', action: 'VIEW', name: 'Xem người dùng' },
  { featureCode: 'SYSTEM.USERS', code: 'SYSTEM.USERS.CREATE', action: 'CREATE', name: 'Thêm người dùng' },
  { featureCode: 'SYSTEM.USERS', code: 'SYSTEM.USERS.UPDATE', action: 'UPDATE', name: 'Sửa người dùng' },
  { featureCode: 'SYSTEM.USERS', code: 'SYSTEM.USERS.DELETE', action: 'DELETE', name: 'Xoá người dùng' },

  // SYSTEM.ROLES
  { featureCode: 'SYSTEM.ROLES', code: 'SYSTEM.ROLES.MANAGE', action: 'MANAGE', name: 'Quản lý phân quyền' },

  // ADMISSIONS.LEADS
  { featureCode: 'ADMISSIONS.LEADS', code: 'ADMISSIONS.LEADS.VIEW', action: 'VIEW', name: 'Xem leads' },
  { featureCode: 'ADMISSIONS.LEADS', code: 'ADMISSIONS.LEADS.CREATE', action: 'CREATE', name: 'Thêm lead' },
  { featureCode: 'ADMISSIONS.LEADS', code: 'ADMISSIONS.LEADS.UPDATE', action: 'UPDATE', name: 'Sửa lead' },
  { featureCode: 'ADMISSIONS.LEADS', code: 'ADMISSIONS.LEADS.DELETE', action: 'DELETE', name: 'Xoá lead' },
  
  // ACADEMIC.STUDENTS
  { featureCode: 'ACADEMIC.STUDENTS', code: 'ACADEMIC.STUDENTS.VIEW', action: 'VIEW', name: 'Xem hồ sơ học sinh' },
  { featureCode: 'ACADEMIC.STUDENTS', code: 'ACADEMIC.STUDENTS.CREATE', action: 'CREATE', name: 'Thêm hồ sơ học sinh' },
  { featureCode: 'ACADEMIC.STUDENTS', code: 'ACADEMIC.STUDENTS.UPDATE', action: 'UPDATE', name: 'Sửa hồ sơ học sinh' },
  { featureCode: 'ACADEMIC.STUDENTS', code: 'ACADEMIC.STUDENTS.DELETE', action: 'DELETE', name: 'Xoá hồ sơ học sinh' },

  // ACADEMIC.CLASSES
  { featureCode: 'ACADEMIC.CLASSES', code: 'ACADEMIC.CLASSES.VIEW', action: 'VIEW', name: 'Xem lớp học' },
  { featureCode: 'ACADEMIC.CLASSES', code: 'ACADEMIC.CLASSES.MANAGE', action: 'MANAGE', name: 'Quản lý lớp học' },
  
  // HR.EMPLOYEES
  { featureCode: 'HR.EMPLOYEES', code: 'HR.EMPLOYEES.VIEW', action: 'VIEW', name: 'Xem hồ sơ nhân sự' },
  { featureCode: 'HR.EMPLOYEES', code: 'HR.EMPLOYEES.MANAGE', action: 'MANAGE', name: 'Quản lý nhân sự' },
];

export const SYSTEM_ROLES = [
  { code: 'SUPER_ADMIN', name: 'Quản trị hệ thống', level: 999, isSystemRole: true },
  { code: 'HIEU_TRUONG', name: 'Hiệu trưởng / Ban giám hiệu', level: 900, isSystemRole: false },
  { code: 'TRUONG_PHONG', name: 'Trưởng phòng / Tổ trưởng', level: 500, isSystemRole: false },
  { code: 'NHAN_VIEN', name: 'Nhân viên / Giáo viên', level: 100, isSystemRole: false },
];
