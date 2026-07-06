// ============================================================
// MOCK DATA — NGƯỜI THAM GIA CUỘC HỌP
// ============================================================

export type MeetingRole =
  | 'Chủ trì'
  | 'Thư ký'
  | 'Người tham dự'
  | 'Khách mời'
  | 'Người theo dõi'
  | 'Người chuẩn bị nội dung';

export type ParticipantResponse =
  | 'Tham dự'
  | 'Vắng mặt'
  | 'Xin phép vắng'
  | 'Chưa chắc chắn'
  | 'Chưa phản hồi';

export type AttendanceStatus =
  | 'Có mặt'
  | 'Vắng mặt'
  | 'Đi muộn'
  | 'Rời sớm'
  | 'Không xác định';

export interface MeetingParticipantDetail {
  id: string;
  userId: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  role: MeetingRole;
  response: ParticipantResponse;
  responseReason: string | null;     // bắt buộc khi vắng/xin phép
  responseAt: string | null;         // ISO
  inviteSentAt: string | null;       // ISO
  inviteResendCount: number;
  attendance: AttendanceStatus | null;
  attendanceNote: string | null;
  attendanceAt: string | null;       // ISO
  attendanceBy: string | null;       // tên người điểm danh
  avatarInitials: string;
}

export interface MeetingDetail {
  id: string;
  title: string;
  meetingType: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:MM
  endTime: string;       // HH:MM
  roomName: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  hostName: string;
  departmentName: string;
  status: string;
  participants: MeetingParticipantDetail[];
  agenda: string[];
}

// ─── Nhân sự trong trường (dùng để thêm) ─────────────────────
export interface SchoolStaff {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatarInitials: string;
}

export const SCHOOL_DEPARTMENTS = [
  'Ban Giám Hiệu',
  'Tổ Tiểu học',
  'Tổ THCS',
  'Tổ THPT',
  'P. Tuyển sinh',
  'P. Hành chính',
  'P. Kế toán',
  'P. Marketing',
  'CSVC & An ninh',
];

export const SCHOOL_STAFF: SchoolStaff[] = [
  { id: 'S001', fullName: 'Nguyễn Văn Minh',    position: 'Hiệu trưởng',          department: 'Ban Giám Hiệu',  email: 'minh.nguyen@school.vn',    phone: '0901111001', avatarInitials: 'NM' },
  { id: 'S002', fullName: 'Trần Thị Hoa',        position: 'Phó Hiệu trưởng',     department: 'Ban Giám Hiệu',  email: 'hoa.tran@school.vn',       phone: '0901111002', avatarInitials: 'TH' },
  { id: 'S003', fullName: 'Lê Văn Bình',         position: 'Trưởng P. Hành chính',department: 'P. Hành chính',  email: 'binh.le@school.vn',        phone: '0901111003', avatarInitials: 'LB' },
  { id: 'S004', fullName: 'Phạm Thị Lan',        position: 'Tổ trưởng Tiểu học',  department: 'Tổ Tiểu học',   email: 'lan.pham@school.vn',       phone: '0901111004', avatarInitials: 'PL' },
  { id: 'S005', fullName: 'Hoàng Thị Thu',       position: 'Trưởng P. Tuyển sinh',department: 'P. Tuyển sinh', email: 'thu.hoang@school.vn',      phone: '0901111005', avatarInitials: 'HT' },
  { id: 'S006', fullName: 'Đỗ Minh Tuấn',        position: 'Tổ trưởng THCS',      department: 'Tổ THCS',        email: 'tuan.do@school.vn',        phone: '0901111006', avatarInitials: 'DT' },
  { id: 'S007', fullName: 'Nguyễn Thị Mai',      position: 'Giáo viên Tiểu học',  department: 'Tổ Tiểu học',   email: 'mai.nguyen@school.vn',     phone: '0901111007', avatarInitials: 'NM' },
  { id: 'S008', fullName: 'Trần Văn Hùng',       position: 'Giáo viên THCS',      department: 'Tổ THCS',        email: 'hung.tran@school.vn',      phone: '0901111008', avatarInitials: 'TH' },
  { id: 'S009', fullName: 'Bùi Thị Nga',         position: 'Kế toán trưởng',       department: 'P. Kế toán',    email: 'nga.bui@school.vn',        phone: '0901111009', avatarInitials: 'BN' },
  { id: 'S010', fullName: 'Võ Văn Khoa',         position: 'Tổ trưởng THPT',      department: 'Tổ THPT',        email: 'khoa.vo@school.vn',        phone: '0901111010', avatarInitials: 'VK' },
  { id: 'S011', fullName: 'Lý Thị Hạnh',         position: 'Chuyên viên Marketing',department: 'P. Marketing', email: 'hanh.ly@school.vn',        phone: '0901111011', avatarInitials: 'LH' },
  { id: 'S012', fullName: 'Phan Văn Dũng',       position: 'Trưởng CSVC',          department: 'CSVC & An ninh',email: 'dung.phan@school.vn',      phone: '0901111012', avatarInitials: 'PD' },
];

// ─── Mock meetings với participants chi tiết ──────────────────
export const MEETING_DETAILS: MeetingDetail[] = [
  {
    id: 'MD001',
    title: 'Họp giao ban tuần – Tuần 28',
    meetingType: 'Họp toàn trường',
    date: '2026-07-06',
    startTime: '07:30',
    endTime: '09:00',
    roomName: 'Phòng họp B (P.301)',
    isOnline: false,
    onlineUrl: null,
    hostName: 'Nguyễn Văn Minh',
    departmentName: 'Ban Giám Hiệu',
    status: 'Sắp diễn ra',
    agenda: [
      'Đánh giá kết quả tuần 27',
      'Triển khai kế hoạch tuần 28',
      'Thông báo mới từ BGH',
      'Ý kiến phản hồi các phòng ban',
    ],
    participants: [
      { id: 'P001', userId: 'S001', fullName: 'Nguyễn Văn Minh',  position: 'Hiệu trưởng',          department: 'Ban Giám Hiệu', email: 'minh.nguyen@school.vn', phone: '0901111001', role: 'Chủ trì',    response: 'Tham dự',        responseReason: null,                     responseAt: '2026-07-04T08:00:00', inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'NM' },
      { id: 'P002', userId: 'S003', fullName: 'Lê Văn Bình',       position: 'Trưởng P. Hành chính',  department: 'P. Hành chính', email: 'binh.le@school.vn',     phone: '0901111003', role: 'Thư ký',     response: 'Tham dự',        responseReason: null,                     responseAt: '2026-07-04T09:00:00', inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'LB' },
      { id: 'P003', userId: 'S002', fullName: 'Trần Thị Hoa',      position: 'Phó Hiệu trưởng',       department: 'Ban Giám Hiệu', email: 'hoa.tran@school.vn',    phone: '0901111002', role: 'Người tham dự', response: 'Tham dự',     responseReason: null,                     responseAt: '2026-07-04T10:00:00', inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'TH' },
      { id: 'P004', userId: 'S004', fullName: 'Phạm Thị Lan',      position: 'Tổ trưởng Tiểu học',    department: 'Tổ Tiểu học',   email: 'lan.pham@school.vn',    phone: '0901111004', role: 'Người tham dự', response: 'Xin phép vắng',  responseReason: 'Có con bệnh cần đưa đi khám', responseAt: '2026-07-04T11:00:00', inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'PL' },
      { id: 'P005', userId: 'S006', fullName: 'Đỗ Minh Tuấn',      position: 'Tổ trưởng THCS',        department: 'Tổ THCS',       email: 'tuan.do@school.vn',     phone: '0901111006', role: 'Người tham dự', response: 'Chưa phản hồi',  responseReason: null,                     responseAt: null,                  inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 1, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'DT' },
      { id: 'P006', userId: 'S010', fullName: 'Võ Văn Khoa',       position: 'Tổ trưởng THPT',        department: 'Tổ THPT',       email: 'khoa.vo@school.vn',     phone: '0901111010', role: 'Người tham dự', response: 'Chưa phản hồi',  responseReason: null,                     responseAt: null,                  inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'VK' },
      { id: 'P007', userId: 'S005', fullName: 'Hoàng Thị Thu',     position: 'Trưởng P. Tuyển sinh',  department: 'P. Tuyển sinh', email: 'thu.hoang@school.vn',   phone: '0901111005', role: 'Người tham dự', response: 'Tham dự',        responseReason: null,                     responseAt: '2026-07-04T14:00:00', inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'HT' },
      { id: 'P008', userId: 'S009', fullName: 'Bùi Thị Nga',       position: 'Kế toán trưởng',         department: 'P. Kế toán',   email: 'nga.bui@school.vn',     phone: '0901111009', role: 'Người tham dự', response: 'Vắng mặt',       responseReason: 'Tham gia tập huấn kế toán tại Sở GD',  responseAt: '2026-07-04T09:30:00', inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'BN' },
      { id: 'P009', userId: 'S012', fullName: 'Phan Văn Dũng',     position: 'Trưởng CSVC',            department: 'CSVC & An ninh',email: 'dung.phan@school.vn',   phone: '0901111012', role: 'Người theo dõi', response: 'Chưa phản hồi', responseReason: null,                     responseAt: null,                  inviteSentAt: '2026-07-04T07:00:00', inviteResendCount: 0, attendance: null, attendanceNote: null, attendanceAt: null, attendanceBy: null, avatarInitials: 'PD' },
    ],
  },
  {
    id: 'MD002',
    title: 'Họp BGH – Chiến lược tuyển sinh Q3',
    meetingType: 'Họp BGH',
    date: '2026-07-04',
    startTime: '15:00',
    endTime: '17:00',
    roomName: 'Phòng BGH',
    isOnline: false,
    onlineUrl: null,
    hostName: 'Nguyễn Văn Minh',
    departmentName: 'Ban Giám Hiệu',
    status: 'Đã hoàn thành',
    agenda: ['Review Q2 tuyển sinh', 'Kế hoạch Q3', 'Phân công nhiệm vụ'],
    participants: [
      { id: 'P010', userId: 'S001', fullName: 'Nguyễn Văn Minh', position: 'Hiệu trưởng',      department: 'Ban Giám Hiệu', email: 'minh.nguyen@school.vn', phone: '0901111001', role: 'Chủ trì',    response: 'Tham dự', responseReason: null, responseAt: '2026-07-03T09:00:00', inviteSentAt: '2026-07-03T08:00:00', inviteResendCount: 0, attendance: 'Có mặt',     attendanceNote: null,                   attendanceAt: '2026-07-04T15:02:00', attendanceBy: 'Lê Văn Bình', avatarInitials: 'NM' },
      { id: 'P011', userId: 'S002', fullName: 'Trần Thị Hoa',    position: 'Phó Hiệu trưởng', department: 'Ban Giám Hiệu', email: 'hoa.tran@school.vn',    phone: '0901111002', role: 'Người tham dự', response: 'Tham dự', responseReason: null, responseAt: '2026-07-03T10:00:00', inviteSentAt: '2026-07-03T08:00:00', inviteResendCount: 0, attendance: 'Đi muộn',     attendanceNote: 'Kẹt xe, vào lúc 15:20', attendanceAt: '2026-07-04T15:20:00', attendanceBy: 'Lê Văn Bình', avatarInitials: 'TH' },
      { id: 'P012', userId: 'S003', fullName: 'Lê Văn Bình',     position: 'Trưởng HC',        department: 'P. Hành chính', email: 'binh.le@school.vn',     phone: '0901111003', role: 'Thư ký',     response: 'Tham dự', responseReason: null, responseAt: '2026-07-03T08:30:00', inviteSentAt: '2026-07-03T08:00:00', inviteResendCount: 0, attendance: 'Có mặt',     attendanceNote: null,                   attendanceAt: '2026-07-04T14:58:00', attendanceBy: 'Lê Văn Bình', avatarInitials: 'LB' },
      { id: 'P013', userId: 'S005', fullName: 'Hoàng Thị Thu',   position: 'Trưởng Tuyển sinh', department: 'P. Tuyển sinh', email: 'thu.hoang@school.vn',   phone: '0901111005', role: 'Người chuẩn bị nội dung', response: 'Tham dự', responseReason: null, responseAt: '2026-07-03T09:00:00', inviteSentAt: '2026-07-03T08:00:00', inviteResendCount: 0, attendance: 'Rời sớm', attendanceNote: 'Ra về lúc 16:30 do có khách',   attendanceAt: '2026-07-04T15:01:00', attendanceBy: 'Lê Văn Bình', avatarInitials: 'HT' },
    ],
  },
];

export const ROLE_CONFIG: Record<MeetingRole, { color: string; icon: string }> = {
  'Chủ trì':                    { color: 'bg-rose-100 text-rose-700 border-rose-200',     icon: '👑' },
  'Thư ký':                     { color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: '📝' },
  'Người tham dự':              { color: 'bg-slate-100 text-slate-700 border-slate-200',  icon: '👤' },
  'Khách mời':                  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🎟️' },
  'Người theo dõi':             { color: 'bg-indigo-100 text-indigo-700 border-indigo-200',    icon: '👁️' },
  'Người chuẩn bị nội dung':    { color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: '📋' },
};

export const RESPONSE_CONFIG: Record<ParticipantResponse, { color: string; dot: string; icon: string }> = {
  'Tham dự':        { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: '✅' },
  'Vắng mặt':       { color: 'bg-rose-100 text-rose-700 border-rose-200',          dot: 'bg-rose-500',    icon: '❌' },
  'Xin phép vắng':  { color: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   icon: '🙏' },
  'Chưa chắc chắn': { color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-400',    icon: '❓' },
  'Chưa phản hồi':  { color: 'bg-slate-100 text-slate-500 border-slate-200',       dot: 'bg-slate-400',   icon: '⏳' },
};

export const ATTENDANCE_CONFIG: Record<AttendanceStatus, { color: string; dot: string }> = {
  'Có mặt':         { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Vắng mặt':       { color: 'bg-rose-100 text-rose-700 border-rose-200',          dot: 'bg-rose-500' },
  'Đi muộn':        { color: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  'Rời sớm':        { color: 'bg-orange-100 text-orange-700 border-orange-200',    dot: 'bg-orange-500' },
  'Không xác định': { color: 'bg-slate-100 text-slate-500 border-slate-200',       dot: 'bg-slate-400' },
};
