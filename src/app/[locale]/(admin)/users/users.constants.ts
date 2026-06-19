import { UserRole, UserStatus, DataScope } from './users.types';

export const ROLE_LABELS: Record<UserRole | string, string> = {
  ADMIN: "Admin hệ thống",
  CHAIRMAN: "Chủ tịch HĐT",
  BGH: "Ban Giám Hiệu",
  MANAGER: "Quản lý / Tổ trưởng",
  TEACHER: "Giáo viên",
  STAFF: "Nhân viên",
  ADMISSIONS: "Tuyển sinh",
  HRM: "Nhân sự",
  FACILITIES: "Cơ sở vật chất",
};

export const STATUS_LABELS: Record<UserStatus | string, string> = {
  ACTIVE: "Đang hoạt động",
  PENDING_INVITE: "Đã gửi lời mời",
  PENDING_ACTIVATION: "Chờ kích hoạt",
  LOCKED: "Bị khóa",
  SUSPENDED: "Tạm ngừng",
  DELETED: "Đã xóa",
};

export const SCOPE_LABELS: Record<DataScope | string, string> = {
  SYSTEM: "Toàn hệ thống",
  SCHOOL: "Toàn trường",
  DEPARTMENT: "Theo phòng ban",
  TEAM: "Theo tổ chuyên môn",
  CLASS: "Theo lớp phụ trách",
  OWN: "Chỉ dữ liệu của bản thân",
};

export const DATA_SCOPE_OPTIONS = [
  { value: "SYSTEM", label: SCOPE_LABELS.SYSTEM },
  { value: "SCHOOL", label: SCOPE_LABELS.SCHOOL },
  { value: "DEPARTMENT", label: SCOPE_LABELS.DEPARTMENT },
  { value: "TEAM", label: SCOPE_LABELS.TEAM },
  { value: "CLASS", label: SCOPE_LABELS.CLASS },
  { value: "OWN", label: SCOPE_LABELS.OWN },
];

export const ROLE_COLORS: Record<UserRole | string, string> = {
  ADMIN: "bg-red-500/10 text-red-650 border-red-500/20 dark:text-red-400",
  CHAIRMAN: "bg-purple-500/10 text-purple-650 border-purple-500/20 dark:text-purple-400",
  BGH: "bg-indigo-500/10 text-indigo-655 border-indigo-500/20 dark:text-indigo-400",
  MANAGER: "bg-blue-500/10 text-blue-650 border-blue-500/20 dark:text-blue-400",
  TEACHER: "bg-emerald-500/10 text-emerald-650 border-emerald-500/20 dark:text-emerald-400",
  STAFF: "bg-slate-500/10 text-slate-650 border-slate-500/20 dark:text-slate-400",
  ADMISSIONS: "bg-amber-500/10 text-amber-650 border-amber-500/20 dark:text-amber-400",
  HRM: "bg-pink-500/10 text-pink-650 border-pink-500/20 dark:text-pink-400",
  FACILITIES: "bg-cyan-500/10 text-cyan-650 border-cyan-500/20 dark:text-cyan-400",
};

export const STATUS_COLORS: Record<UserStatus | string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PENDING_INVITE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PENDING_ACTIVATION: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  LOCKED: "bg-rose-500/10 text-rose-650 dark:text-rose-400 border-rose-500/20",
  SUSPENDED: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  DELETED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Tổng quan điều hành" },
  { key: "tasks", label: "Công việc & Quy trình" },
  { key: "approvals", label: "Phê duyệt" },
  { key: "events", label: "Lịch & Sự kiện" },
  { key: "directives", label: "Chỉ đạo BGH" },
  { key: "announcements", label: "Thông báo nội bộ" },
  { key: "chat", label: "Chat nội bộ" },
  { key: "hrm", label: "Quản trị Nhân sự HRM" },
  { key: "risk", label: "Quản trị Rủi ro" },
  { key: "crm", label: "Tuyển sinh & CRM" },
  { key: "facilities", label: "CSVC & Thiết bị" },
  { key: "students", label: "Hồ sơ Học sinh 360" },
  { key: "schedule", label: "Thời khóa biểu & Giáo án" },
  { key: "storage", label: "Kho dữ liệu" },
  { key: "reports", label: "Báo cáo" },
  { key: "settings", label: "Cấu hình hệ thống" },
  { key: "users", label: "Quản lý người dùng & phân quyền" },
];

export const PERMISSION_ACTIONS = [
  { key: "view", label: "Xem" },
  { key: "create", label: "Tạo" },
  { key: "edit", label: "Sửa" },
  { key: "delete", label: "Xóa" },
  { key: "approve", label: "Duyệt" },
  { key: "export", label: "Xuất dữ liệu" },
  { key: "configure", label: "Cấu hình" },
];

export const DEPARTMENTS_LIST = [
  { id: "dept_bgh", name: "BGH / Toàn trường", code: "BGH" },
  { id: "dept_tuyensinh", name: "Tuyển sinh", code: "TUYEN_SINH" },
  { id: "dept_nhansu", name: "Nhân sự", code: "NHAN_SU" },
  { id: "dept_giaovu", name: "Giáo vụ", code: "GIAO_VU" },
  { id: "dept_csvc", name: "CSVC", code: "CSVC" },
  { id: "dept_hanhchinh", name: "Hành chính", code: "HANH_CHINH" },
  { id: "dept_toantin", name: "Tổ Toán - Tin học", code: "TOAN_TIN" },
  { id: "dept_nguvan", name: "Tổ Ngữ văn", code: "NGU_VAN" },
  { id: "dept_tienganh", name: "Tổ Tiếng Anh", code: "TIENG_ANH" },
  { id: "dept_khoahoc", name: "Tổ Khoa học", code: "KHOA_HOC" },
  { id: "dept_vanphong", name: "Tổ Văn phòng", code: "VAN_PHONG" },
];

export const JOB_TITLES_LIST = [
  "Chủ tịch Hội đồng Trường",
  "Hiệu trưởng",
  "Phó Hiệu trưởng",
  "Trưởng phòng",
  "Tổ trưởng chuyên môn",
  "Giáo viên",
  "Nhân viên",
  "Quản lý CSVC",
  "Cán bộ tuyển sinh",
  "Nhân sự",
];
