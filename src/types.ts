export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'PARENT' | 'STUDENT';

export interface RolePermissions {
  createTask: boolean;       // Khởi tạo chỉ đạo / nhiệm vụ mới
  editTask: boolean;         // Chỉnh sửa nội dung chỉ đạo (Tiêu đề, Mô tả, Hạn chót, Độ ưu tiên)
  deleteTask: boolean;       // Xóa chỉ đạo học vụ khỏi danh sách
  changeStatus: boolean;     // Cập nhật tiến độ dự án (Ví dụ: Đang tiến hành)
  submitReport: boolean;     // Nộp báo cáo chuyên môn kèm minh chứng thực tế
  approveReport: boolean;    // Duyệt & nghiệm thu kết quả công việc
  rejectReport: boolean;     // Từ chối báo cáo, yêu cầu điều chỉnh chỉnh sửa
  addComment: boolean;       // Thảo luận góp ý chuyên môn
  manageWorkspaces: boolean; // Quản trị cơ cấu phòng chức năng / tổ chuyên môn
}

export type RbacConfig = Record<Role, RolePermissions>;

export interface MIProfile {
  logical: number;       // Trí tuệ Logic - Toán
  linguistic: number;    // Trí tuệ Ngôn ngữ
  spatial: number;       // Trí tuệ Không gian
  musical: number;       // Trí tuệ Âm nhạc
  kinesthetic: number;   // Trí tuệ Vận động
  interpersonal: number; // Trí tuệ Giao tiếp
  intrapersonal: number; // Trí tuệ Nội tâm
  naturalist: number;    // Trí tuệ Tự nhiên
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  roleName: string; // "Ban Giám hiệu", "Tổ trưởng chuyên môn", "Giáo viên / Nhân viên"
  title: string; // "Hiệu trưởng", "Tổ trưởng Tổ Toán - Tin", "Giáo viên Toán"
  avatar: string;
  workspaceId: string; // primary workspace they belong to
  miProfile?: MIProfile;
  badges?: string[];
  cpdHours?: number;
  cpdLog?: { id: string; title: string; hours: number; date: string }[];
  kpiLocked?: boolean;
  employeeCode?: string;
  email?: string;
  personalEmail?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  startDate?: string;
  contractType?: string;
  qualification?: string;
  specialization?: string;
  emergencyContact?: string;
  nationalId?: string;
  insuranceCode?: string;
  parentEmail?: string;
  studentCode?: string;
  campusId?: 'ALL' | 'CAMPUS_HN' | 'CAMPUS_HCM';
}

export type TaskPriority = 'CAO' | 'TRUNG_BINH' | 'THAP';

export type TaskStatus = 'CHUA_BAT_DA' | 'DANG_TIEN_HANH' | 'CHO_DUYET' | 'HOAN_THANH';

export interface Comment {
  id: string;
  userName: string;
  userTitle: string;
  content: string;
  createdAt: string;
}

interface HistoryLog {
  id: string;
  userName: string;
  userTitle: string;
  action: string;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  parentTaskId?: string;
  startDate?: string;
  workspaceId: string; // "BGH" | "TOAN_TIN" | "VAN" | "HANH_CHINH"
  assignedId: string; // User ID
  assignedName: string;
  assignedRole: string; // Title
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  tag: string; // "Chuyên môn" | "Hội họp" | "Đại hội" | "Báo cáo" | "Đột xuất"
  createdBy: string;
  comments: Comment[];
  history: HistoryLog[];
  reportEvidence?: string; // Evidence text written by teacher when requesting approval
  rejectionReason?: string; // Reject feedback from supervisor
  linkedOkrId?: string;
  checklist?: ChecklistItem[];
  nearDeadlineReminderSent?: boolean;
  overdueReminderSent?: boolean;
  lastNearDeadlineReminderDate?: string;
  lastOverdueReminderDate?: string;
  campusId?: 'ALL' | 'CAMPUS_HN' | 'CAMPUS_HCM';
}

interface Project {
  id: string;
  name: string;
  ownerWorkspaceId: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'DONE';
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string; // for custom styling
  iconName: string; // Lucide icon mapping
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderTitle: string;
  senderAvatar: string;
  createdAt: string;
  targetRoles: Role[]; // target roles
  meetingTime?: string; // e.g. "14:00 ngày 25/11"
  meetingLocation?: string; // e.g. "Phòng Hội đồng"
  isMeeting: boolean;
  acknowledgedBy: { 
    userId: string; 
    userName: string; 
    userTitle: string; 
    status: 'DA_XAC_NHAN' | 'VANG_CO_LY_DO'; 
    note?: string;
  }[];
}

export interface BoardDirective {
  id: string;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderTitle: string;
  senderAvatar: string;
  createdAt: string;
  category: 'CHI_DAO_CHIEN_LUOC' | 'CHI_THI_KHAN' | 'QUYET_DINH_BO_NHIEM';
  urgency: 'KHAN' | 'THUONG' | 'DAC_BIET';
  implementations: {
    userId: string;
    userName: string;
    userTitle: string;
    status: 'DA_TIEP_THU' | 'DANG_TRIEN_KHAI' | 'DA_HOAN_THANH';
    feedback?: string;
    updatedAt: string;
  }[];
}

export interface DepartmentOKR {
  id: string;
  departmentId: string; // workspaceId matching
  objective: string;
  kpi: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progress: number; // e.g. 0 to 100 representing progression based on completed tasks
}

export interface LessonPlanAsset {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorTitle: string;
  miType: keyof MIProfile;
  downloadUrl?: string;
  likesCount: number;
}

export const RELIABLE_AVATARS: string[] = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face'
];

export function getSafeAvatar(avatarUrl: string | null | undefined, name?: string): string {
  if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.trim() === '' || !avatarUrl.startsWith('http')) {
    const key = name || 'default';
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % RELIABLE_AVATARS.length;
    return RELIABLE_AVATARS[index];
  }
  return avatarUrl;
}

export interface AcademicYearRecord {
  id: string;
  schoolYear: string;
  className: string;
  gpa: number;
  conduct: string;
  teacherName: string;
}

export interface HealthIncident {
  id: string;
  date: string;
  symptoms: string;
  treatment: string;
  nurseName: string;
  status: 'DA_XU_LY' | 'THEO_DOI';
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  date: string;
  dose: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'SACH' | 'THIET_BI';
  location: string;
  quantity: number;
  status: 'SAN_SANG' | 'DANG_CHO_MUON' | 'BAO_HONG' | 'THANH_LY';
  condition: 'MOI' | 'BINH_THUONG' | 'CU' | 'HONG';
}

export interface BorrowLog {
  id: string;
  itemCode: string;
  itemName: string;
  category: 'SACH' | 'THIET_BI';
  borrowerName: string;
  borrowerRole: 'TEACHER' | 'STUDENT';
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'DANG_MUON' | 'DA_TRA' | 'QUA_HAN' | 'BAO_MAT';
}

export interface SisAuditLog {
  id: string;
  timestamp: string;
  operatorName: string;
  operatorRole: string;
  action: string;
  targetStudentName: string;
  details: string;
}

export interface TimetableSlot {
  id: string;
  day: number;
  period: number;
  subject: string;
  className: string;
  room: string;
  teacherId: string;
}
