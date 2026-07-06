// ============================================================
// MOCK DATA — MODULE BÁN TRÚ / NỘI TRÚ
// ============================================================

export type BoardingType = 'ban_tru' | 'noi_tru';
export type AttendStatus = 'present' | 'absent' | 'early_leave' | 'parent_pickup' | 'room_transfer' | 'special';
export type RoomStatus = 'active' | 'maintenance' | 'closed';
export type IncidentType = 'no_sleep' | 'sick' | 'fight' | 'lost_item' | 'discipline' | 'hygiene' | 'safety';
export type IncidentStatus = 'new' | 'processing' | 'parent_notified' | 'resolved' | 'bgh_review';
export type NepStatus = 'good' | 'average' | 'poor';

// ─── Configs ─────────────────────────────────────────────────
export const BOARDING_TYPE: Record<BoardingType, { label: string; color: string }> = {
  ban_tru: { label: 'Bán trú', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  noi_tru: { label: 'Nội trú', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const ATTEND_STATUS: Record<AttendStatus, { label: string; color: string }> = {
  present:       { label: 'Có mặt',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent:        { label: 'Vắng mặt',     color: 'bg-rose-50 text-rose-700 border-rose-200' },
  early_leave:   { label: 'Về sớm',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  parent_pickup: { label: 'PH đón',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
  room_transfer: { label: 'Chuyển phòng', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  special:       { label: 'Lý do đặc biệt', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const INCIDENT_TYPE: Record<IncidentType, { label: string; icon: string }> = {
  no_sleep:   { label: 'Không ngủ',         icon: '😴' },
  sick:       { label: 'Mệt / Ốm',          icon: '🤒' },
  fight:      { label: 'Tranh cãi / Xô xát',icon: '⚡' },
  lost_item:  { label: 'Mất đồ',            icon: '🔍' },
  discipline: { label: 'Vi phạm nề nếp',    icon: '📋' },
  hygiene:    { label: 'Sự cố vệ sinh',     icon: '🧹' },
  safety:     { label: 'Sự cố an toàn',     icon: '🚨' },
};

export const INCIDENT_STATUS: Record<IncidentStatus, { label: string; color: string }> = {
  new:              { label: 'Mới ghi nhận',      color: 'bg-rose-50 text-rose-700 border-rose-200' },
  processing:       { label: 'Đang xử lý',        color: 'bg-amber-50 text-amber-700 border-amber-200' },
  parent_notified:  { label: 'Đã báo PH',         color: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved:         { label: 'Đã xử lý',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  bgh_review:       { label: 'BGH theo dõi',      color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const NEP_STATUS: Record<NepStatus, { label: string; color: string }> = {
  good:    { label: 'Tốt',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  average: { label: 'Bình thường', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  poor:    { label: 'Cần cải thiện', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

// ─── Types ───────────────────────────────────────────────────
export interface BoardingStudent {
  id: string;
  name: string;
  className: string;
  grade: string;         // Khối
  type: BoardingType;
  roomId: string;
  bedPosition: string;
  staffInCharge: string;
  parentName: string;
  parentPhone: string;
  notes: string;
}

export interface AttendRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  roomId: string;
  date: string;
  session: 'lunch' | 'afternoon';
  status: AttendStatus;
  notes: string;
}

export interface BoardingRoom {
  id: string;
  name: string;
  area: string;
  capacity: number;
  currentCount: number;
  staffInCharge: string;
  status: RoomStatus;
  hygieneNote: string;
  safetyNote: string;
}

export interface DailyLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  mealStatus: 'good' | 'average' | 'poor' | 'skipped';
  sleepStatus: 'good' | 'restless' | 'no_sleep';
  healthStatus: 'normal' | 'tired' | 'sick';
  nep: NepStatus;
  violations: string;
  teacherNote: string;
  staffName: string;
}

export interface BoardingIncident {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  roomId: string;
  type: IncidentType;
  description: string;
  occurredAt: string;
  handler: string;
  status: IncidentStatus;
  parentNotified: boolean;
  notes: string;
}

// ─── Seed data ────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

export const MOCK_ROOMS: BoardingRoom[] = [
  { id: 'RM01', name: 'P.BT-01', area: 'Khu A', capacity: 20, currentCount: 18, staffInCharge: 'GV Nguyễn Thị Hoa', status: 'active', hygieneNote: 'Quét dọn sáng & chiều', safetyNote: 'Kiểm tra cửa sổ hàng ngày' },
  { id: 'RM02', name: 'P.BT-02', area: 'Khu A', capacity: 20, currentCount: 15, staffInCharge: 'GV Trần Văn Minh', status: 'active', hygieneNote: '', safetyNote: '' },
  { id: 'RM03', name: 'P.NT-01', area: 'Khu B', capacity: 15, currentCount: 12, staffInCharge: 'GV Lê Thị Mai', status: 'active', hygieneNote: 'Nội trú — kiểm tra 22:00', safetyNote: 'Camera hoạt động' },
  { id: 'RM04', name: 'P.NT-02', area: 'Khu B', capacity: 15, currentCount: 0, staffInCharge: 'GV Phạm Văn Nam', status: 'maintenance', hygieneNote: '', safetyNote: 'Đang sửa điện' },
];

export const MOCK_STUDENTS: BoardingStudent[] = [
  { id: 'BS01', name: 'Nguyễn Minh Khang', className: '3A', grade: '3', type: 'ban_tru', roomId: 'RM01', bedPosition: 'Giường 01', staffInCharge: 'GV Nguyễn Thị Hoa', parentName: 'Nguyễn Thị Mai', parentPhone: '0901111111', notes: 'Hen suyễn — có bình xịt' },
  { id: 'BS02', name: 'Trần Anh Dũng',     className: '2B', grade: '2', type: 'ban_tru', roomId: 'RM01', bedPosition: 'Giường 02', staffInCharge: 'GV Nguyễn Thị Hoa', parentName: 'Trần Thị Lan', parentPhone: '0902222222', notes: '' },
  { id: 'BS03', name: 'Lê Minh Tuấn',      className: '4C', grade: '4', type: 'ban_tru', roomId: 'RM02', bedPosition: 'Giường 01', staffInCharge: 'GV Trần Văn Minh', parentName: 'Lê Văn Đức', parentPhone: '0903333333', notes: 'Tiểu đường — kiểm tra 10:00' },
  { id: 'BS04', name: 'Phạm Thu Hương',    className: '5B', grade: '5', type: 'noi_tru', roomId: 'RM03', bedPosition: 'Giường 03', staffInCharge: 'GV Lê Thị Mai', parentName: 'Phạm Văn Nam', parentPhone: '0904444444', notes: '' },
  { id: 'BS05', name: 'Hoàng Đức Anh',     className: '1A', grade: '1', type: 'ban_tru', roomId: 'RM01', bedPosition: 'Giường 05', staffInCharge: 'GV Nguyễn Thị Hoa', parentName: 'Hoàng Thị Thu', parentPhone: '0905555555', notes: '' },
  { id: 'BS06', name: 'Đặng Thị Ngọc',     className: '4A', grade: '4', type: 'noi_tru', roomId: 'RM03', bedPosition: 'Giường 01', staffInCharge: 'GV Lê Thị Mai', parentName: 'Đặng Văn Hùng', parentPhone: '0906666666', notes: 'Cần theo dõi tâm lý' },
];

export const MOCK_ATTEND: AttendRecord[] = [
  { id: 'A01', studentId: 'BS01', studentName: 'Nguyễn Minh Khang', className: '3A', roomId: 'RM01', date: TODAY, session: 'lunch', status: 'present', notes: '' },
  { id: 'A02', studentId: 'BS02', studentName: 'Trần Anh Dũng',     className: '2B', roomId: 'RM01', date: TODAY, session: 'lunch', status: 'absent', notes: 'Phụ huynh xin phép ốm' },
  { id: 'A03', studentId: 'BS03', studentName: 'Lê Minh Tuấn',      className: '4C', roomId: 'RM02', date: TODAY, session: 'lunch', status: 'present', notes: '' },
  { id: 'A04', studentId: 'BS04', studentName: 'Phạm Thu Hương',    className: '5B', roomId: 'RM03', date: TODAY, session: 'afternoon', status: 'present', notes: '' },
  { id: 'A05', studentId: 'BS05', studentName: 'Hoàng Đức Anh',     className: '1A', roomId: 'RM01', date: TODAY, session: 'lunch', status: 'parent_pickup', notes: 'PH đón lúc 11:45' },
  { id: 'A06', studentId: 'BS06', studentName: 'Đặng Thị Ngọc',     className: '4A', roomId: 'RM03', date: TODAY, session: 'afternoon', status: 'present', notes: '' },
];

export const MOCK_LOGS: DailyLog[] = [
  { id: 'DL01', studentId: 'BS01', studentName: 'Nguyễn Minh Khang', className: '3A', date: TODAY, mealStatus: 'good', sleepStatus: 'good', healthStatus: 'normal', nep: 'good', violations: '', teacherNote: 'Bé ngoan, ăn hết suất', staffName: 'GV Nguyễn Thị Hoa' },
  { id: 'DL02', studentId: 'BS03', studentName: 'Lê Minh Tuấn',      className: '4C', date: TODAY, mealStatus: 'average', sleepStatus: 'restless', healthStatus: 'tired', nep: 'average', violations: '', teacherNote: 'Ăn ít, ngủ không sâu, kiểm tra đường huyết 12:00 = 5.2 mmol', staffName: 'GV Trần Văn Minh' },
  { id: 'DL03', studentId: 'BS04', studentName: 'Phạm Thu Hương',    className: '5B', date: TODAY, mealStatus: 'good', sleepStatus: 'good', healthStatus: 'normal', nep: 'good', violations: '', teacherNote: '', staffName: 'GV Lê Thị Mai' },
  { id: 'DL04', studentId: 'BS06', studentName: 'Đặng Thị Ngọc',     className: '4A', date: TODAY, mealStatus: 'poor', sleepStatus: 'no_sleep', healthStatus: 'tired', nep: 'poor', violations: 'Nói chuyện giờ ngủ trưa', teacherNote: 'Cần theo dõi tâm lý, hay khóc', staffName: 'GV Lê Thị Mai' },
];

export const MOCK_INCIDENTS: BoardingIncident[] = [
  { id: 'INC01', studentId: 'BS06', studentName: 'Đặng Thị Ngọc', className: '4A', roomId: 'RM03', type: 'no_sleep', description: 'HS không ngủ giờ nghỉ trưa, nằm khóc một mình, không chịu chia sẻ lý do', occurredAt: hoursAgo(3), handler: 'GV Lê Thị Mai', status: 'parent_notified', parentNotified: true, notes: 'Đã gọi cho PH, hẹn gặp trao đổi tuần tới' },
  { id: 'INC02', studentId: 'BS03', studentName: 'Lê Minh Tuấn',  className: '4C', roomId: 'RM02', type: 'sick', description: 'HS than đau bụng sau bữa trưa, mặt tái, đã đưa xuống phòng y tế', occurredAt: hoursAgo(1), handler: 'GV Trần Văn Minh', status: 'processing', parentNotified: false, notes: 'Y tá đang theo dõi tại PYT' },
  { id: 'INC03', studentId: 'BS02', studentName: 'Trần Anh Dũng',  className: '2B', roomId: 'RM01', type: 'discipline', description: 'HS chạy trong hành lang giờ nghỉ, vi phạm nội quy bán trú', occurredAt: hoursAgo(5), handler: 'GV Nguyễn Thị Hoa', status: 'resolved', parentNotified: false, notes: 'Đã nhắc nhở và ghi vào sổ theo dõi' },
];

export const STAFF_LIST = ['GV Nguyễn Thị Hoa', 'GV Trần Văn Minh', 'GV Lê Thị Mai', 'GV Phạm Văn Nam', 'Điều phối bán trú'];

export function getStats(students: BoardingStudent[], attend: AttendRecord[], incidents: BoardingIncident[], rooms: BoardingRoom[]) {
  const total = students.length;
  const present = attend.filter(a => a.status === 'present').length;
  const absent = attend.filter(a => a.status === 'absent').length;
  const notRecorded = students.length - attend.length;
  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const activeRooms = rooms.filter(r => r.status === 'active' && r.currentCount > 0).length;
  const special = students.filter(s => s.notes).length;
  return { total, present, absent, notRecorded, openIncidents, activeRooms, special };
}
