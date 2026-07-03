// ============================================================
// MOCK DATA - MODULE AN NINH / AN TOÀN
// ============================================================

export type GuestStatus = 'Đang trong trường' | 'Đã rời trường' | 'Từ chối vào';
export type PickupStatus = 'Đã đón' | 'Chưa đón' | 'Đón muộn' | 'Đón thay' | 'Bất thường';
export type ShiftType = 'Sáng' | 'Chiều' | 'Tối' | 'Đêm';
export type IncidentType =
  | 'Người lạ'
  | 'Học sinh ra khỏi khu vực'
  | 'Té ngã'
  | 'Xô xát'
  | 'Mất đồ'
  | 'Va chạm'
  | 'Cháy nổ'
  | 'Nguy cơ mất an toàn'
  | 'Sự cố khác';
export type SeverityLevel = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
export type IncidentStatus =
  | 'Mới ghi nhận'
  | 'Đang xử lý'
  | 'Chờ xác minh'
  | 'Đã xử lý'
  | 'Đóng sự cố';
export type CameraStatus = 'Hoạt động' | 'Lỗi' | 'Mất kết nối' | 'Đang bảo trì';
export type FireSafetyItemType = 'Bình chữa cháy' | 'Lối thoát hiểm' | 'Đèn exit' | 'Nội quy an toàn' | 'Thiết bị báo cháy';
export type PatrolResult = 'Bình thường' | 'Bất thường';

// ─── Khách ra vào ────────────────────────────────────────────
export interface Guest {
  id: string;
  name: string;
  phone: string;
  organization: string;
  reason: string;
  meetWith: string;
  checkIn: string;
  checkOut?: string;
  confirmedBy: string;
  status: GuestStatus;
  notes?: string;
}

// ─── Đón trả học sinh ────────────────────────────────────────
export interface PickupRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  authorizedPickups: { name: string; relation: string; phone: string }[];
  pickedBy?: string;
  pickedByRelation?: string;
  pickedByPhone?: string;
  status: PickupStatus;
  time?: string;
  confirmedBy?: string;
  notes?: string;
}

// ─── Nhật ký bảo vệ ──────────────────────────────────────────
export interface GuardLog {
  id: string;
  shift: ShiftType;
  staff: string[];
  startTime: string;
  endTime?: string;
  gateStatus: string;
  incidents: string;
  handoverNotes: string;
  handoverTo?: string;
  status: 'Đang trực' | 'Đã bàn giao';
}

// ─── Tuần tra ────────────────────────────────────────────────
export interface PatrolChecklist {
  item: string;
  checked: boolean;
  note?: string;
}

export interface PatrolRecord {
  id: string;
  area: string;
  patrolBy: string;
  scheduledTime: string;
  actualTime?: string;
  checklist: PatrolChecklist[];
  result: PatrolResult;
  notes?: string;
  status: 'Chưa thực hiện' | 'Đang tuần tra' | 'Hoàn thành';
}

// ─── Sự cố ───────────────────────────────────────────────────
export interface SecurityIncident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  location: string;
  occurredAt: string;
  reportedBy: string;
  handledBy?: string;
  studentsInvolved?: string[];
  description: string;
  status: IncidentStatus;
  resolution?: string;
  createdAt: string;
}

// ─── Camera ──────────────────────────────────────────────────
export interface Camera {
  id: string;
  name: string;
  location: string;
  deviceCode: string;
  status: CameraStatus;
  lastChecked: string;
  assignee: string;
  notes?: string;
}

// ─── PCCC ────────────────────────────────────────────────────
export interface FireSafetyItem {
  id: string;
  type: FireSafetyItemType;
  name: string;
  location: string;
  lastInspected: string;
  nextInspection: string;
  status: 'Tốt' | 'Cần bảo dưỡng' | 'Hỏng' | 'Quá hạn kiểm tra';
  assignee: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

export const SECURITY_KPI = {
  guestsInside: 8,
  guestsTodayIn: 23,
  guestsTodayOut: 15,
  latePickups: 4,
  openIncidents: 3,
  activeShifts: 2,
  camerasError: 2,
  fireSafetyOverdue: 1,
};

export const GUESTS: Guest[] = [
  {
    id: 'g1',
    name: 'Đoàn Kiểm tra Sở GDĐT',
    phone: '0901234567',
    organization: 'Sở Giáo dục & Đào tạo',
    reason: 'Kiểm tra cơ sở vật chất',
    meetWith: 'Ban Giám Hiệu',
    checkIn: '08:00',
    confirmedBy: 'BGH. Nguyễn Minh Tuấn',
    status: 'Đang trong trường',
  },
  {
    id: 'g2',
    name: 'Nguyễn Văn Phụ Huynh',
    phone: '0912345678',
    organization: 'Phụ huynh HS',
    reason: 'Đóng học phí',
    meetWith: 'Phòng Kế toán',
    checkIn: '09:15',
    checkOut: '09:45',
    confirmedBy: 'NV. Kế toán Thu',
    status: 'Đã rời trường',
  },
  {
    id: 'g3',
    name: 'Kỹ thuật bảo trì thang máy',
    phone: '0923456789',
    organization: 'Cty Thang máy Minh Phú',
    reason: 'Bảo trì định kỳ',
    meetWith: 'Phòng Hành chính',
    checkIn: '09:30',
    confirmedBy: 'HC. Trần Thị Hoa',
    status: 'Đang trong trường',
  },
  {
    id: 'g4',
    name: 'Lê Thị Phụ Huynh',
    phone: '0934567890',
    organization: 'Phụ huynh HS',
    reason: 'Gặp giáo viên chủ nhiệm',
    meetWith: 'GVCN 10A2',
    checkIn: '10:00',
    checkOut: '10:30',
    confirmedBy: 'GV. Phạm Hương',
    status: 'Đã rời trường',
  },
  {
    id: 'g5',
    name: 'Nhóm phóng viên báo Tuổi Trẻ',
    phone: '0945678901',
    organization: 'Báo Tuổi Trẻ',
    reason: 'Phóng sự học đường',
    meetWith: 'Ban Giám Hiệu',
    checkIn: '14:00',
    confirmedBy: 'BGH. Lê Thu Hà',
    status: 'Đang trong trường',
    notes: 'Cần xuất trình thẻ nhà báo',
  },
  {
    id: 'g6',
    name: 'Trần Văn Không Hẹn',
    phone: '0956789012',
    organization: 'Không rõ',
    reason: 'Tự xưng tìm học sinh',
    meetWith: '',
    checkIn: '11:00',
    confirmedBy: 'BV. Minh',
    status: 'Từ chối vào',
    notes: 'Không có giấy tờ hợp lệ, không liên lạc được với học sinh',
  },
];

export const PICKUP_RECORDS: PickupRecord[] = [
  {
    id: 'p1',
    studentId: 'hs001',
    studentName: 'Nguyễn Minh Khoa',
    class: '6A1',
    authorizedPickups: [
      { name: 'Nguyễn Văn Nam', relation: 'Bố', phone: '0901111111' },
      { name: 'Trần Thị Mai', relation: 'Mẹ', phone: '0902222222' },
    ],
    pickedBy: 'Nguyễn Văn Nam',
    pickedByRelation: 'Bố',
    pickedByPhone: '0901111111',
    status: 'Đã đón',
    time: '16:30',
    confirmedBy: 'BV. Hùng',
  },
  {
    id: 'p2',
    studentId: 'hs002',
    studentName: 'Lê Thị Hoa',
    class: '7B2',
    authorizedPickups: [
      { name: 'Lê Văn Bình', relation: 'Bố', phone: '0903333333' },
    ],
    status: 'Chưa đón',
  },
  {
    id: 'p3',
    studentId: 'hs003',
    studentName: 'Phạm Quốc Tuấn',
    class: '8C1',
    authorizedPickups: [
      { name: 'Phạm Văn Lộc', relation: 'Bố', phone: '0904444444' },
      { name: 'Nguyễn Thị Lan', relation: 'Mẹ', phone: '0905555555' },
    ],
    pickedBy: 'Bà Nguyễn Thị Kim',
    pickedByRelation: 'Bà ngoại',
    pickedByPhone: '0906666666',
    status: 'Đón thay',
    time: '17:15',
    confirmedBy: 'GVCN. Hoàng Lan',
    notes: 'Mẹ gọi điện báo trước, có xác nhận qua điện thoại',
  },
  {
    id: 'p4',
    studentId: 'hs004',
    studentName: 'Trần Khánh Linh',
    class: '9A3',
    authorizedPickups: [
      { name: 'Trần Văn Hải', relation: 'Bố', phone: '0907777777' },
      { name: 'Lê Thị Thu', relation: 'Mẹ', phone: '0908888888' },
    ],
    pickedBy: 'Trần Văn Hải',
    pickedByRelation: 'Bố',
    pickedByPhone: '0907777777',
    status: 'Đón muộn',
    time: '17:45',
    confirmedBy: 'BV. Tuấn',
    notes: 'Đón sau 17:30 (quy định)',
  },
  {
    id: 'p5',
    studentId: 'hs005',
    studentName: 'Vũ Đức Thịnh',
    class: '6B3',
    authorizedPickups: [
      { name: 'Vũ Văn Đức', relation: 'Bố', phone: '0909999999' },
    ],
    pickedBy: 'Người lạ - không xác định',
    status: 'Bất thường',
    time: '16:50',
    confirmedBy: 'BV. Minh',
    notes: 'Người đến đón không có trong danh sách, không liên lạc được bố. ĐÃ TẠO SỰ CỐ AN NINH #SC006',
  },
];

export const GUARD_LOGS: GuardLog[] = [
  {
    id: 'gl1',
    shift: 'Sáng',
    staff: ['BV. Nguyễn Văn Hùng', 'BV. Trần Minh'],
    startTime: '06:00',
    endTime: '13:00',
    gateStatus: 'Cổng chính mở, cổng phụ khóa. Hoạt động bình thường.',
    incidents: 'Có 1 xe tải giao hàng vào 07:30, đã kiểm tra và cho qua.',
    handoverNotes: 'Bàn giao ca chiều: Đoàn Sở GDĐT vẫn đang làm việc tại tầng 2. Cổng phụ khu A cần kiểm tra khóa.',
    handoverTo: 'BV. Phạm Tuấn',
    status: 'Đã bàn giao',
  },
  {
    id: 'gl2',
    shift: 'Chiều',
    staff: ['BV. Phạm Tuấn', 'BV. Lê Hoàng'],
    startTime: '13:00',
    gateStatus: 'Cổng chính hoạt động. Cổng phụ khu A đã kiểm tra và khóa chắc.',
    incidents: 'Phát hiện 1 học sinh định trèo tường lúc 15:30. Đã xử lý và thông báo GVCN.',
    handoverNotes: '',
    status: 'Đang trực',
  },
];

export const PATROL_RECORDS: PatrolRecord[] = [
  {
    id: 'pr1',
    area: 'Cổng trường & khu vực cổng',
    patrolBy: 'BV. Nguyễn Văn Hùng',
    scheduledTime: '07:00',
    actualTime: '07:05',
    checklist: [
      { item: 'Kiểm tra khóa cổng phụ', checked: true },
      { item: 'Kiểm tra camera cổng', checked: true },
      { item: 'Đèn chiếu sáng hoạt động', checked: true },
      { item: 'Khu vực sạch sẽ', checked: true },
    ],
    result: 'Bình thường',
    status: 'Hoàn thành',
  },
  {
    id: 'pr2',
    area: 'Sân trường & hành lang',
    patrolBy: 'BV. Trần Minh',
    scheduledTime: '08:00',
    actualTime: '08:10',
    checklist: [
      { item: 'Không có người lạ', checked: true },
      { item: 'Học sinh trong khu vực quy định', checked: false, note: 'Phát hiện 3 HS 9A chơi ở khu vực cấm' },
      { item: 'Đèn hành lang hoạt động', checked: true },
      { item: 'Cửa phòng chức năng đã khóa', checked: true },
    ],
    result: 'Bất thường',
    notes: 'Đã nhắc nhở học sinh và thông báo GVCN 9A',
    status: 'Hoàn thành',
  },
  {
    id: 'pr3',
    area: 'Nhà xe & bãi đỗ xe',
    patrolBy: 'BV. Lê Hoàng',
    scheduledTime: '14:00',
    checklist: [
      { item: 'Không có xe lạ không xác định', checked: false },
      { item: 'Camera nhà xe hoạt động', checked: false },
      { item: 'Biển số xe ghi nhận đầy đủ', checked: false },
    ],
    result: 'Bình thường',
    status: 'Chưa thực hiện',
  },
];

export const SECURITY_INCIDENTS: SecurityIncident[] = [
  {
    id: 'sc001',
    type: 'Người lạ',
    severity: 'Cao',
    location: 'Cổng trường',
    occurredAt: '2026-07-03 11:00',
    reportedBy: 'BV. Minh',
    handledBy: 'Tổ trưởng BV. Hùng',
    description: 'Người lạ tiếp cận cổng tự xưng tìm học sinh, không có giấy tờ hợp lệ. Từ chối vào và ghi nhận thông tin.',
    status: 'Đã xử lý',
    resolution: 'Từ chối vào, ghi nhận thông tin, chụp ảnh và lưu hồ sơ.',
    createdAt: '2026-07-03 11:05',
  },
  {
    id: 'sc002',
    type: 'Té ngã',
    severity: 'Trung bình',
    location: 'Hành lang tầng 2 - Khu B',
    occurredAt: '2026-07-03 09:45',
    reportedBy: 'GV. Phương',
    handledBy: 'Y tế trường',
    studentsInvolved: ['Đỗ Thị Hương - 8B2'],
    description: 'Học sinh Đỗ Thị Hương trượt ngã do sàn ướt sau khi vệ sinh. Đau đầu gối nhẹ.',
    status: 'Đã xử lý',
    resolution: 'Sơ cứu tại phòng y tế. Thông báo phụ huynh. Đặt biển cảnh báo sàn ướt.',
    createdAt: '2026-07-03 09:50',
  },
  {
    id: 'sc003',
    type: 'Học sinh ra khỏi khu vực',
    severity: 'Cao',
    location: 'Cổng phụ khu A',
    occurredAt: '2026-07-03 15:30',
    reportedBy: 'BV. Phạm Tuấn',
    handledBy: 'GVCN 10B1',
    studentsInvolved: ['Nguyễn Văn Tú - 10B1'],
    description: 'Phát hiện học sinh định trèo tường cổng phụ trong giờ học. Đã ngăn chặn kịp thời.',
    status: 'Đang xử lý',
    createdAt: '2026-07-03 15:35',
  },
  {
    id: 'sc004',
    type: 'Mất đồ',
    severity: 'Thấp',
    location: 'Nhà xe giáo viên',
    occurredAt: '2026-07-03 12:00',
    reportedBy: 'GV. Thanh',
    description: 'Xe máy của giáo viên bị mất gương chiếu hậu.',
    status: 'Đang xử lý',
    createdAt: '2026-07-03 12:30',
  },
  {
    id: 'sc005',
    type: 'Nguy cơ mất an toàn',
    severity: 'Khẩn cấp',
    location: 'Khu vực bếp ăn',
    occurredAt: '2026-07-03 10:30',
    reportedBy: 'NV. Bếp Lan',
    handledBy: 'Đội PCCC cơ sở',
    description: 'Phát hiện mùi gas rò rỉ tại khu bếp. Đã tắt nguồn và sơ tán khu vực.',
    status: 'Chờ xác minh',
    resolution: 'Đã gọi kỹ thuật gas đến kiểm tra. Chờ kết quả.',
    createdAt: '2026-07-03 10:35',
  },
  {
    id: 'sc006',
    type: 'Người lạ',
    severity: 'Cao',
    location: 'Cổng trường',
    occurredAt: '2026-07-03 16:50',
    reportedBy: 'BV. Minh',
    studentsInvolved: ['Vũ Đức Thịnh - 6B3'],
    description: 'Người đến đón học sinh 6B3 không có trong danh sách người được phép đón. Không liên lạc được với bố học sinh.',
    status: 'Đang xử lý',
    createdAt: '2026-07-03 16:55',
  },
];

export const CAMERAS: Camera[] = [
  { id: 'cam01', name: 'Camera Cổng Chính 1', location: 'Cổng chính - ngoài', deviceCode: 'CAM-GW-001', status: 'Hoạt động', lastChecked: '2026-07-01', assignee: 'BV. Hùng' },
  { id: 'cam02', name: 'Camera Cổng Chính 2', location: 'Cổng chính - trong', deviceCode: 'CAM-GW-002', status: 'Hoạt động', lastChecked: '2026-07-01', assignee: 'BV. Hùng' },
  { id: 'cam03', name: 'Camera Sân Trường A', location: 'Sân trường khu A', deviceCode: 'CAM-YARD-001', status: 'Hoạt động', lastChecked: '2026-06-28', assignee: 'IT. Tuấn' },
  { id: 'cam04', name: 'Camera Hành Lang T1', location: 'Hành lang tầng 1 - Khu B', deviceCode: 'CAM-HL-101', status: 'Lỗi', lastChecked: '2026-06-20', assignee: 'IT. Tuấn', notes: 'Lỗi hình ảnh nhiễu, đã báo kỹ thuật' },
  { id: 'cam05', name: 'Camera Nhà Xe GV', location: 'Nhà xe giáo viên', deviceCode: 'CAM-PARK-001', status: 'Mất kết nối', lastChecked: '2026-06-15', assignee: 'BV. Minh', notes: 'Mất tín hiệu từ 10/06, chưa xử lý' },
  { id: 'cam06', name: 'Camera Cổng Phụ A', location: 'Cổng phụ khu A', deviceCode: 'CAM-GW-003', status: 'Hoạt động', lastChecked: '2026-07-01', assignee: 'BV. Hùng' },
  { id: 'cam07', name: 'Camera Nhà Ăn', location: 'Nhà ăn học sinh', deviceCode: 'CAM-CAFET-001', status: 'Hoạt động', lastChecked: '2026-06-25', assignee: 'IT. Tuấn' },
  { id: 'cam08', name: 'Camera Khu Bán Trú', location: 'Khu bán trú tầng 3', deviceCode: 'CAM-BOARD-001', status: 'Đang bảo trì', lastChecked: '2026-07-02', assignee: 'IT. Tuấn', notes: 'Đang nâng cấp firmware' },
];

export const FIRE_SAFETY_ITEMS: FireSafetyItem[] = [
  {
    id: 'fs01',
    type: 'Bình chữa cháy',
    name: 'Bình CO2 - Tầng 1 Khu A',
    location: 'Hành lang tầng 1 khu A',
    lastInspected: '2026-04-01',
    nextInspection: '2026-10-01',
    status: 'Tốt',
    assignee: 'BV. Hùng',
  },
  {
    id: 'fs02',
    type: 'Bình chữa cháy',
    name: 'Bình CO2 - Bếp ăn',
    location: 'Khu vực bếp ăn',
    lastInspected: '2026-01-15',
    nextInspection: '2026-07-15',
    status: 'Cần bảo dưỡng',
    assignee: 'BV. Minh',
    notes: 'Sắp đến hạn kiểm tra, áp suất thấp',
  },
  {
    id: 'fs03',
    type: 'Lối thoát hiểm',
    name: 'Lối thoát - Tầng 2 Khu B',
    location: 'Cuối hành lang tầng 2 khu B',
    lastInspected: '2026-06-01',
    nextInspection: '2026-12-01',
    status: 'Tốt',
    assignee: 'HC. Hoa',
  },
  {
    id: 'fs04',
    type: 'Đèn exit',
    name: 'Đèn EXIT - Phòng chờ tầng 1',
    location: 'Phòng chờ tầng 1',
    lastInspected: '2026-03-01',
    nextInspection: '2026-06-01',
    status: 'Quá hạn kiểm tra',
    assignee: 'IT. Tuấn',
    notes: 'Quá hạn kiểm tra định kỳ 1 tháng',
  },
  {
    id: 'fs05',
    type: 'Thiết bị báo cháy',
    name: 'Đầu báo khói - Khu bán trú',
    location: 'Khu bán trú tầng 3',
    lastInspected: '2026-06-15',
    nextInspection: '2026-09-15',
    status: 'Tốt',
    assignee: 'IT. Tuấn',
  },
  {
    id: 'fs06',
    type: 'Bình chữa cháy',
    name: 'Bình bột ABC - Phòng Lab',
    location: 'Phòng Lab Hóa - Tầng 3',
    lastInspected: '2026-05-01',
    nextInspection: '2026-08-01',
    status: 'Tốt',
    assignee: 'GV. Lab Hóa',
  },
];
