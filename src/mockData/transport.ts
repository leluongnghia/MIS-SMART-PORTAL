// ============================================================
// MOCK DATA — MODULE XE ĐƯA ĐÓN
// ============================================================

export type RouteStatus = 'active' | 'paused' | 'schedule_changed';
export type StudentRegStatus = 'active' | 'paused' | 'cancelled';
export type BoardStatus = 'boarded' | 'alighted' | 'absent' | 'parent_pickup' | 'no_show';
export type IncidentType = 'late' | 'breakdown' | 'traffic' | 'student_absent' | 'wrong_stop' | 'safety' | 'parent_complaint';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';

export interface Stop {
  id: string;
  name: string;
  address: string;
  pickupTime: string;  // HH:mm
  dropoffTime: string;
  order: number;
}

export interface TransportRoute {
  id: string;
  code: string;
  name: string;
  area: string;
  plate: string;
  driverName: string;
  driverPhone: string;
  assistantName: string;
  status: RouteStatus;
  stops: Stop[];
  studentCount: number;
  boardedCount: number;
  alightedCount: number;
}

export interface TransportStudent {
  id: string;
  name: string;
  className: string;
  parentName: string;
  parentPhone: string;
  routeId: string;
  routeName: string;
  pickupStop: string;
  dropoffStop: string;
  emergencyPhone: string;
  regStatus: StudentRegStatus;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  routeId: string;
  routeName: string;
  date: string;
  direction: 'pickup' | 'dropoff';
  status: BoardStatus;
  checkinTime: string | null;
  notes: string;
}

export interface TransportIncident {
  id: string;
  routeId: string;
  routeName: string;
  studentId: string | null;
  studentName: string | null;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  handler: string;
  status: IncidentStatus;
  occurredAt: string;
  resolvedAt: string | null;
  attachments: string[];
}

// ─── Config maps ──────────────────────────────────────────────
export const ROUTE_STATUS: Record<RouteStatus, { label: string; color: string; dot: string }> = {
  active:           { label: 'Đang hoạt động',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  paused:           { label: 'Tạm dừng',         color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  schedule_changed: { label: 'Đổi lịch',         color: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500' },
};

export const BOARD_STATUS: Record<BoardStatus, { label: string; color: string }> = {
  boarded:       { label: 'Đã lên xe',          color: 'bg-blue-50 text-blue-700 border-blue-200' },
  alighted:      { label: 'Đã xuống xe',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent:        { label: 'Vắng mặt',           color: 'bg-rose-50 text-rose-700 border-rose-200' },
  parent_pickup: { label: 'PH đón riêng',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
  no_show:       { label: 'Không thấy tại điểm',color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export const INCIDENT_TYPE: Record<IncidentType, { label: string; icon: string }> = {
  late:              { label: 'Xe trễ',              icon: '⏰' },
  breakdown:         { label: 'Xe hỏng',             icon: '🔧' },
  traffic:           { label: 'Tắc đường',           icon: '🚦' },
  student_absent:    { label: 'Học sinh vắng',       icon: '👤' },
  wrong_stop:        { label: 'Nhầm điểm đón/trả',  icon: '📍' },
  safety:            { label: 'Sự cố an toàn',       icon: '🚨' },
  parent_complaint:  { label: 'Phụ huynh phản ánh', icon: '📣' },
};

export const SEVERITY: Record<IncidentSeverity, { label: string; color: string }> = {
  low:      { label: 'Thấp',      color: 'bg-slate-100 text-slate-600 border-slate-200' },
  medium:   { label: 'Vừa',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  high:     { label: 'Cao',       color: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Nghiêm trọng', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const INCIDENT_STATUS: Record<IncidentStatus, { label: string; color: string }> = {
  open:        { label: 'Mới',         color: 'bg-rose-50 text-rose-700 border-rose-200' },
  in_progress: { label: 'Đang xử lý', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved:    { label: 'Đã xử lý',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// ─── Seed data ─────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const now = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export const MOCK_ROUTES: TransportRoute[] = [
  {
    id: 'R01', code: 'TX-Q7-01', name: 'Tuyến Quận 7 - Phú Mỹ Hưng', area: 'Quận 7',
    plate: '51B-123.45', driverName: 'Trần Văn Hùng', driverPhone: '0901234567', assistantName: 'Nguyễn Thị Lan',
    status: 'active', studentCount: 32, boardedCount: 28, alightedCount: 28,
    stops: [
      { id: 's1', name: 'Cổng KDC Phú Mỹ', address: '18 Nguyễn Lương Bằng, Q7', pickupTime: '06:30', dropoffTime: '17:00', order: 1 },
      { id: 's2', name: 'Siêu thị SC VivoCity', address: '1058 Nguyễn Văn Linh, Q7', pickupTime: '06:45', dropoffTime: '17:15', order: 2 },
      { id: 's3', name: 'Ngã tư Nguyễn Hữu Thọ', address: 'Nguyễn Hữu Thọ, Q7', pickupTime: '07:00', dropoffTime: '17:30', order: 3 },
    ],
  },
  {
    id: 'R02', code: 'TX-BT-01', name: 'Tuyến Bình Thạnh - Thảo Điền', area: 'Bình Thạnh',
    plate: '51F-456.78', driverName: 'Lê Văn Đức', driverPhone: '0912345678', assistantName: 'Phạm Thị Hoa',
    status: 'active', studentCount: 25, boardedCount: 22, alightedCount: 0,
    stops: [
      { id: 's4', name: 'Chung cư Vinhomes Central', address: '208 Nguyễn Hữu Cảnh, BT', pickupTime: '06:35', dropoffTime: '17:05', order: 1 },
      { id: 's5', name: 'Trường tiểu học Đinh Tiên Hoàng', address: '14 Đinh Tiên Hoàng, BT', pickupTime: '06:50', dropoffTime: '17:20', order: 2 },
    ],
  },
  {
    id: 'R03', code: 'TX-GV-02', name: 'Tuyến Gò Vấp - Phan Văn Trị', area: 'Gò Vấp',
    plate: '51G-789.01', driverName: 'Nguyễn Văn Minh', driverPhone: '0923456789', assistantName: 'Trần Thị Mai',
    status: 'schedule_changed', studentCount: 28, boardedCount: 0, alightedCount: 0,
    stops: [
      { id: 's6', name: 'Chợ Gò Vấp', address: '56 Nguyễn Kiệm, GV', pickupTime: '06:40', dropoffTime: '17:10', order: 1 },
      { id: 's7', name: 'UBND Gò Vấp', address: '2 Dương Quảng Hàm, GV', pickupTime: '06:55', dropoffTime: '17:25', order: 2 },
    ],
  },
  {
    id: 'R04', code: 'TX-PN-03', name: 'Tuyến Phú Nhuận - Nguyễn Văn Trỗi', area: 'Phú Nhuận',
    plate: '51H-234.56', driverName: 'Đặng Văn Tài', driverPhone: '0934567890', assistantName: 'Lê Thị Bích',
    status: 'paused', studentCount: 20, boardedCount: 0, alightedCount: 0,
    stops: [],
  },
];

export const MOCK_STUDENTS: TransportStudent[] = [
  { id: 'ST01', name: 'Nguyễn Minh Khang', className: '3A', parentName: 'Nguyễn Thị Mai', parentPhone: '0901111111', routeId: 'R01', routeName: 'Tuyến Quận 7', pickupStop: 'Cổng KDC Phú Mỹ', dropoffStop: 'Cổng KDC Phú Mỹ', emergencyPhone: '0901111112', regStatus: 'active' },
  { id: 'ST02', name: 'Trần Anh Dũng', className: '2B', parentName: 'Trần Thị Lan', parentPhone: '0902222222', routeId: 'R01', routeName: 'Tuyến Quận 7', pickupStop: 'Siêu thị SC VivoCity', dropoffStop: 'Siêu thị SC VivoCity', emergencyPhone: '0902222223', regStatus: 'active' },
  { id: 'ST03', name: 'Lê Minh Tuấn', className: '4C', parentName: 'Lê Văn Đức', parentPhone: '0903333333', routeId: 'R02', routeName: 'Tuyến Bình Thạnh', pickupStop: 'Chung cư Vinhomes Central', dropoffStop: 'Chung cư Vinhomes Central', emergencyPhone: '0903333334', regStatus: 'active' },
  { id: 'ST04', name: 'Phạm Thu Hương', className: '5B', parentName: 'Phạm Văn Nam', parentPhone: '0904444444', routeId: 'R03', routeName: 'Tuyến Gò Vấp', pickupStop: 'Chợ Gò Vấp', dropoffStop: 'Chợ Gò Vấp', emergencyPhone: '0904444445', regStatus: 'paused' },
  { id: 'ST05', name: 'Hoàng Đức Anh', className: '1A', parentName: 'Hoàng Thị Thu', parentPhone: '0905555555', routeId: 'R01', routeName: 'Tuyến Quận 7', pickupStop: 'Ngã tư Nguyễn Hữu Thọ', dropoffStop: 'Ngã tư Nguyễn Hữu Thọ', emergencyPhone: '0905555556', regStatus: 'active' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'A01', studentId: 'ST01', studentName: 'Nguyễn Minh Khang', className: '3A', routeId: 'R01', routeName: 'Tuyến Quận 7', date: TODAY, direction: 'pickup', status: 'boarded', checkinTime: '06:33', notes: '' },
  { id: 'A02', studentId: 'ST02', studentName: 'Trần Anh Dũng', className: '2B', routeId: 'R01', routeName: 'Tuyến Quận 7', date: TODAY, direction: 'pickup', status: 'boarded', checkinTime: '06:48', notes: '' },
  { id: 'A03', studentId: 'ST05', studentName: 'Hoàng Đức Anh', className: '1A', routeId: 'R01', routeName: 'Tuyến Quận 7', date: TODAY, direction: 'pickup', status: 'absent', checkinTime: null, notes: 'PH báo bé ốm' },
  { id: 'A04', studentId: 'ST03', studentName: 'Lê Minh Tuấn', className: '4C', routeId: 'R02', routeName: 'Tuyến Bình Thạnh', date: TODAY, direction: 'pickup', status: 'boarded', checkinTime: '06:38', notes: '' },
];

export const MOCK_INCIDENTS: TransportIncident[] = [
  {
    id: 'INC01', routeId: 'R01', routeName: 'Tuyến Quận 7', studentId: null, studentName: null,
    type: 'traffic', severity: 'medium', description: 'Kẹt xe nghiêm trọng tại cầu Kênh Tẻ, dự kiến đến trường trễ 20 phút.',
    handler: 'Trần Văn Hùng', status: 'in_progress',
    occurredAt: new Date(Date.now() - 30 * 60000).toISOString(), resolvedAt: null, attachments: [],
  },
  {
    id: 'INC02', routeId: 'R01', routeName: 'Tuyến Quận 7', studentId: 'ST05', studentName: 'Hoàng Đức Anh',
    type: 'student_absent', severity: 'low', description: 'Học sinh Hoàng Đức Anh không ra điểm đón lúc 06:35. Đã liên hệ phụ huynh.',
    handler: 'Nguyễn Thị Lan', status: 'resolved',
    occurredAt: new Date(Date.now() - 90 * 60000).toISOString(), resolvedAt: new Date(Date.now() - 60 * 60000).toISOString(), attachments: [],
  },
  {
    id: 'INC03', routeId: 'R03', routeName: 'Tuyến Gò Vấp', studentId: null, studentName: null,
    type: 'breakdown', severity: 'high', description: 'Xe 51G-789.01 bị hỏng lốp tại Phan Văn Trị. Đã gọi xe dự phòng.',
    handler: 'Điều phối trung tâm', status: 'resolved',
    occurredAt: new Date(Date.now() - 2 * 3600000).toISOString(), resolvedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(), attachments: ['anh-xe-hong.jpg'],
  },
];

export const MOCK_STAFF = ['Trần Văn Hùng', 'Lê Văn Đức', 'Nguyễn Văn Minh', 'Điều phối trung tâm', 'Nguyễn Thị Lan'];
