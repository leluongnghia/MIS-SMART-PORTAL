// ============================================================
// MOCK DATA - MODULE NHÂN SỰ DỊCH VỤ
// ============================================================

export type Department =
  | 'Bảo vệ'
  | 'Vệ sinh'
  | 'Bếp ăn'
  | 'Y tế'
  | 'Xe đưa đón'
  | 'Kỹ thuật'
  | 'Bán trú'
  | 'Hành chính'
  | 'Khác';

export type StaffType = 'Chính thức' | 'Thời vụ' | 'Thuê ngoài' | 'Nhà thầu';
export type StaffStatus = 'Đang làm' | 'Nghỉ phép' | 'Nghỉ việc' | 'Tạm dừng';
export type ShiftStatus = 'Chưa bắt đầu' | 'Đang trực' | 'Hoàn thành' | 'Vắng mặt' | 'Đi muộn';
export type AttendanceType = 'Bình thường' | 'Đi muộn' | 'Về sớm' | 'Vắng có phép' | 'Vắng không phép' | 'Tăng ca';
export type PerformanceRating = 'Xuất sắc' | 'Tốt' | 'Đạt' | 'Cần cải thiện' | 'Không đạt';
export type RecordType = 'Khen thưởng' | 'Nhắc nhở' | 'Vi phạm' | 'Kỷ luật';

// ─── Interfaces ───────────────────────────────────────────────

export interface StaffProfile {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  phone: string;
  email?: string;
  dob: string;
  address: string;
  department: Department;
  title: string;
  type: StaffType;
  startDate: string;
  status: StaffStatus;
  manager: string;
  notes?: string;
  performanceRating?: PerformanceRating;
  performanceScore?: number; // 0-100
  trainingCompleted: string[]; // training IDs
}

export interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  shiftName: string;
  shiftType: 'Sáng' | 'Chiều' | 'Tối' | 'Đêm' | 'Sự kiện' | 'Tăng cường';
  startTime: string;
  endTime: string;
  area: string;
  date: string;
  status: ShiftStatus;
  substitute?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  date: string;
  checkIn?: string;
  checkOut?: string;
  type: AttendanceType;
  overtime?: number; // hours
  notes?: string;
  approvedBy?: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  staffId: string;
  department: Department;
  area: string;
  dueDate: string;
  priority: 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
  status: 'Chưa nhận' | 'Đang làm' | 'Hoàn thành' | 'Quá hạn';
  module?: string;
  notes?: string;
}

export interface PerformanceReview {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  period: string; // e.g. "T7/2026"
  punctuality: number; // 1-5
  taskCompletion: number;
  workQuality: number;
  attitude: number;
  compliance: number;
  feedback: number;
  violations: number;
  commendations: number;
  overall: PerformanceRating;
  overallScore: number;
  reviewedBy: string;
  reviewDate: string;
  notes?: string;
}

export interface TrainingRecord {
  id: string;
  title: string;
  participants: string[];
  participantIds: string[];
  date: string;
  result: 'Đạt' | 'Không đạt' | 'Chờ kết quả';
  certificate?: string;
  expiryDate?: string;
  instructor: string;
  notes?: string;
}

export interface DisciplinaryRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  type: RecordType;
  date: string;
  content: string;
  severity: 'Nhẹ' | 'Trung bình' | 'Nặng';
  recordedBy: string;
  action: string;
  notes?: string;
}

export interface Contractor {
  id: string;
  name: string;
  serviceType: Department;
  representative: string;
  phone: string;
  contractStart: string;
  contractEnd: string;
  staffList: string[];
  qualityScore: number; // 1-10
  incidents: number;
  status: 'Còn hiệu lực' | 'Hết hạn' | 'Tạm dừng';
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

export const STAFF_KPI = {
  total: 32,
  onDutyToday: 26,
  onLeave: 3,
  shiftsToday: 12,
  vacantPositions: 2,
  pendingTasks: 8,
  incompleteTraining: 5,
  avgPerformance: 82,
};

export const STAFF_PROFILES: StaffProfile[] = [
  {
    id: 's001',
    code: 'BV001',
    name: 'Nguyễn Văn Hùng',
    phone: '0901234567',
    email: 'hung.bv@school.edu.vn',
    dob: '1985-03-12',
    address: 'Q. Bình Thạnh, TP.HCM',
    department: 'Bảo vệ',
    title: 'Tổ trưởng bảo vệ',
    type: 'Chính thức',
    startDate: '2018-09-01',
    status: 'Đang làm',
    manager: 'Trưởng phòng vận hành',
    performanceRating: 'Xuất sắc',
    performanceScore: 95,
    trainingCompleted: ['tr001', 'tr002', 'tr003', 'tr004'],
    notes: 'Kinh nghiệm 8 năm bảo vệ trường học',
  },
  {
    id: 's002',
    code: 'BV002',
    name: 'Trần Minh Tuấn',
    phone: '0912345678',
    dob: '1990-07-22',
    address: 'Q. Gò Vấp, TP.HCM',
    department: 'Bảo vệ',
    title: 'Bảo vệ',
    type: 'Chính thức',
    startDate: '2020-01-15',
    status: 'Đang làm',
    manager: 'Nguyễn Văn Hùng',
    performanceRating: 'Tốt',
    performanceScore: 82,
    trainingCompleted: ['tr001', 'tr002'],
  },
  {
    id: 's003',
    code: 'BV003',
    name: 'Bùi Văn Minh',
    phone: '0923456789',
    dob: '1988-11-05',
    address: 'Q. Tân Bình, TP.HCM',
    department: 'Bảo vệ',
    title: 'Bảo vệ',
    type: 'Chính thức',
    startDate: '2019-06-01',
    status: 'Nghỉ phép',
    manager: 'Nguyễn Văn Hùng',
    performanceRating: 'Đạt',
    performanceScore: 70,
    trainingCompleted: ['tr001'],
  },
  {
    id: 's004',
    code: 'VS001',
    name: 'Nguyễn Văn Hùng (VS)',
    phone: '0934567890',
    dob: '1982-05-18',
    address: 'Q. 12, TP.HCM',
    department: 'Vệ sinh',
    title: 'Tổ trưởng vệ sinh',
    type: 'Chính thức',
    startDate: '2015-09-01',
    status: 'Đang làm',
    manager: 'Trưởng phòng vận hành',
    performanceRating: 'Tốt',
    performanceScore: 85,
    trainingCompleted: ['tr001', 'tr005', 'tr006'],
  },
  {
    id: 's005',
    code: 'VS002',
    name: 'Trần Thị Hoa',
    phone: '0945678901',
    dob: '1992-09-30',
    address: 'Q. Bình Chánh, TP.HCM',
    department: 'Vệ sinh',
    title: 'Nhân viên vệ sinh',
    type: 'Chính thức',
    startDate: '2021-03-01',
    status: 'Đang làm',
    manager: 'Nguyễn Văn Hùng (VS)',
    performanceRating: 'Đạt',
    performanceScore: 72,
    trainingCompleted: ['tr001'],
  },
  {
    id: 's006',
    code: 'VS003',
    name: 'Lê Thị Ngọc',
    phone: '0956789012',
    dob: '1995-02-14',
    address: 'Q. Thủ Đức, TP.HCM',
    department: 'Vệ sinh',
    title: 'Nhân viên vệ sinh',
    type: 'Thời vụ',
    startDate: '2026-01-15',
    status: 'Đang làm',
    manager: 'Nguyễn Văn Hùng (VS)',
    performanceRating: 'Đạt',
    performanceScore: 68,
    trainingCompleted: [],
    notes: 'Hợp đồng thời vụ 6 tháng',
  },
  {
    id: 's007',
    code: 'BA001',
    name: 'Phạm Thị Lan',
    phone: '0967890123',
    email: 'lan.ba@school.edu.vn',
    dob: '1978-12-25',
    address: 'Q. Phú Nhuận, TP.HCM',
    department: 'Bếp ăn',
    title: 'Trưởng bếp',
    type: 'Chính thức',
    startDate: '2012-09-01',
    status: 'Đang làm',
    manager: 'Trưởng phòng vận hành',
    performanceRating: 'Xuất sắc',
    performanceScore: 92,
    trainingCompleted: ['tr001', 'tr006', 'tr007'],
  },
  {
    id: 's008',
    code: 'YT001',
    name: 'Nguyễn Thị Mai',
    phone: '0978901234',
    email: 'mai.yt@school.edu.vn',
    dob: '1987-08-10',
    address: 'Q. 3, TP.HCM',
    department: 'Y tế',
    title: 'Y tá trường',
    type: 'Chính thức',
    startDate: '2016-09-01',
    status: 'Đang làm',
    manager: 'Hiệu phó',
    performanceRating: 'Tốt',
    performanceScore: 88,
    trainingCompleted: ['tr001', 'tr002', 'tr003', 'tr004', 'tr008'],
  },
  {
    id: 's009',
    code: 'XE001',
    name: 'Lê Văn Bình',
    phone: '0989012345',
    dob: '1980-04-07',
    address: 'Q. Bình Dương',
    department: 'Xe đưa đón',
    title: 'Lái xe',
    type: 'Chính thức',
    startDate: '2017-09-01',
    status: 'Đang làm',
    manager: 'Trưởng phòng vận hành',
    performanceRating: 'Tốt',
    performanceScore: 80,
    trainingCompleted: ['tr001', 'tr003', 'tr004'],
  },
  {
    id: 's010',
    code: 'KT001',
    name: 'Nguyễn Đức Thịnh',
    phone: '0990123456',
    dob: '1986-06-20',
    address: 'Q. Bình Thạnh, TP.HCM',
    department: 'Kỹ thuật',
    title: 'Kỹ thuật viên',
    type: 'Chính thức',
    startDate: '2019-01-01',
    status: 'Đang làm',
    manager: 'Trưởng phòng CSVC',
    performanceRating: 'Tốt',
    performanceScore: 83,
    trainingCompleted: ['tr001', 'tr002'],
  },
  {
    id: 's011',
    code: 'BT001',
    name: 'Vũ Thị Hương',
    phone: '0901111222',
    dob: '1993-01-28',
    address: 'Q. 9, TP.HCM',
    department: 'Bán trú',
    title: 'Nhân viên bán trú',
    type: 'Chính thức',
    startDate: '2020-09-01',
    status: 'Đang làm',
    manager: 'Trưởng phòng vận hành',
    performanceRating: 'Đạt',
    performanceScore: 75,
    trainingCompleted: ['tr001', 'tr003'],
  },
  {
    id: 's012',
    code: 'BV004',
    name: 'Hoàng Văn Tài',
    phone: '0902222333',
    dob: '1991-09-15',
    address: 'Q. Tân Phú, TP.HCM',
    department: 'Bảo vệ',
    title: 'Bảo vệ',
    type: 'Thuê ngoài',
    startDate: '2024-01-01',
    status: 'Đang làm',
    manager: 'Nguyễn Văn Hùng',
    performanceRating: 'Cần cải thiện',
    performanceScore: 55,
    trainingCompleted: ['tr001'],
    notes: 'Nhân sự từ Cty bảo vệ Sao Việt',
  },
];

export const SHIFT_ASSIGNMENTS: ShiftAssignment[] = [
  {
    id: 'sh001',
    staffId: 's001',
    staffName: 'Nguyễn Văn Hùng',
    department: 'Bảo vệ',
    shiftName: 'Ca sáng cổng chính',
    shiftType: 'Sáng',
    startTime: '06:00',
    endTime: '14:00',
    area: 'Cổng chính',
    date: '2026-07-03',
    status: 'Đang trực',
  },
  {
    id: 'sh002',
    staffId: 's002',
    staffName: 'Trần Minh Tuấn',
    department: 'Bảo vệ',
    shiftName: 'Ca sáng cổng phụ',
    shiftType: 'Sáng',
    startTime: '06:00',
    endTime: '14:00',
    area: 'Cổng phụ',
    date: '2026-07-03',
    status: 'Đang trực',
  },
  {
    id: 'sh003',
    staffId: 's003',
    staffName: 'Bùi Văn Minh',
    department: 'Bảo vệ',
    shiftName: 'Ca chiều cổng chính',
    shiftType: 'Chiều',
    startTime: '14:00',
    endTime: '22:00',
    area: 'Cổng chính',
    date: '2026-07-03',
    status: 'Vắng mặt',
    substitute: 'Hoàng Văn Tài',
  },
  {
    id: 'sh004',
    staffId: 's004',
    staffName: 'Nguyễn Văn Hùng (VS)',
    department: 'Vệ sinh',
    shiftName: 'Ca sáng vệ sinh',
    shiftType: 'Sáng',
    startTime: '06:00',
    endTime: '11:30',
    area: 'Toàn trường',
    date: '2026-07-03',
    status: 'Đang trực',
  },
  {
    id: 'sh005',
    staffId: 's005',
    staffName: 'Trần Thị Hoa',
    department: 'Vệ sinh',
    shiftName: 'Ca sáng vệ sinh khu A',
    shiftType: 'Sáng',
    startTime: '07:00',
    endTime: '11:30',
    area: 'Khu A',
    date: '2026-07-03',
    status: 'Đang trực',
  },
  {
    id: 'sh006',
    staffId: 's007',
    staffName: 'Phạm Thị Lan',
    department: 'Bếp ăn',
    shiftName: 'Ca bếp sáng',
    shiftType: 'Sáng',
    startTime: '05:30',
    endTime: '13:00',
    area: 'Khu bếp ăn',
    date: '2026-07-03',
    status: 'Hoàn thành',
  },
  {
    id: 'sh007',
    staffId: 's009',
    staffName: 'Lê Văn Bình',
    department: 'Xe đưa đón',
    shiftName: 'Ca đón buổi sáng',
    shiftType: 'Sáng',
    startTime: '06:00',
    endTime: '08:30',
    area: 'Tuyến xe 1',
    date: '2026-07-03',
    status: 'Hoàn thành',
  },
  {
    id: 'sh008',
    staffId: 's009',
    staffName: 'Lê Văn Bình',
    department: 'Xe đưa đón',
    shiftName: 'Ca trả buổi chiều',
    shiftType: 'Chiều',
    startTime: '16:30',
    endTime: '18:30',
    area: 'Tuyến xe 1',
    date: '2026-07-03',
    status: 'Chưa bắt đầu',
  },
  {
    id: 'sh009',
    staffId: 's008',
    staffName: 'Nguyễn Thị Mai',
    department: 'Y tế',
    shiftName: 'Ca trực y tế',
    shiftType: 'Sáng',
    startTime: '07:00',
    endTime: '17:00',
    area: 'Phòng y tế',
    date: '2026-07-03',
    status: 'Đang trực',
  },
  {
    id: 'sh010',
    staffId: 's012',
    staffName: 'Hoàng Văn Tài',
    department: 'Bảo vệ',
    shiftName: 'Ca chiều cổng chính (thay thế)',
    shiftType: 'Chiều',
    startTime: '14:00',
    endTime: '22:00',
    area: 'Cổng chính',
    date: '2026-07-03',
    status: 'Chưa bắt đầu',
  },
];

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 'at001', staffId: 's001', staffName: 'Nguyễn Văn Hùng', department: 'Bảo vệ', date: '2026-07-03', checkIn: '05:55', checkOut: undefined, type: 'Bình thường', approvedBy: 'Trưởng phòng' },
  { id: 'at002', staffId: 's002', staffName: 'Trần Minh Tuấn', department: 'Bảo vệ', date: '2026-07-03', checkIn: '06:12', type: 'Đi muộn', notes: 'Kẹt xe', approvedBy: 'Nguyễn Văn Hùng' },
  { id: 'at003', staffId: 's003', staffName: 'Bùi Văn Minh', department: 'Bảo vệ', date: '2026-07-03', type: 'Vắng có phép', notes: 'Nghỉ phép gia đình' },
  { id: 'at004', staffId: 's004', staffName: 'Nguyễn Văn Hùng (VS)', department: 'Vệ sinh', date: '2026-07-03', checkIn: '05:58', type: 'Bình thường' },
  { id: 'at005', staffId: 's005', staffName: 'Trần Thị Hoa', department: 'Vệ sinh', date: '2026-07-03', checkIn: '07:05', type: 'Bình thường' },
  { id: 'at006', staffId: 's007', staffName: 'Phạm Thị Lan', department: 'Bếp ăn', date: '2026-07-03', checkIn: '05:25', checkOut: '13:15', type: 'Tăng ca', overtime: 0.5 },
  { id: 'at007', staffId: 's009', staffName: 'Lê Văn Bình', department: 'Xe đưa đón', date: '2026-07-03', checkIn: '05:50', type: 'Bình thường' },
  { id: 'at008', staffId: 's008', staffName: 'Nguyễn Thị Mai', department: 'Y tế', date: '2026-07-03', checkIn: '06:55', type: 'Bình thường' },
  { id: 'at009', staffId: 's006', staffName: 'Lê Thị Ngọc', department: 'Vệ sinh', date: '2026-07-03', checkIn: '07:35', type: 'Đi muộn', notes: 'Không có lý do' },
  { id: 'at010', staffId: 's010', staffName: 'Nguyễn Đức Thịnh', department: 'Kỹ thuật', date: '2026-07-03', checkIn: '07:28', type: 'Bình thường' },
  // Previous days
  { id: 'at011', staffId: 's001', staffName: 'Nguyễn Văn Hùng', department: 'Bảo vệ', date: '2026-07-02', checkIn: '05:58', checkOut: '14:05', type: 'Bình thường' },
  { id: 'at012', staffId: 's012', staffName: 'Hoàng Văn Tài', department: 'Bảo vệ', date: '2026-07-02', type: 'Vắng không phép', notes: 'Không liên lạc được' },
];

export const STAFF_TASKS: StaffTask[] = [
  {
    id: 'st001',
    title: 'Kiểm tra cổng phụ và camera',
    description: 'Kiểm tra tất cả camera và khóa cổng phụ trước 06:00',
    assignedTo: 'Trần Minh Tuấn',
    staffId: 's002',
    department: 'Bảo vệ',
    area: 'Cổng phụ',
    dueDate: '2026-07-03',
    priority: 'Cao',
    status: 'Đang làm',
    module: 'An ninh',
  },
  {
    id: 'st002',
    title: 'Vệ sinh nhà vệ sinh học sinh',
    description: 'Vệ sinh và bổ sung vật tư nhà vệ sinh học sinh khu A-B',
    assignedTo: 'Trần Thị Hoa',
    staffId: 's005',
    department: 'Vệ sinh',
    area: 'Khu A-B',
    dueDate: '2026-07-03',
    priority: 'Cao',
    status: 'Đang làm',
    module: 'Vệ sinh',
  },
  {
    id: 'st003',
    title: 'Nấu bữa trưa cho 500 học sinh',
    description: 'Chuẩn bị và nấu bữa trưa theo thực đơn đã duyệt',
    assignedTo: 'Phạm Thị Lan',
    staffId: 's007',
    department: 'Bếp ăn',
    area: 'Khu bếp ăn',
    dueDate: '2026-07-03',
    priority: 'Cao',
    status: 'Đang làm',
    module: 'Nhà ăn',
  },
  {
    id: 'st004',
    title: 'Trực y tế đón trả học sinh',
    description: 'Có mặt tại cổng trường giờ đón trả để xử lý trường hợp khẩn cấp',
    assignedTo: 'Nguyễn Thị Mai',
    staffId: 's008',
    department: 'Y tế',
    area: 'Cổng trường',
    dueDate: '2026-07-03',
    priority: 'Cao',
    status: 'Hoàn thành',
    module: 'An ninh',
  },
  {
    id: 'st005',
    title: 'Bảo trì máy lạnh khu B',
    description: 'Vệ sinh lưới lọc và kiểm tra gas máy lạnh 5 phòng khu B tầng 2',
    assignedTo: 'Nguyễn Đức Thịnh',
    staffId: 's010',
    department: 'Kỹ thuật',
    area: 'Khu B - Tầng 2',
    dueDate: '2026-07-03',
    priority: 'Trung bình',
    status: 'Đang làm',
    module: 'Cơ sở vật chất',
  },
  {
    id: 'st006',
    title: 'Báo cáo ca trực tuần',
    description: 'Tổng hợp và nộp báo cáo ca trực tuần cho phòng vận hành',
    assignedTo: 'Nguyễn Văn Hùng',
    staffId: 's001',
    department: 'Bảo vệ',
    area: 'Phòng bảo vệ',
    dueDate: '2026-07-04',
    priority: 'Trung bình',
    status: 'Chưa nhận',
    module: 'An ninh',
  },
  {
    id: 'st007',
    title: 'Kiểm tra lịch phun thuốc bán trú',
    description: 'Đặt lịch và giám sát phun thuốc muỗi định kỳ khu bán trú',
    assignedTo: 'Vũ Thị Hương',
    staffId: 's011',
    department: 'Bán trú',
    area: 'Khu bán trú tầng 3',
    dueDate: '2026-07-02',
    priority: 'Trung bình',
    status: 'Quá hạn',
    notes: 'Đã qua hạn 1 ngày',
  },
];

export const PERFORMANCE_REVIEWS: PerformanceReview[] = [
  {
    id: 'pr001',
    staffId: 's001',
    staffName: 'Nguyễn Văn Hùng',
    department: 'Bảo vệ',
    period: 'T6/2026',
    punctuality: 5,
    taskCompletion: 5,
    workQuality: 5,
    attitude: 5,
    compliance: 4,
    feedback: 5,
    violations: 0,
    commendations: 2,
    overall: 'Xuất sắc',
    overallScore: 95,
    reviewedBy: 'Trưởng phòng vận hành',
    reviewDate: '2026-06-30',
    notes: 'Nhân sự gương mẫu, có tinh thần trách nhiệm cao',
  },
  {
    id: 'pr002',
    staffId: 's007',
    staffName: 'Phạm Thị Lan',
    department: 'Bếp ăn',
    period: 'T6/2026',
    punctuality: 5,
    taskCompletion: 5,
    workQuality: 5,
    attitude: 4,
    compliance: 5,
    feedback: 4,
    violations: 0,
    commendations: 1,
    overall: 'Xuất sắc',
    overallScore: 92,
    reviewedBy: 'Trưởng phòng vận hành',
    reviewDate: '2026-06-30',
  },
  {
    id: 'pr003',
    staffId: 's012',
    staffName: 'Hoàng Văn Tài',
    department: 'Bảo vệ',
    period: 'T6/2026',
    punctuality: 2,
    taskCompletion: 3,
    workQuality: 3,
    attitude: 3,
    compliance: 2,
    feedback: 2,
    violations: 2,
    commendations: 0,
    overall: 'Cần cải thiện',
    overallScore: 55,
    reviewedBy: 'Nguyễn Văn Hùng',
    reviewDate: '2026-06-30',
    notes: 'Vắng không phép 2 lần. Cần cải thiện kỷ luật',
  },
];

export const TRAINING_RECORDS: TrainingRecord[] = [
  {
    id: 'tr001',
    title: 'Nội quy trường học',
    participants: ['Nguyễn Văn Hùng', 'Trần Minh Tuấn', 'Bùi Văn Minh', 'Phạm Thị Lan', 'Lê Văn Bình'],
    participantIds: ['s001', 's002', 's003', 's007', 's009'],
    date: '2026-01-15',
    result: 'Đạt',
    instructor: 'Hiệu phó',
    certificate: 'cert_nqtruong_2026.pdf',
  },
  {
    id: 'tr002',
    title: 'Sơ cứu & Xử lý sự cố y tế',
    participants: ['Nguyễn Văn Hùng', 'Trần Minh Tuấn', 'Nguyễn Thị Mai', 'Nguyễn Đức Thịnh'],
    participantIds: ['s001', 's002', 's008', 's010'],
    date: '2026-02-20',
    result: 'Đạt',
    instructor: 'Bác sĩ Đặng Văn An',
    expiryDate: '2027-02-20',
    certificate: 'cert_socuu_2026.pdf',
  },
  {
    id: 'tr003',
    title: 'Quy trình đón trả học sinh',
    participants: ['Nguyễn Văn Hùng', 'Bùi Văn Minh', 'Lê Văn Bình', 'Vũ Thị Hương', 'Nguyễn Thị Mai'],
    participantIds: ['s001', 's003', 's009', 's011', 's008'],
    date: '2026-03-10',
    result: 'Đạt',
    instructor: 'Trưởng phòng vận hành',
  },
  {
    id: 'tr004',
    title: 'PCCC & Thoát hiểm',
    participants: ['Nguyễn Văn Hùng', 'Lê Văn Bình', 'Nguyễn Thị Mai'],
    participantIds: ['s001', 's009', 's008'],
    date: '2026-04-05',
    result: 'Đạt',
    instructor: 'Cảnh sát PCCC Q. Bình Thạnh',
    expiryDate: '2027-04-05',
    certificate: 'cert_pccc_2026.pdf',
  },
  {
    id: 'tr005',
    title: 'An toàn vệ sinh lao động',
    participants: ['Nguyễn Văn Hùng (VS)', 'Trần Thị Hoa'],
    participantIds: ['s004', 's005'],
    date: '2026-03-20',
    result: 'Đạt',
    instructor: 'Công ty Sạch Xanh',
  },
  {
    id: 'tr006',
    title: 'Vệ sinh an toàn thực phẩm',
    participants: ['Phạm Thị Lan', 'Nguyễn Văn Hùng (VS)'],
    participantIds: ['s007', 's004'],
    date: '2026-05-15',
    result: 'Đạt',
    instructor: 'Sở Y tế TP.HCM',
    expiryDate: '2027-05-15',
    certificate: 'cert_vsattp_2026.pdf',
  },
  {
    id: 'tr007',
    title: 'Quy trình xử lý sự cố bếp ăn',
    participants: ['Phạm Thị Lan'],
    participantIds: ['s007'],
    date: '2026-06-01',
    result: 'Đạt',
    instructor: 'Công ty Bếp An Toàn',
  },
  {
    id: 'tr008',
    title: 'An toàn học sinh & Xử lý khẩn cấp',
    participants: ['Nguyễn Thị Mai'],
    participantIds: ['s008'],
    date: '2026-06-10',
    result: 'Đạt',
    instructor: 'Bệnh viện Nhi Đồng',
    expiryDate: '2027-06-10',
  },
];

export const DISCIPLINARY_RECORDS: DisciplinaryRecord[] = [
  {
    id: 'dr001',
    staffId: 's012',
    staffName: 'Hoàng Văn Tài',
    department: 'Bảo vệ',
    type: 'Vi phạm',
    date: '2026-06-15',
    content: 'Vắng mặt không báo cáo, không có người thay thế ca chiều, gây thiếu nhân sự trực',
    severity: 'Trung bình',
    recordedBy: 'Nguyễn Văn Hùng',
    action: 'Nhắc nhở bằng văn bản, trừ 0.5 ngày công',
  },
  {
    id: 'dr002',
    staffId: 's012',
    staffName: 'Hoàng Văn Tài',
    department: 'Bảo vệ',
    type: 'Vi phạm',
    date: '2026-07-02',
    content: 'Vắng mặt không phép lần 2, không liên lạc được',
    severity: 'Nặng',
    recordedBy: 'Nguyễn Văn Hùng',
    action: 'Cảnh cáo, xem xét chấm dứt hợp đồng nếu tái phạm',
  },
  {
    id: 'dr003',
    staffId: 's001',
    staffName: 'Nguyễn Văn Hùng',
    department: 'Bảo vệ',
    type: 'Khen thưởng',
    date: '2026-06-30',
    content: 'Xuất sắc trong việc xử lý sự cố xâm nhập trái phép, ngăn chặn kịp thời',
    severity: 'Nhẹ',
    recordedBy: 'Hiệu trưởng',
    action: 'Khen thưởng tiền mặt 500.000đ, ghi nhận vào hồ sơ',
  },
  {
    id: 'dr004',
    staffId: 's009',
    staffName: 'Lê Văn Bình',
    department: 'Xe đưa đón',
    type: 'Nhắc nhở',
    date: '2026-06-20',
    content: 'Để học sinh lên xe không đúng danh sách, không kiểm tra thẻ học sinh',
    severity: 'Nhẹ',
    recordedBy: 'Trưởng phòng vận hành',
    action: 'Nhắc nhở miệng, yêu cầu đọc lại quy trình đón trả',
  },
  {
    id: 'dr005',
    staffId: 's007',
    staffName: 'Phạm Thị Lan',
    department: 'Bếp ăn',
    type: 'Khen thưởng',
    date: '2026-06-30',
    content: 'Phụ huynh và BGH ghi nhận bữa ăn ngon, đảm bảo dinh dưỡng, phục vụ tận tâm',
    severity: 'Nhẹ',
    recordedBy: 'Hiệu trưởng',
    action: 'Khen thưởng, ghi nhận hồ sơ',
  },
];

export const CONTRACTORS: Contractor[] = [
  {
    id: 'ct001',
    name: 'Cty Bảo vệ Sao Việt',
    serviceType: 'Bảo vệ',
    representative: 'Nguyễn Văn Nam',
    phone: '028.1234.5678',
    contractStart: '2024-01-01',
    contractEnd: '2026-12-31',
    staffList: ['Hoàng Văn Tài', 'Phạm Tú Dũng'],
    qualityScore: 6.5,
    incidents: 3,
    status: 'Còn hiệu lực',
  },
  {
    id: 'ct002',
    name: 'Cty Vệ sinh Sạch Xanh',
    serviceType: 'Vệ sinh',
    representative: 'Trần Thị Bình',
    phone: '028.2345.6789',
    contractStart: '2025-01-01',
    contractEnd: '2027-12-31',
    staffList: ['Lê Thị Ngọc', 'Đinh Văn Hải'],
    qualityScore: 8.2,
    incidents: 0,
    status: 'Còn hiệu lực',
  },
  {
    id: 'ct003',
    name: 'Cty Xe du lịch Minh Thành',
    serviceType: 'Xe đưa đón',
    representative: 'Lê Văn Thành',
    phone: '028.3456.7890',
    contractStart: '2023-09-01',
    contractEnd: '2025-08-31',
    staffList: [],
    qualityScore: 7.8,
    incidents: 1,
    status: 'Hết hạn',
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export const DEPARTMENT_COLORS: Record<Department, string> = {
  'Bảo vệ': 'bg-blue-100 text-blue-700 border-blue-200',
  'Vệ sinh': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Bếp ăn': 'bg-orange-100 text-orange-700 border-orange-200',
  'Y tế': 'bg-rose-100 text-rose-700 border-rose-200',
  'Xe đưa đón': 'bg-amber-100 text-amber-700 border-amber-200',
  'Kỹ thuật': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Bán trú': 'bg-purple-100 text-purple-700 border-purple-200',
  'Hành chính': 'bg-slate-100 text-slate-700 border-slate-200',
  'Khác': 'bg-slate-100 text-slate-600 border-slate-200',
};

export const DEPARTMENT_DOT: Record<Department, string> = {
  'Bảo vệ': 'bg-blue-500',
  'Vệ sinh': 'bg-emerald-500',
  'Bếp ăn': 'bg-orange-500',
  'Y tế': 'bg-rose-500',
  'Xe đưa đón': 'bg-amber-500',
  'Kỹ thuật': 'bg-cyan-500',
  'Bán trú': 'bg-purple-500',
  'Hành chính': 'bg-slate-500',
  'Khác': 'bg-slate-400',
};

export const STATUS_COLORS: Record<StaffStatus, string> = {
  'Đang làm': 'bg-emerald-100 text-emerald-700',
  'Nghỉ phép': 'bg-amber-100 text-amber-700',
  'Nghỉ việc': 'bg-slate-200 text-slate-500',
  'Tạm dừng': 'bg-red-100 text-red-700',
};

export const SHIFT_STATUS_COLORS: Record<ShiftStatus, string> = {
  'Chưa bắt đầu': 'bg-slate-100 text-slate-600',
  'Đang trực': 'bg-emerald-100 text-emerald-700',
  'Hoàn thành': 'bg-blue-100 text-blue-700',
  'Vắng mặt': 'bg-red-100 text-red-700',
  'Đi muộn': 'bg-amber-100 text-amber-700',
};

export const PERFORMANCE_COLORS: Record<PerformanceRating, string> = {
  'Xuất sắc': 'bg-emerald-100 text-emerald-700',
  'Tốt': 'bg-blue-100 text-blue-700',
  'Đạt': 'bg-amber-100 text-amber-700',
  'Cần cải thiện': 'bg-orange-100 text-orange-700',
  'Không đạt': 'bg-red-100 text-red-700',
};

export const ATTENDANCE_COLORS: Record<AttendanceType, string> = {
  'Bình thường': 'bg-emerald-100 text-emerald-700',
  'Đi muộn': 'bg-amber-100 text-amber-700',
  'Về sớm': 'bg-orange-100 text-orange-700',
  'Vắng có phép': 'bg-blue-100 text-blue-700',
  'Vắng không phép': 'bg-red-100 text-red-700',
  'Tăng ca': 'bg-purple-100 text-purple-700',
};

export const RECORD_TYPE_COLORS: Record<RecordType, string> = {
  'Khen thưởng': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Nhắc nhở': 'bg-amber-100 text-amber-700 border-amber-200',
  'Vi phạm': 'bg-red-100 text-red-700 border-red-200',
  'Kỷ luật': 'bg-rose-100 text-rose-700 border-rose-200',
};

export const ALL_DEPARTMENTS: Department[] = ['Bảo vệ', 'Vệ sinh', 'Bếp ăn', 'Y tế', 'Xe đưa đón', 'Kỹ thuật', 'Bán trú', 'Hành chính', 'Khác'];
export const ALL_STAFF_TYPES: StaffType[] = ['Chính thức', 'Thời vụ', 'Thuê ngoài', 'Nhà thầu'];
export const ALL_STAFF_STATUSES: StaffStatus[] = ['Đang làm', 'Nghỉ phép', 'Nghỉ việc', 'Tạm dừng'];
export const ALL_SHIFT_TYPES = ['Sáng', 'Chiều', 'Tối', 'Đêm', 'Sự kiện', 'Tăng cường'] as const;
export const MANDATORY_TRAININGS = ['tr001', 'tr002', 'tr003', 'tr004'];
