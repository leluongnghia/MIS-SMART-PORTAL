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

export interface AssetItem {
  id: string;
  code: string;
  name: string;
  category: 'CNTT' | 'NOI_THAT' | 'THU_VIEN' | 'THIET_BI_GIANG_DAY' | 'KHAC';
  location: string; // "Phòng 101", "Kho Tổng"...
  assignedTo?: string; // User ID
  assignedName?: string;
  status: 'SAN_SANG' | 'DANG_SU_DUNG' | 'DANG_SUA_CHUA' | 'THANH_LY';
  condition: 'MOI' | 'TOT' | 'KHA' | 'KEM' | 'HONG';
  purchaseDate: string;
  price?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  specs?: string; // Thông số kỹ thuật
}

export interface AssetHandover {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  location: string;
  handoverDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  conditionAtHandover: string;
  conditionAtReturn?: string;
  status: 'CHO_DUYET' | 'DA_BAN_GIAO' | 'DA_THU_HOI' | 'TU_CHOI';
  notes?: string;
  approvedBy?: string;
}

export interface AssetTransfer {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  requestDate: string;
  transferDate?: string;
  status: 'CHO_DUYET' | 'DA_CHUYEN' | 'TU_CHOI';
  requestedBy: string;
  requestorName: string;
  approvedBy?: string;
  reason: string;
}

export interface MaintenanceReport {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  reportedBy: string;
  reporterName: string;
  reportDate: string;
  issueDescription: string;
  priority: 'CAO' | 'TRUNG_BINH' | 'THAP';
  status: 'CHO_TIEP_NHAN' | 'DANG_SUA' | 'DA_HOAN_THANH' | 'HONG_NANG';
  assignedTechnician?: string;
  completionDate?: string;
  repairCost?: number;
  resolutionNotes?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'VAN_PHONG_PHAM' | 'VE_SINH' | 'Y_TE' | 'KHAC';
  unit: string;
  currentStock: number;
  minStockLevel: number;
  location: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'NHAP' | 'XUAT';
  quantity: number;
  date: string;
  performerName: string;
  notes?: string;
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

// HRM & CPD Module Types
export interface RecruitmentJob {
  id: string;
  code: string;
  position: string;
  department: string;
  targetCount: number;
  reason: string;
  deadline: string;
  manager: string;
  status: 'DRAFT' | 'OPEN' | 'PAUSED' | 'FILLED' | 'CANCELLED';
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  jobId: string;
  jobPosition: string;
  source: string;
  status: 'NEW' | 'SCREENING' | 'INTERVIEW' | 'TRIAL' | 'OFFER' | 'HIRED' | 'REJECTED';
  interviewDate?: string;
  interviewer?: string;
  evaluation?: string;
  notes?: string;
}

export interface OnboardingTask {
  id: string;
  userId: string;
  userName: string;
  roleName: string;
  checklist: { id: string; text: string; done: boolean }[];
  status: 'PENDING' | 'IN_PROGRESS' | 'MISSING_DOCS' | 'COMPLETED' | 'OVERDUE';
  mentorName?: string;
  notes?: string;
}

export interface ProbationEvaluation {
  id: string;
  userId: string;
  userName: string;
  position: string;
  mentorName: string;
  startDate: string;
  endDate: string;
  objectives: string;
  resultScore?: number;
  managerComments?: string;
  recommendation?: 'HIRED' | 'EXTENDED' | 'REJECTED';
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface HrContract {
  id: string;
  userId: string;
  userName: string;
  contractType: string;
  contractNumber: string;
  signDate: string;
  effectiveDate: string;
  expirationDate: string;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'RENEWED' | 'TERMINATED';
  notes?: string;
}

export interface CpdProgram {
  id: string;
  code: string;
  name: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'ONLINE' | 'OFFLINE' | 'SPECIALTY' | 'SKILL' | 'SAFETY' | 'TECH' | 'PROCESS';
  targetAudience: string;
  manager: string;
  startDate: string;
  endDate: string;
  organizer: string;
  objectives: string;
  status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  expectedCost?: number;
}

export interface CpdParticipant {
  id: string;
  programId: string;
  programName: string;
  userId: string;
  userName: string;
  status: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'COMPLETED';
  score?: number;
  certificate?: string;
  notes?: string;
}

export interface DisciplinaryRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  violationType: string;
  severity: 'REMINDER' | 'LIGHT' | 'MEDIUM' | 'SEVERE';
  description: string;
  recordedBy: string;
  actionTaken?: string;
  status: 'PENDING' | 'RESOLVED' | 'MONITORING' | 'CLOSED';
}

export interface TransferRecord {
  id: string;
  userId: string;
  userName: string;
  currentDept: string;
  newDept: string;
  reason: string;
  effectiveDate: string;
  proposedBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface TimelineEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  visibleToParent?: boolean;
}

export type ParentSupportTicket = {
  id: string;
  ticketCode: string;
  receivedAt: string;
  channel: string;
  receivedBy: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  relationship: string;
  preferredContactMethod?: string;
  studentId?: string;
  studentName?: string;
  className?: string;
  homeroomTeacher?: string;
  title: string;
  description: string;
  expectedResolution?: string;
  isSensitive: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  departmentOwner: string;
  assigneeId?: string;
  watchers?: string[];
  internalNote?: string;
  status: 'DRAFT' | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  createdAt: string;
  updatedAt: string;
  slaDueAt?: string;
  riskFlag: boolean;
  visibleToParent: boolean;
  createdBy: string;
  timeline: TimelineEvent[];
};

export type CommunicationContent = {
  id: string;
  contentCode: string;
  title: string;
  contentGroup: string;
  priority: 'normal' | 'important' | 'urgent';
  ownerDepartment: string;
  summary: string;
  body: string;
  channels: string[];
  relatedEventId?: string;
  plannedPublishAt?: string;
  authorId: string;
  approverId?: string;
  approvalDeadline?: string;
  audience: string[];
  gradeIds?: string[];
  classIds?: string[];
  visibleToParent: boolean;
  attachments?: string[];
  reviewNote?: string;
  internalNote?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'NEEDS_REVISION' | 'APPROVED' | 'PUBLISHED' | 'POSTPONED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  timeline: TimelineEvent[];
};

export interface Survey {
  id: string;
  title: string;
  description: string;
  targetAudience: 'PARENTS' | 'STUDENTS' | 'STAFF' | 'ALL';
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
  expiresAt: string;
  responseCount: number;
}

export interface CommunicationCampaign {
  id: string;
  title: string;
  content: string;
  channels: ('EMAIL' | 'SMS' | 'APP_PUSH' | 'PORTAL')[];
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  scheduledDate: string;
  author: string;
  approvedBy?: string;
}

export interface SchoolEvent {
  id: string;
  eventCode: string;
  eventName: string;
  eventType: string;
  objective: string;
  description?: string;
  semester?: string;
  startAt: string;
  endAt: string;
  preparationStartAt?: string;
  location: string;
  backupLocation?: string;
  isOnline: boolean;
  onlineLink?: string;
  participants: string[];
  gradeIds?: string[];
  classIds?: string[];
  expectedAttendees?: number;
  guestNote?: string;
  ownerDepartment: string;
  ownerId: string;
  coDepartments?: string[];
  eventTeam?: string[];
  approverId?: string;
  checklist: Array<{
    id: string;
    enabled: boolean;
    title: string;
    assigneeId?: string;
    dueAt?: string;
    createTask: boolean;
  }>;
  needCommunicationPlan: boolean;
  needParentNotice: boolean;
  communicationChannels?: string[];
  plannedAnnouncementAt?: string;
  relatedCommunicationIds?: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  safetyPlan?: string;
  medicalSupportNeeded: boolean;
  securitySupportNeeded: boolean;
  emergencyContact?: string;
  createRiskRecord: boolean;
  status: 'DRAFT' | 'PLANNING' | 'PENDING_APPROVAL' | 'APPROVED' | 'PREPARING' | 'ONGOING' | 'COMPLETED' | 'REVIEWED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  timeline: TimelineEvent[];
}

export interface CrisisIncident {
  id: string;
  crisisCode: string;
  title: string;
  detectedAt: string;
  summary: string;
  details?: string;
  attachments?: string[];
  
  source: string;
  sourceDetail?: string;
  impactScope: string[];
  publicVisibility: string;
  affectedStudentIds?: string[];
  affectedClassIds?: string[];
  
  severity: 'Theo dõi' | 'Cần xử lý' | 'Nghiêm trọng' | 'Khẩn cấp';
  riskArea: string[];
  urgencyReason?: string;
  potentialImpact?: string;
  
  ownerId: string;
  spokespersonId?: string;
  relatedDepartments: string[];
  responseTeam?: string[];
  watchers?: string[];
  
  firstAction: string;
  firstActionDeadline?: string;
  verificationPlan?: string;
  containmentPlan?: string;
  parentContactPlan?: string;
  authorityContactNeeded: boolean;
  
  keyMessage?: string;
  communicationChannels?: string[];
  approvalRequired: boolean;
  approverId?: string;
  doNotPublishExternally: boolean;
  publicResponseStatus: string;
  
  relatedTicketId?: string;
  relatedEventId?: string;
  createRiskRecord: boolean;
  relatedRiskId?: string;
  createBoardDirective: boolean;
  createTask: boolean;
  internalNote?: string;
  
  status: 'DRAFT' | 'DETECTED' | 'VERIFYING' | 'IN_PROGRESS' | 'OFFICIAL_RESPONSE_READY' | 'PENDING_APPROVAL' | 'OFFICIAL_RESPONSE_SENT' | 'MONITORING' | 'CLOSED' | 'REOPENED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  timeline: TimelineEvent[];
}

export interface SchoolSurvey {
  id: string;
  surveyCode: string;
  surveyTitle: string;
  surveyType: string;
  objective: string;
  description?: string;
  semester?: string;
  
  targetAudience: string[];
  gradeIds?: string[];
  classIds?: string[];
  departmentIds?: string[];
  estimatedRecipients?: number;
  
  startAt?: string;
  endAt: string;
  reminderAt?: string;
  isAnonymous: boolean;
  allowMultipleResponses: boolean;
  
  questions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    options?: string[];
    required: boolean;
    category?: string;
  }>;
  
  visibleToParentPortal: boolean;
  visibleToStudentPortal: boolean;
  responsePrivacy: string;
  showResultToRespondent: boolean;
  thankYouMessage?: string;
  
  ownerDepartment: string;
  ownerId: string;
  approverId?: string;
  reviewNote?: string;
  
  relatedEventId?: string;
  relatedTicketId?: string;
  createFollowUpTask: boolean;
  createCapaIfNegative: boolean;
  negativeThreshold?: number | string;
  
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'REPORTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  timeline: TimelineEvent[];
}
