// ============================================================
// MOCK DATA - MODULE LỊCH VẬN HÀNH
// ============================================================

export type TaskType =
  | 'Vệ sinh'
  | 'An ninh'
  | 'Xe đưa đón'
  | 'Nhà ăn'
  | 'Y tế'
  | 'Cơ sở vật chất'
  | 'Bán trú'
  | 'Sự kiện'
  | 'Bảo trì'
  | 'Phát sinh';

export type Priority = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';

export type TaskStatus =
  | 'Chưa nhận'
  | 'Đã nhận'
  | 'Đang làm'
  | 'Hoàn thành'
  | 'Quá hạn'
  | 'Cần làm lại'
  | 'Đã hủy';

export type RecurringFrequency =
  | 'Hằng ngày'
  | 'Hằng tuần'
  | 'Hằng tháng'
  | 'Theo thứ'
  | 'Theo ngày cụ thể'
  | 'Theo khoảng';

export type ShiftType = 'Sáng' | 'Chiều' | 'Tối' | 'Đêm';

// ─── Types ───────────────────────────────────────────────────

export interface TaskUpdate {
  at: string;
  by: string;
  note: string;
  progress?: number;
}

export interface OperationTask {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  area: string;
  assignedTo: string;
  coordinator?: string;
  assignedBy: string;
  startDate: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  notes?: string;
  isRecurring: boolean;
  recurringId?: string;
  updates: TaskUpdate[];
  tags?: string[];
}

export interface RecurringTask {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  area: string;
  assignedTo: string;
  priority: Priority;
  frequency: RecurringFrequency;
  daysOfWeek?: number[]; // 0=Sun..6=Sat
  dayOfMonth?: number;
  intervalDays?: number;
  startTime?: string;
  endTime?: string;
  activeFrom: string;
  activeTo?: string;
  isActive: boolean;
  lastGenerated?: string;
  nextDue?: string;
  completedCount: number;
  missedCount: number;
}

export interface ShiftHandover {
  id: string;
  shift: ShiftType;
  handoverBy: string;
  handoverTo: string;
  date: string;
  completedItems: string[];
  pendingItems: string[];
  incidents: string;
  assets: string;
  confirmedBy?: string;
  confirmedAt?: string;
  status: 'Chờ xác nhận' | 'Đã xác nhận';
}

export interface EventTask {
  item: string;
  assignedTo: string;
  status: 'Chưa làm' | 'Đang chuẩn bị' | 'Hoàn thành';
}

export interface OperationEvent {
  id: string;
  title: string;
  startDatetime: string;
  endDatetime: string;
  location: string;
  organizer: string;
  description: string;
  preparations: EventTask[];
  preChecklist: { item: string; checked: boolean }[];
  postChecklist: { item: string; checked: boolean }[];
  status: 'Lên kế hoạch' | 'Đang chuẩn bị' | 'Sẵn sàng' | 'Đang diễn ra' | 'Hoàn thành';
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

export const SCHEDULE_KPI = {
  totalToday: 24,
  pending: 8,
  inProgress: 5,
  completed: 9,
  overdue: 2,
  urgent: 3,
  upcomingEvents: 2,
  onDutyStaff: 6,
};

export const OPERATION_TASKS: OperationTask[] = [
  {
    id: 'ot001',
    title: 'Kiểm tra nhà vệ sinh sáng',
    type: 'Vệ sinh',
    description: 'Kiểm tra và vệ sinh toàn bộ nhà vệ sinh học sinh và giáo viên trước giờ học.',
    area: 'Toàn bộ nhà vệ sinh',
    assignedTo: 'Nguyễn Văn Hùng',
    assignedBy: 'Tổ trưởng vệ sinh',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '06:00',
    endTime: '07:00',
    priority: 'Cao',
    status: 'Hoàn thành',
    progress: 100,
    isRecurring: true,
    recurringId: 'rt001',
    updates: [
      { at: '06:05', by: 'Nguyễn Văn Hùng', note: 'Bắt đầu ca', progress: 10 },
      { at: '06:50', by: 'Nguyễn Văn Hùng', note: 'Hoàn thành tất cả khu vệ sinh', progress: 100 },
    ],
    tags: ['buổi sáng', 'định kỳ'],
  },
  {
    id: 'ot002',
    title: 'Kiểm tra camera an ninh tuần',
    type: 'An ninh',
    description: 'Kiểm tra hoạt động của toàn bộ hệ thống camera trong trường.',
    area: 'Toàn trường',
    assignedTo: 'Trần Minh Tuấn',
    coordinator: 'IT. Nguyễn Hải',
    assignedBy: 'Tổ trưởng bảo vệ',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '08:00',
    endTime: '09:30',
    priority: 'Trung bình',
    status: 'Đang làm',
    progress: 60,
    isRecurring: true,
    recurringId: 'rt002',
    updates: [
      { at: '08:05', by: 'Trần Minh Tuấn', note: 'Đã kiểm tra 5/8 camera khu A', progress: 60 },
    ],
    tags: ['tuần', 'camera'],
  },
  {
    id: 'ot003',
    title: 'Đón học sinh ngoại khoá',
    type: 'Xe đưa đón',
    description: 'Điều phối xe đón học sinh từ các điểm về sau giờ học ngoại khoá.',
    area: 'Cổng chính, Nhà thể chất',
    assignedTo: 'Lê Văn Bình',
    assignedBy: 'Phòng vận hành',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '16:30',
    endTime: '17:30',
    priority: 'Cao',
    status: 'Đã nhận',
    progress: 0,
    isRecurring: false,
    updates: [],
    tags: ['ngoại khoá'],
  },
  {
    id: 'ot004',
    title: 'Kiểm tra thực phẩm nhà bếp',
    type: 'Nhà ăn',
    description: 'Kiểm tra chất lượng và nguồn gốc thực phẩm nhập kho bếp.',
    area: 'Khu bếp ăn',
    assignedTo: 'Phạm Thị Lan',
    assignedBy: 'Trưởng bếp',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '06:30',
    endTime: '07:00',
    priority: 'Cao',
    status: 'Hoàn thành',
    progress: 100,
    isRecurring: true,
    recurringId: 'rt003',
    updates: [
      { at: '06:35', by: 'Phạm Thị Lan', note: 'Đã kiểm tra đủ hạn sử dụng, OK', progress: 100 },
    ],
    tags: ['buổi sáng', 'định kỳ'],
  },
  {
    id: 'ot005',
    title: 'Bảo trì máy lạnh phòng học',
    type: 'Bảo trì',
    description: 'Vệ sinh và bảo trì định kỳ hệ thống điều hòa khu B tầng 2.',
    area: 'Khu B - Tầng 2',
    assignedTo: 'Nguyễn Đức Thịnh',
    coordinator: 'Cty bảo trì Minh Phú',
    assignedBy: 'Phòng CSVC',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '13:00',
    endTime: '16:00',
    priority: 'Trung bình',
    status: 'Đang làm',
    progress: 40,
    isRecurring: true,
    recurringId: 'rt004',
    updates: [
      { at: '13:10', by: 'Nguyễn Đức Thịnh', note: 'Đã bắt đầu phòng 201-205', progress: 40 },
    ],
    tags: ['hàng tháng', 'bảo trì'],
  },
  {
    id: 'ot006',
    title: 'Vá đường ống nước khu C',
    type: 'Phát sinh',
    description: 'Xử lý đường ống nước bị vỡ tại khu C tầng 1 phát sinh sáng nay.',
    area: 'Khu C - Tầng 1',
    assignedTo: 'Hoàng Văn Tài',
    assignedBy: 'Phòng vận hành',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '09:00',
    priority: 'Khẩn cấp',
    status: 'Đang làm',
    progress: 70,
    isRecurring: false,
    updates: [
      { at: '09:05', by: 'Hoàng Văn Tài', note: 'Đã tắt van nước, đang tìm vị trí rò rỉ', progress: 30 },
      { at: '10:30', by: 'Hoàng Văn Tài', note: 'Đã xác định vị trí, đang vá ống', progress: 70 },
    ],
    tags: ['khẩn cấp', 'phát sinh'],
  },
  {
    id: 'ot007',
    title: 'Kiểm kê vật tư vệ sinh tháng 7',
    type: 'Vệ sinh',
    description: 'Kiểm kê tồn kho vật tư vệ sinh và lập phiếu đề xuất mua thêm.',
    area: 'Kho vật tư',
    assignedTo: 'Trần Thị Hoa',
    assignedBy: 'Tổ trưởng vệ sinh',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '14:00',
    endTime: '15:00',
    priority: 'Thấp',
    status: 'Chưa nhận',
    progress: 0,
    isRecurring: true,
    recurringId: 'rt005',
    updates: [],
    tags: ['hàng tháng', 'kho'],
  },
  {
    id: 'ot008',
    title: 'Kiểm tra lối thoát hiểm PCCC',
    type: 'An ninh',
    description: 'Kiểm tra toàn bộ lối thoát hiểm, bảng chỉ dẫn và thiết bị chữa cháy.',
    area: 'Toàn trường',
    assignedTo: 'Bùi Văn Minh',
    assignedBy: 'Tổ trưởng bảo vệ',
    startDate: '2026-07-01',
    dueDate: '2026-07-02',
    priority: 'Cao',
    status: 'Quá hạn',
    progress: 20,
    isRecurring: false,
    updates: [
      { at: '2026-07-01 09:00', by: 'Bùi Văn Minh', note: 'Đã kiểm tra khu A', progress: 20 },
    ],
    tags: ['PCCC', 'quá hạn'],
  },
  {
    id: 'ot009',
    title: 'Phun thuốc muỗi khu bán trú',
    type: 'Bán trú',
    description: 'Phun thuốc muỗi định kỳ tại khu bán trú tầng 3.',
    area: 'Khu bán trú tầng 3',
    assignedTo: 'Vũ Thị Hương',
    assignedBy: 'Phòng vận hành',
    startDate: '2026-07-02',
    dueDate: '2026-07-02',
    startTime: '18:00',
    priority: 'Trung bình',
    status: 'Quá hạn',
    progress: 0,
    isRecurring: true,
    recurringId: 'rt006',
    updates: [],
    tags: ['bán trú', 'quá hạn'],
  },
  {
    id: 'ot010',
    title: 'Sắp xếp hội trường khai giảng',
    type: 'Sự kiện',
    description: 'Sắp xếp bàn ghế, âm thanh ánh sáng cho lễ khai giảng năm học mới.',
    area: 'Hội trường',
    assignedTo: 'Nguyễn Thị Thu',
    coordinator: 'BV. Hùng, NV. Âm thanh',
    assignedBy: 'Ban Giám Hiệu',
    startDate: '2026-07-04',
    dueDate: '2026-07-04',
    startTime: '07:00',
    endTime: '08:30',
    priority: 'Cao',
    status: 'Chưa nhận',
    progress: 0,
    isRecurring: false,
    updates: [],
    tags: ['khai giảng', 'sự kiện'],
  },
  {
    id: 'ot011',
    title: 'Vệ sinh sau giờ học chiều',
    type: 'Vệ sinh',
    description: 'Vệ sinh toàn bộ phòng học, hành lang, nhà vệ sinh sau giờ học chiều.',
    area: 'Toàn trường',
    assignedTo: 'Lê Thị Ngọc',
    assignedBy: 'Tổ trưởng vệ sinh',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '17:00',
    endTime: '18:30',
    priority: 'Trung bình',
    status: 'Đã nhận',
    progress: 0,
    isRecurring: true,
    recurringId: 'rt001',
    updates: [],
    tags: ['buổi chiều', 'định kỳ'],
  },
  {
    id: 'ot012',
    title: 'Sửa bàn học phòng 301',
    type: 'Cơ sở vật chất',
    description: 'Sửa 3 bàn học bị gãy chân tại phòng 301.',
    area: 'Phòng 301 - Tầng 3',
    assignedTo: 'Phạm Văn Long',
    assignedBy: 'Phòng CSVC',
    startDate: '2026-07-03',
    dueDate: '2026-07-03',
    startTime: '11:00',
    priority: 'Trung bình',
    status: 'Hoàn thành',
    progress: 100,
    isRecurring: false,
    updates: [
      { at: '11:15', by: 'Phạm Văn Long', note: 'Đã sửa xong 3 bàn', progress: 100 },
    ],
    tags: ['CSVC', 'sửa chữa'],
  },
];

export const RECURRING_TASKS: RecurringTask[] = [
  {
    id: 'rt001',
    title: 'Kiểm tra & vệ sinh nhà vệ sinh',
    type: 'Vệ sinh',
    description: 'Kiểm tra và vệ sinh toàn bộ nhà vệ sinh 3 lần/ngày (6h, 12h, 17h)',
    area: 'Toàn bộ nhà vệ sinh',
    assignedTo: 'Tổ vệ sinh A',
    priority: 'Cao',
    frequency: 'Hằng ngày',
    startTime: '06:00',
    endTime: '07:00',
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-07-03',
    nextDue: '2026-07-04',
    completedCount: 185,
    missedCount: 3,
  },
  {
    id: 'rt002',
    title: 'Kiểm tra camera an ninh',
    type: 'An ninh',
    description: 'Kiểm tra toàn bộ hệ thống camera, báo cáo camera lỗi',
    area: 'Toàn trường',
    assignedTo: 'BV. Tuấn',
    priority: 'Trung bình',
    frequency: 'Hằng tuần',
    daysOfWeek: [2, 5], // Thứ 3, Thứ 6
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-07-03',
    nextDue: '2026-07-07',
    completedCount: 48,
    missedCount: 1,
  },
  {
    id: 'rt003',
    title: 'Kiểm tra thực phẩm nhà bếp',
    type: 'Nhà ăn',
    description: 'Kiểm tra nguồn gốc, hạn sử dụng thực phẩm nhập kho',
    area: 'Khu bếp ăn',
    assignedTo: 'Phạm Thị Lan',
    priority: 'Cao',
    frequency: 'Hằng ngày',
    startTime: '06:30',
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-07-03',
    nextDue: '2026-07-04',
    completedCount: 182,
    missedCount: 0,
  },
  {
    id: 'rt004',
    title: 'Bảo trì điều hòa toàn trường',
    type: 'Bảo trì',
    description: 'Vệ sinh lưới lọc, kiểm tra gas và bảo trì định kỳ hệ thống điều hòa',
    area: 'Toàn trường',
    assignedTo: 'Nguyễn Đức Thịnh',
    priority: 'Trung bình',
    frequency: 'Hằng tháng',
    dayOfMonth: 3,
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-07-03',
    nextDue: '2026-08-03',
    completedCount: 6,
    missedCount: 0,
  },
  {
    id: 'rt005',
    title: 'Kiểm kê vật tư vệ sinh',
    type: 'Vệ sinh',
    description: 'Kiểm đếm tồn kho và lập phiếu đề xuất mua thêm vật tư vệ sinh',
    area: 'Kho vật tư',
    assignedTo: 'Trần Thị Hoa',
    priority: 'Thấp',
    frequency: 'Hằng tháng',
    dayOfMonth: 1,
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-07-03',
    nextDue: '2026-08-01',
    completedCount: 6,
    missedCount: 1,
  },
  {
    id: 'rt006',
    title: 'Phun thuốc muỗi khu bán trú',
    type: 'Bán trú',
    description: 'Phun thuốc muỗi định kỳ tại khu bán trú',
    area: 'Khu bán trú tầng 3',
    assignedTo: 'Vũ Thị Hương',
    priority: 'Trung bình',
    frequency: 'Hằng tuần',
    daysOfWeek: [3], // Thứ 4
    startTime: '18:00',
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-07-02',
    nextDue: '2026-07-09',
    completedCount: 24,
    missedCount: 2,
  },
  {
    id: 'rt007',
    title: 'Kiểm tra PCCC định kỳ',
    type: 'An ninh',
    description: 'Kiểm tra bình chữa cháy, đầu báo khói, lối thoát hiểm theo quy định PCCC',
    area: 'Toàn trường',
    assignedTo: 'BV. Minh',
    priority: 'Cao',
    frequency: 'Theo khoảng',
    intervalDays: 90,
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-04-01',
    nextDue: '2026-07-01',
    completedCount: 2,
    missedCount: 1,
  },
  {
    id: 'rt008',
    title: 'Vệ sinh xe đưa đón',
    type: 'Xe đưa đón',
    description: 'Vệ sinh nội thất và ngoại thất các xe đưa đón học sinh',
    area: 'Bãi đỗ xe',
    assignedTo: 'Lái xe Văn Đức',
    priority: 'Thấp',
    frequency: 'Hằng tuần',
    daysOfWeek: [6], // Thứ 7
    startTime: '07:00',
    activeFrom: '2026-01-01',
    isActive: true,
    lastGenerated: '2026-06-28',
    nextDue: '2026-07-05',
    completedCount: 25,
    missedCount: 0,
  },
];

export const SHIFT_HANDOVERS: ShiftHandover[] = [
  {
    id: 'sh001',
    shift: 'Sáng',
    handoverBy: 'BV. Nguyễn Văn Hùng',
    handoverTo: 'BV. Phạm Tuấn',
    date: '2026-07-03',
    completedItems: [
      'Kiểm tra camera — OK',
      'Vệ sinh nhà vệ sinh lần 1 — Hoàn thành',
      'Đón đoàn Sở GDĐT — Đang làm việc tầng 2',
    ],
    pendingItems: [
      'Vá đường ống nước khu C — Đang xử lý (70%)',
      'Kiểm tra lối thoát hiểm — Bỏ sót cần làm lại',
    ],
    incidents: 'Phát sinh: vỡ ống nước khu C lúc 08:30, đã kêu thợ đến xử lý.',
    assets: 'Bộ đàm: 2 cái. Chìa khoá cổng phụ: 3 bộ. Sổ nhật ký: 1 cuốn.',
    confirmedBy: 'BV. Phạm Tuấn',
    confirmedAt: '2026-07-03 13:05',
    status: 'Đã xác nhận',
  },
  {
    id: 'sh002',
    shift: 'Chiều',
    handoverBy: 'BV. Phạm Tuấn',
    handoverTo: 'BV. Lê Hoàng',
    date: '2026-07-03',
    completedItems: [
      'Bảo trì điều hòa khu B — 60% hoàn thành',
      'Kiểm tra thực phẩm chiều — OK',
    ],
    pendingItems: [
      'Bảo trì điều hòa khu B — Còn 40% (phòng 206-210)',
      'Vệ sinh tổng thể sau giờ học — Chưa bắt đầu',
    ],
    incidents: 'Không có sự cố phát sinh.',
    assets: 'Bộ đàm: 2 cái. Chìa khoá cổng phụ: 3 bộ.',
    status: 'Chờ xác nhận',
  },
];

export const OPERATION_EVENTS: OperationEvent[] = [
  {
    id: 'ev001',
    title: 'Lễ khai giảng năm học 2026-2027',
    startDatetime: '2026-07-05 07:30',
    endDatetime: '2026-07-05 10:00',
    location: 'Sân trường + Hội trường',
    organizer: 'Ban Giám Hiệu',
    description: 'Lễ khai giảng chính thức năm học mới. Dự kiến 1500 học sinh, phụ huynh và khách mời.',
    preparations: [
      { item: 'Âm thanh & ánh sáng', assignedTo: 'IT. Tuấn', status: 'Đang chuẩn bị' },
      { item: 'Bàn ghế & sân khấu', assignedTo: 'CSVC. Long', status: 'Chưa làm' },
      { item: 'Vệ sinh sân trường', assignedTo: 'Tổ vệ sinh A', status: 'Chưa làm' },
      { item: 'Bảo vệ & trật tự', assignedTo: 'BV. Hùng', status: 'Chưa làm' },
      { item: 'Y tế trực sự kiện', assignedTo: 'Y tế trường', status: 'Đang chuẩn bị' },
      { item: 'Nước uống & hậu cần', assignedTo: 'Nhà ăn Lan', status: 'Chưa làm' },
      { item: 'Trang trí & băng rôn', assignedTo: 'VP. Thu', status: 'Đang chuẩn bị' },
    ],
    preChecklist: [
      { item: 'Kiểm tra micro và loa', checked: false },
      { item: 'Kiểm tra sân khấu an toàn', checked: false },
      { item: 'Bố trí chỗ ngồi khách mời', checked: false },
      { item: 'Test âm thanh', checked: true },
      { item: 'Kiểm tra đèn chiếu sáng', checked: false },
      { item: 'Chuẩn bị nước uống', checked: false },
    ],
    postChecklist: [
      { item: 'Thu dọn bàn ghế', checked: false },
      { item: 'Vệ sinh sân trường', checked: false },
      { item: 'Tắt hệ thống điện âm thanh', checked: false },
      { item: 'Báo cáo sự kiện', checked: false },
    ],
    status: 'Đang chuẩn bị',
  },
  {
    id: 'ev002',
    title: 'Họp phụ huynh đầu năm',
    startDatetime: '2026-07-10 14:00',
    endDatetime: '2026-07-10 17:00',
    location: 'Hội trường & Các phòng học',
    organizer: 'Phòng Giáo vụ',
    description: 'Họp phụ huynh đầu năm học mới. Dự kiến 800 phụ huynh.',
    preparations: [
      { item: 'Âm thanh hội trường', assignedTo: 'IT. Tuấn', status: 'Chưa làm' },
      { item: 'Bàn ghế các phòng học', assignedTo: 'CSVC. Long', status: 'Chưa làm' },
      { item: 'Vệ sinh phòng học', assignedTo: 'Tổ vệ sinh B', status: 'Chưa làm' },
      { item: 'Hướng dẫn & phân luồng', assignedTo: 'BV. Minh', status: 'Chưa làm' },
    ],
    preChecklist: [
      { item: 'Phát danh sách phòng học', checked: false },
      { item: 'Kiểm tra micro các phòng', checked: false },
      { item: 'Chuẩn bị tài liệu phụ huynh', checked: false },
    ],
    postChecklist: [
      { item: 'Thu dọn bàn ghế', checked: false },
      { item: 'Vệ sinh sau họp', checked: false },
    ],
    status: 'Lên kế hoạch',
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  'Vệ sinh': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'An ninh': 'bg-blue-100 text-blue-700 border-blue-200',
  'Xe đưa đón': 'bg-amber-100 text-amber-700 border-amber-200',
  'Nhà ăn': 'bg-orange-100 text-orange-700 border-orange-200',
  'Y tế': 'bg-rose-100 text-rose-700 border-rose-200',
  'Cơ sở vật chất': 'bg-slate-100 text-slate-700 border-slate-200',
  'Bán trú': 'bg-purple-100 text-purple-700 border-purple-200',
  'Sự kiện': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Bảo trì': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Phát sinh': 'bg-red-100 text-red-700 border-red-200',
};

export const TASK_TYPE_DOT: Record<TaskType, string> = {
  'Vệ sinh': 'bg-emerald-500',
  'An ninh': 'bg-blue-500',
  'Xe đưa đón': 'bg-amber-500',
  'Nhà ăn': 'bg-orange-500',
  'Y tế': 'bg-rose-500',
  'Cơ sở vật chất': 'bg-slate-500',
  'Bán trú': 'bg-purple-500',
  'Sự kiện': 'bg-indigo-500',
  'Bảo trì': 'bg-cyan-500',
  'Phát sinh': 'bg-red-500',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Khẩn cấp': 'bg-red-100 text-red-700 border-red-300',
  'Cao': 'bg-orange-100 text-orange-700 border-orange-200',
  'Trung bình': 'bg-amber-100 text-amber-700 border-amber-200',
  'Thấp': 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'Chưa nhận': 'bg-slate-100 text-slate-600',
  'Đã nhận': 'bg-blue-100 text-blue-700',
  'Đang làm': 'bg-amber-100 text-amber-700',
  'Hoàn thành': 'bg-emerald-100 text-emerald-700',
  'Quá hạn': 'bg-red-100 text-red-700',
  'Cần làm lại': 'bg-orange-100 text-orange-700',
  'Đã hủy': 'bg-slate-200 text-slate-500',
};

export const ALL_TASK_TYPES: TaskType[] = [
  'Vệ sinh', 'An ninh', 'Xe đưa đón', 'Nhà ăn', 'Y tế',
  'Cơ sở vật chất', 'Bán trú', 'Sự kiện', 'Bảo trì', 'Phát sinh',
];

export const ALL_STATUSES: TaskStatus[] = [
  'Chưa nhận', 'Đã nhận', 'Đang làm', 'Hoàn thành', 'Quá hạn', 'Cần làm lại', 'Đã hủy',
];

export const ALL_PRIORITIES: Priority[] = ['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'];

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  'Hằng ngày': 'Mỗi ngày',
  'Hằng tuần': 'Mỗi tuần',
  'Hằng tháng': 'Mỗi tháng',
  'Theo thứ': 'Theo thứ trong tuần',
  'Theo ngày cụ thể': 'Ngày cụ thể',
  'Theo khoảng': 'Theo khoảng thời gian',
};

export const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
