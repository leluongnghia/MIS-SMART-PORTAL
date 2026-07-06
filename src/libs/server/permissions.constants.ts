export const PERMISSION_MODULES = [
  { code: 'SYSTEM', name: 'Hệ thống', sortOrder: 1, isSystem: true },
  { code: 'ACADEMIC', name: 'Học vụ', sortOrder: 2, isSystem: false },
  { code: 'ADMISSIONS', name: 'Tuyển sinh', sortOrder: 3, isSystem: false },
  { code: 'HR', name: 'Nhân sự', sortOrder: 4, isSystem: false },
  { code: 'FINANCE', name: 'Tài chính', sortOrder: 5, isSystem: false },
  { code: 'FACILITIES', name: 'Cơ sở vật chất', sortOrder: 6, isSystem: false },
  { code: 'MEETINGS', name: 'Lịch họp & Đặt phòng', sortOrder: 7, isSystem: false },
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

  // MEETINGS
  { moduleCode: 'MEETINGS', code: 'MEETINGS.MEETING', name: 'Cuộc họp' },
  { moduleCode: 'MEETINGS', code: 'MEETINGS.ROOM', name: 'Phòng họp & Đặt phòng' },
  { moduleCode: 'MEETINGS', code: 'MEETINGS.PARTICIPANTS', name: 'Người tham gia' },
  { moduleCode: 'MEETINGS', code: 'MEETINGS.MINUTES', name: 'Biên bản & Giao việc' },
  { moduleCode: 'MEETINGS', code: 'MEETINGS.CONFIG', name: 'Cấu hình module' },
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

  // MEETINGS.MEETING
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.view',   action: 'VIEW',   name: 'Xem lịch họp' },
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.create', action: 'CREATE', name: 'Tạo cuộc họp' },
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.update', action: 'UPDATE', name: 'Sửa cuộc họp' },
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.delete', action: 'DELETE', name: 'Xóa cuộc họp' },
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.cancel', action: 'CANCEL', name: 'Hủy cuộc họp' },
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.invite', action: 'INVITE', name: 'Gửi thư mời họp' },
  { featureCode: 'MEETINGS.MEETING', code: 'meeting.respond', action: 'RESPOND', name: 'Xác nhận tham dự' },

  // MEETINGS.ROOM
  { featureCode: 'MEETINGS.ROOM', code: 'room.view',    action: 'VIEW',    name: 'Xem danh sách phòng' },
  { featureCode: 'MEETINGS.ROOM', code: 'room.create',  action: 'CREATE',  name: 'Thêm phòng họp' },
  { featureCode: 'MEETINGS.ROOM', code: 'room.update',  action: 'UPDATE',  name: 'Sửa phòng họp' },
  { featureCode: 'MEETINGS.ROOM', code: 'room.book',    action: 'BOOK',    name: 'Đặt phòng họp' },
  { featureCode: 'MEETINGS.ROOM', code: 'room.approve', action: 'APPROVE', name: 'Duyệt đặt phòng' },
  { featureCode: 'MEETINGS.ROOM', code: 'room.reject',  action: 'REJECT',  name: 'Từ chối đặt phòng' },

  // MEETINGS.PARTICIPANTS
  { featureCode: 'MEETINGS.PARTICIPANTS', code: 'participant.manage',    action: 'MANAGE',    name: 'Quản lý người tham gia' },
  { featureCode: 'MEETINGS.PARTICIPANTS', code: 'participant.respond',   action: 'RESPOND',   name: 'Phản hồi tham dự' },
  { featureCode: 'MEETINGS.PARTICIPANTS', code: 'participant.attendance',action: 'ATTENDANCE', name: 'Điểm danh cuộc họp' },

  // MEETINGS.MINUTES
  { featureCode: 'MEETINGS.MINUTES', code: 'minutes.view',    action: 'VIEW',    name: 'Xem biên bản họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'minutes.create',  action: 'CREATE',  name: 'Tạo biên bản họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'minutes.update',  action: 'UPDATE',  name: 'Sửa biên bản họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'minutes.approve', action: 'APPROVE', name: 'Duyệt biên bản họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'minutes.export',  action: 'EXPORT',  name: 'Xuất biên bản họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'meeting_task.create', action: 'CREATE', name: 'Tạo nhiệm vụ sau họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'meeting_task.update', action: 'UPDATE', name: 'Cập nhật nhiệm vụ sau họp' },
  { featureCode: 'MEETINGS.MINUTES', code: 'meeting_task.view',   action: 'VIEW',   name: 'Xem nhiệm vụ sau họp' },

  // MEETINGS.CONFIG
  { featureCode: 'MEETINGS.CONFIG', code: 'meeting.config', action: 'MANAGE', name: 'Cấu hình module Lịch họp' },
];

export const SYSTEM_ROLES = [
  { code: 'SUPER_ADMIN', name: 'Quản trị hệ thống', level: 999, isSystemRole: true },
  { code: 'HIEU_TRUONG', name: 'Hiệu trưởng / Ban giám hiệu', level: 900, isSystemRole: false },
  { code: 'HANH_CHINH', name: 'Hành chính / Văn phòng', level: 700, isSystemRole: false },
  { code: 'TRUONG_PHONG', name: 'Trưởng phòng / Tổ trưởng', level: 500, isSystemRole: false },
  { code: 'NHAN_VIEN', name: 'Nhân viên / Giáo viên', level: 100, isSystemRole: false },
];

// ─── Meeting permission codes (dùng trong UI với PermissionGate / usePermission) ───
export const MEETING_PERMS = {
  // Meeting
  VIEW:    'meeting.view',
  CREATE:  'meeting.create',
  UPDATE:  'meeting.update',
  DELETE:  'meeting.delete',
  CANCEL:  'meeting.cancel',
  INVITE:  'meeting.invite',
  RESPOND: 'meeting.respond',
  // Room
  ROOM_VIEW:    'room.view',
  ROOM_CREATE:  'room.create',
  ROOM_UPDATE:  'room.update',
  ROOM_BOOK:    'room.book',
  ROOM_APPROVE: 'room.approve',
  ROOM_REJECT:  'room.reject',
  // Participants
  PARTICIPANT_MANAGE:    'participant.manage',
  PARTICIPANT_RESPOND:   'participant.respond',
  PARTICIPANT_ATTENDANCE:'participant.attendance',
  // Minutes
  MINUTES_VIEW:    'minutes.view',
  MINUTES_CREATE:  'minutes.create',
  MINUTES_UPDATE:  'minutes.update',
  MINUTES_APPROVE: 'minutes.approve',
  MINUTES_EXPORT:  'minutes.export',
  TASK_CREATE:  'meeting_task.create',
  TASK_UPDATE:  'meeting_task.update',
  TASK_VIEW:    'meeting_task.view',
  // Config
  CONFIG: 'meeting.config',
} as const;
