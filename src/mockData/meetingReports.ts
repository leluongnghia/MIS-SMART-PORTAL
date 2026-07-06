// ============================================================
// MOCK DATA — THÔNG BÁO, NHẮC LỊCH & BÁO CÁO LỊCH HỌP
// ============================================================

export type NotifType =
  | 'meeting_new'
  | 'meeting_invited'
  | 'meeting_changed'
  | 'meeting_cancelled'
  | 'room_approved'
  | 'room_rejected'
  | 'minutes_sent'
  | 'task_assigned'
  | 'task_overdue'
  | 'reminder';

export type NotifChannel = 'system' | 'email' | 'zalo';
export type NotifStatus = 'unread' | 'read' | 'archived';

export interface MeetingNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  actor: string;
  meetingTitle: string;
  meetingDate: string;    // YYYY-MM-DD
  meetingTime: string;
  roomName: string | null;
  channel: NotifChannel[];
  status: NotifStatus;
  createdAt: string;
}

export interface ReminderConfig {
  id: string;
  label: string;
  minutesBefore: number;
  enabled: boolean;
  channels: NotifChannel[];
}

// ─── Seed notifications ────────────────────────────────────────
export const MEETING_NOTIFS: MeetingNotif[] = [
  {
    id: 'N001', type: 'reminder', status: 'unread',
    title: '⏰ Nhắc lịch: Họp giao ban tuần 28 còn 30 phút',
    body: 'Cuộc họp sắp bắt đầu lúc 07:30. Phòng: Phòng họp B (P.301). Chủ trì: Nguyễn Văn Minh. Trạng thái của bạn: Tham dự.',
    actor: 'Hệ thống', meetingTitle: 'Họp giao ban tuần 28',
    meetingDate: '2026-07-06', meetingTime: '07:30', roomName: 'Phòng họp B (P.301)',
    channel: ['system'], createdAt: '2026-07-06T07:00:00',
  },
  {
    id: 'N002', type: 'meeting_invited', status: 'unread',
    title: '📅 Bạn được mời tham dự: Họp BGH – Chiến lược Q3',
    body: 'Nguyễn Văn Minh mời bạn tham dự cuộc họp ngày 04/07 lúc 15:00. Phòng: Phòng BGH.',
    actor: 'Nguyễn Văn Minh', meetingTitle: 'Họp BGH – Chiến lược tuyển sinh Q3',
    meetingDate: '2026-07-04', meetingTime: '15:00', roomName: 'Phòng BGH',
    channel: ['system', 'email'], createdAt: '2026-07-03T08:00:00',
  },
  {
    id: 'N003', type: 'room_approved', status: 'read',
    title: '✅ Đặt phòng được duyệt: Phòng họp B (P.301)',
    body: 'Yêu cầu đặt phòng ngày 06/07 lúc 07:00–09:00 đã được Trần Thị Hoa duyệt.',
    actor: 'Trần Thị Hoa', meetingTitle: 'Họp giao ban tuần 28',
    meetingDate: '2026-07-05', meetingTime: '10:00', roomName: 'Phòng họp B (P.301)',
    channel: ['system'], createdAt: '2026-07-05T10:00:00',
  },
  {
    id: 'N004', type: 'task_assigned', status: 'unread',
    title: '🎯 Nhiệm vụ mới được giao: Kế hoạch chiến dịch học bổng',
    body: 'Nguyễn Văn Minh giao cho bạn: "Xây dựng kế hoạch chi tiết chiến dịch Học bổng tài năng 2026". Hạn: 10/07/2026.',
    actor: 'Nguyễn Văn Minh', meetingTitle: 'Họp BGH – Chiến lược tuyển sinh Q3',
    meetingDate: '2026-07-04', meetingTime: '17:30', roomName: null,
    channel: ['system', 'email'], createdAt: '2026-07-04T17:30:00',
  },
  {
    id: 'N005', type: 'task_overdue', status: 'unread',
    title: '🚨 Nhiệm vụ quá hạn: Cải thiện quy trình tiếp nhận hồ sơ',
    body: 'Nhiệm vụ "Cải thiện quy trình tiếp nhận hồ sơ (target 24h)" đã quá hạn 08/07. Vui lòng cập nhật tiến độ.',
    actor: 'Hệ thống', meetingTitle: 'Họp BGH – Chiến lược tuyển sinh Q3',
    meetingDate: '2026-07-08', meetingTime: '—', roomName: null,
    channel: ['system'], createdAt: '2026-07-09T08:00:00',
  },
  {
    id: 'N006', type: 'minutes_sent', status: 'read',
    title: '📝 Biên bản họp đã được gửi: Họp BGH – Chiến lược tuyển sinh Q3',
    body: 'Lê Văn Bình đã gửi biên bản cuộc họp ngày 04/07 đến tất cả người tham dự.',
    actor: 'Lê Văn Bình', meetingTitle: 'Họp BGH – Chiến lược tuyển sinh Q3',
    meetingDate: '2026-07-04', meetingTime: '18:00', roomName: null,
    channel: ['system', 'email'], createdAt: '2026-07-04T18:00:00',
  },
  {
    id: 'N007', type: 'room_rejected', status: 'read',
    title: '❌ Đặt phòng bị từ chối: Hội trường chính',
    body: 'Yêu cầu đặt Hội trường chính bị từ chối. Lý do: Đã có lịch sự kiện khác.',
    actor: 'Trần Thị Hoa', meetingTitle: 'Sự kiện nội bộ tháng 7',
    meetingDate: '2026-07-03', meetingTime: '11:00', roomName: 'Hội trường chính',
    channel: ['system'], createdAt: '2026-07-03T11:00:00',
  },
  {
    id: 'N008', type: 'meeting_cancelled', status: 'read',
    title: '🚫 Cuộc họp bị hủy: Họp chuyên môn Tiểu học',
    body: 'Phạm Thị Lan đã hủy cuộc họp ngày 03/07. Lý do: Người chủ trì vắng mặt đột xuất.',
    actor: 'Phạm Thị Lan', meetingTitle: 'Họp chuyên môn Tiểu học',
    meetingDate: '2026-07-03', meetingTime: '09:00', roomName: 'Phòng chuyên môn A',
    channel: ['system', 'email'], createdAt: '2026-07-03T08:00:00',
  },
];

// ─── Reminder configs ───────────────────────────────────────────
export const REMINDER_CONFIGS: ReminderConfig[] = [
  { id: 'R1', label: 'Trước 1 ngày',  minutesBefore: 1440, enabled: true,  channels: ['system', 'email'] },
  { id: 'R2', label: 'Trước 1 giờ',   minutesBefore: 60,   enabled: true,  channels: ['system'] },
  { id: 'R3', label: 'Trước 30 phút', minutesBefore: 30,   enabled: true,  channels: ['system'] },
  { id: 'R4', label: 'Trước 15 phút', minutesBefore: 15,   enabled: false, channels: ['system'] },
];

// ─── Report data ────────────────────────────────────────────────
export interface MonthlyMeetingStat {
  month: string;   // "Th1", "Th2"...
  total: number;
  cancelled: number;
  completed: number;
}

export interface DeptStat { dept: string; count: number; }
export interface TypeStat { type: string; count: number; color: string; }
export interface RoomUsage { room: string; bookings: number; hours: number; utilPct: number; }
export interface AdminAlert {
  id: string; severity: 'high'|'medium'|'low';
  icon: string; title: string; detail: string; count: number;
}

export const MONTHLY_STATS: MonthlyMeetingStat[] = [
  { month: 'Th1', total: 18, cancelled: 2, completed: 16 },
  { month: 'Th2', total: 14, cancelled: 1, completed: 13 },
  { month: 'Th3', total: 22, cancelled: 3, completed: 19 },
  { month: 'Th4', total: 20, cancelled: 2, completed: 18 },
  { month: 'Th5', total: 25, cancelled: 4, completed: 21 },
  { month: 'Th6', total: 19, cancelled: 1, completed: 18 },
  { month: 'Th7', total: 12, cancelled: 2, completed: 10 },
];

export const DEPT_STATS: DeptStat[] = [
  { dept: 'Ban Giám Hiệu', count: 24 },
  { dept: 'P. Tuyển sinh',  count: 18 },
  { dept: 'Tổ Tiểu học',   count: 15 },
  { dept: 'Tổ THCS',        count: 14 },
  { dept: 'Tổ THPT',        count: 12 },
  { dept: 'P. Hành chính',  count: 11 },
  { dept: 'P. Kế toán',     count: 7  },
  { dept: 'P. Marketing',   count: 9  },
];

export const TYPE_STATS: TypeStat[] = [
  { type: 'Họp giao ban',   count: 28, color: '#3b82f6' },
  { type: 'Họp chuyên môn', count: 22, color: '#10b981' },
  { type: 'Họp BGH',        count: 14, color: '#6366f1' },
  { type: 'Họp phụ huynh',  count: 12, color: '#f59e0b' },
  { type: 'Họp vận hành',   count: 10, color: '#ef4444' },
  { type: 'Họp toàn trường',count: 8,  color: '#8b5cf6' },
  { type: 'Khác',           count: 6,  color: '#94a3b8' },
];

export const ROOM_USAGE: RoomUsage[] = [
  { room: 'Phòng họp B (P.301)',  bookings: 42, hours: 84,  utilPct: 78 },
  { room: 'Phòng họp A (P.201)',  bookings: 35, hours: 70,  utilPct: 65 },
  { room: 'Phòng BGH',            bookings: 28, hours: 56,  utilPct: 52 },
  { room: 'Phòng hội đồng A',     bookings: 20, hours: 60,  utilPct: 45 },
  { room: 'Phòng chuyên môn A',   bookings: 18, hours: 36,  utilPct: 33 },
  { room: 'Hội trường chính',     bookings: 8,  hours: 40,  utilPct: 28 },
];

export const ADMIN_ALERTS: AdminAlert[] = [
  { id: 'AA1', severity: 'high',   icon: '🏢', title: 'Phòng họp B quá tải',         detail: 'Sử dụng 78% — cao nhất tháng. Cân nhắc mở thêm phòng chức năng.', count: 42 },
  { id: 'AA2', severity: 'high',   icon: '📝', title: 'Biên bản chưa hoàn thành',    detail: '3 cuộc họp đã kết thúc nhưng chưa có biên bản hoặc chưa duyệt.', count: 3 },
  { id: 'AA3', severity: 'high',   icon: '🎯', title: 'Nhiệm vụ sau họp quá hạn',    detail: '4 nhiệm vụ đã quá hạn, chưa có cập nhật tiến độ từ người phụ trách.', count: 4 },
  { id: 'AA4', severity: 'medium', icon: '🚫', title: 'Tỷ lệ hủy họp tăng',         detail: 'Tháng 7 có 2/12 cuộc họp bị hủy (16%). Cao hơn trung bình 6 tháng trước.', count: 2 },
  { id: 'AA5', severity: 'medium', icon: '⏳', title: 'Người chưa phản hồi lời mời', detail: '3 người chưa phản hồi thư mời họp giao ban tuần 28 (họp ngày mai).', count: 3 },
  { id: 'AA6', severity: 'low',    icon: '📊', title: 'Báo cáo tháng 6 chưa xuất',  detail: 'Báo cáo sử dụng phòng tháng 6 chưa được xuất và gửi BGH.', count: 1 },
];

// ─── Attendance summary (for report) ───────────────────────────
export const ATTENDANCE_SUMMARY = {
  totalInvited: 130,
  attended: 98,
  absent: 18,
  excused: 8,
  pending: 6,
  attendRate: 75.4,
};
