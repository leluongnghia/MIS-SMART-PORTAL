// ============================================================
// MOCK DATA — MODULE LỊCH HỌP & ĐẶT PHÒNG
// ============================================================

export type MeetingType =
  | 'Họp cá nhân'
  | 'Họp phòng ban'
  | 'Họp toàn trường'
  | 'Họp BGH'
  | 'Họp chuyên môn';

export type MeetingStatus =
  | 'Sắp diễn ra'
  | 'Đang diễn ra'
  | 'Đã hoàn thành'
  | 'Đã hủy'
  | 'Chờ duyệt phòng'
  | 'Từ chối đặt phòng';

export type ResponseStatus =
  | 'Chưa phản hồi'
  | 'Tham dự'
  | 'Vắng mặt'
  | 'Xin phép vắng';

export type MinutesStatus = 'Chưa có' | 'Đang soạn' | 'Đã hoàn thành';

export interface MeetingParticipant {
  id: string;
  name: string;
  role: string;
  department: string;
  response: ResponseStatus;
  avatarInitials: string;
}

export interface MeetingAttachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'other';
  sizeMb: number;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  meetingType: MeetingType;
  startTime: string; // ISO
  endTime: string;
  roomId: string | null;
  roomName: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  departmentId: string;
  departmentName: string;
  participants: MeetingParticipant[];
  status: MeetingStatus;
  myResponseStatus: ResponseStatus;
  attachments: MeetingAttachment[];
  minutesStatus: MinutesStatus;
  agenda: string[];
  isRecurring: boolean;
  recurringNote?: string;
  changedAt?: string; // ISO — nếu thay đổi phòng/giờ
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Mock Rooms ───────────────────────────────────────────────
export const MEETING_ROOMS = [
  { id: 'R01', name: 'Phòng họp A (P.201)', capacity: 20 },
  { id: 'R02', name: 'Phòng họp B (P.301)', capacity: 30 },
  { id: 'R03', name: 'Hội trường lớn', capacity: 200 },
  { id: 'R04', name: 'Phòng BGH', capacity: 10 },
  { id: 'R05', name: 'Phòng họp chuyên môn', capacity: 15 },
] as const;

// ─── Participants helpers ──────────────────────────────────────
const P = (id: string, name: string, role: string, dept: string, resp: ResponseStatus): MeetingParticipant => ({
  id, name, role, department: dept, response: resp,
  avatarInitials: name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
});

const participants = {
  bgh: [
    P('u01', 'Nguyễn Văn Minh', 'Hiệu trưởng', 'BGH', 'Tham dự'),
    P('u02', 'Trần Thị Hoa', 'Phó Hiệu trưởng', 'BGH', 'Tham dự'),
    P('u03', 'Lê Minh Cường', 'Phó Hiệu trưởng', 'BGH', 'Tham dự'),
  ],
  tieuhoc: [
    P('u04', 'Phạm Thị Lan', 'Tổ trưởng khối 1', 'Tổ Tiểu học', 'Tham dự'),
    P('u05', 'Nguyễn Văn Bình', 'Giáo viên', 'Tổ Tiểu học', 'Tham dự'),
    P('u06', 'Trần Minh Tuấn', 'Giáo viên', 'Tổ Tiểu học', 'Chưa phản hồi'),
    P('u07', 'Lê Thị Ngọc', 'Giáo viên', 'Tổ Tiểu học', 'Xin phép vắng'),
    P('u08', 'Bùi Văn Minh', 'Giáo viên', 'Tổ Tiểu học', 'Tham dự'),
  ],
  tuyensinh: [
    P('u09', 'Hoàng Thị Thu', 'Trưởng phòng Tuyển sinh', 'P. Tuyển sinh', 'Tham dự'),
    P('u10', 'Vũ Minh Đức', 'Chuyên viên CRM', 'P. Tuyển sinh', 'Tham dự'),
    P('u02', 'Trần Thị Hoa', 'Phó Hiệu trưởng', 'BGH', 'Tham dự'),
    P('u11', 'Nguyễn Thị Mai', 'Chuyên viên Marketing', 'P. Marketing', 'Chưa phản hồi'),
  ],
  hanhchinh: [
    P('u12', 'Lê Văn Bình', 'Trưởng phòng Hành chính', 'P. Hành chính', 'Tham dự'),
    P('u13', 'Trần Thị Hoa', 'Nhân viên HC', 'P. Hành chính', 'Tham dự'),
    P('u14', 'Phạm Tú Dũng', 'Nhân viên bảo vệ', 'Bảo vệ', 'Chưa phản hồi'),
  ],
  toanTruong: [
    P('u01', 'Nguyễn Văn Minh', 'Hiệu trưởng', 'BGH', 'Tham dự'),
    P('u02', 'Trần Thị Hoa', 'Phó Hiệu trưởng', 'BGH', 'Tham dự'),
    P('u04', 'Phạm Thị Lan', 'Tổ trưởng khối 1', 'Tổ Tiểu học', 'Tham dự'),
    P('u09', 'Hoàng Thị Thu', 'Trưởng phòng Tuyển sinh', 'P. Tuyển sinh', 'Chưa phản hồi'),
    P('u12', 'Lê Văn Bình', 'Trưởng phòng Hành chính', 'P. Hành chính', 'Tham dự'),
    P('u05', 'Nguyễn Văn Bình', 'Giáo viên', 'Tổ Tiểu học', 'Tham dự'),
    P('u06', 'Trần Minh Tuấn', 'Giáo viên', 'Tổ Tiểu học', 'Chưa phản hồi'),
  ],
};

// ─── Now: 2026-07-04 ──────────────────────────────────────────
export const MEETINGS: Meeting[] = [
  {
    id: 'M001',
    title: 'Họp giao ban tuần – Tuần 27',
    description: 'Giao ban định kỳ tuần, đánh giá tiến độ công việc và phân công nhiệm vụ mới.',
    meetingType: 'Họp toàn trường',
    startTime: '2026-07-04T07:30:00',
    endTime: '2026-07-04T09:00:00',
    roomId: 'R02',
    roomName: 'Phòng họp B (P.301)',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u01',
    hostName: 'Nguyễn Văn Minh',
    hostAvatar: 'NM',
    departmentId: 'BGH',
    departmentName: 'Ban Giám Hiệu',
    participants: participants.toanTruong,
    status: 'Đã hoàn thành',
    myResponseStatus: 'Tham dự',
    attachments: [
      { id: 'A01', name: 'Kế hoạch tuần 27.pdf', url: '#', type: 'pdf', sizeMb: 0.8 },
      { id: 'A02', name: 'Báo cáo tuần 26.docx', url: '#', type: 'doc', sizeMb: 0.5 },
    ],
    minutesStatus: 'Đang soạn',
    agenda: ['Đánh giá tuần 26', 'Phân công tuần 27', 'Thông báo chỉ đạo mới'],
    isRecurring: true,
    recurringNote: 'Thứ 6 hàng tuần',
    createdAt: '2026-06-27T08:00:00',
    updatedAt: '2026-07-04T09:05:00',
  },
  {
    id: 'M002',
    title: 'Họp chuyên môn khối Tiểu học – Chuẩn bị năm học mới',
    description: 'Họp chuyên môn toàn khối tiểu học, chuẩn bị chương trình năm học 2026-2027.',
    meetingType: 'Họp chuyên môn',
    startTime: '2026-07-04T14:00:00',
    endTime: '2026-07-04T16:00:00',
    roomId: 'R05',
    roomName: 'Phòng họp chuyên môn',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u04',
    hostName: 'Phạm Thị Lan',
    hostAvatar: 'PL',
    departmentId: 'TH',
    departmentName: 'Tổ Tiểu học',
    participants: participants.tieuhoc,
    status: 'Sắp diễn ra',
    myResponseStatus: 'Tham dự',
    attachments: [
      { id: 'A03', name: 'Tài liệu chuyên môn TH.pdf', url: '#', type: 'pdf', sizeMb: 2.1 },
    ],
    minutesStatus: 'Chưa có',
    agenda: ['Phân tích kết quả năm học 2025-2026', 'Thảo luận CT năm mới', 'Phân công chủ nhiệm'],
    isRecurring: false,
    createdAt: '2026-06-30T10:00:00',
    updatedAt: '2026-06-30T10:00:00',
  },
  {
    id: 'M003',
    title: 'Họp Ban Giám Hiệu – Chiến lược tuyển sinh Q3',
    description: 'BGH họp đánh giá tình hình tuyển sinh Q2 và lập kế hoạch chiến lược Q3.',
    meetingType: 'Họp BGH',
    startTime: '2026-07-04T15:00:00',
    endTime: '2026-07-04T17:00:00',
    roomId: 'R04',
    roomName: 'Phòng BGH',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u01',
    hostName: 'Nguyễn Văn Minh',
    hostAvatar: 'NM',
    departmentId: 'BGH',
    departmentName: 'Ban Giám Hiệu',
    participants: participants.bgh,
    status: 'Sắp diễn ra',
    myResponseStatus: 'Chưa phản hồi',
    attachments: [],
    minutesStatus: 'Chưa có',
    agenda: ['Báo cáo tuyển sinh Q2', 'Phân tích KPI CRM', 'Chiến lược Open Day T8'],
    isRecurring: false,
    createdAt: '2026-07-01T09:00:00',
    updatedAt: '2026-07-01T09:00:00',
  },
  {
    id: 'M004',
    title: 'Họp online – Kế hoạch Marketing tháng 7',
    description: 'Họp trực tuyến qua Zoom để thống nhất kế hoạch marketing và truyền thông tháng 7.',
    meetingType: 'Họp phòng ban',
    startTime: '2026-07-05T09:00:00',
    endTime: '2026-07-05T10:30:00',
    roomId: null,
    roomName: null,
    isOnline: true,
    onlineUrl: 'https://zoom.us/j/123456789',
    hostId: 'u09',
    hostName: 'Hoàng Thị Thu',
    hostAvatar: 'HT',
    departmentId: 'MKT',
    departmentName: 'P. Tuyển sinh & Marketing',
    participants: participants.tuyensinh,
    status: 'Sắp diễn ra',
    myResponseStatus: 'Tham dự',
    attachments: [
      { id: 'A04', name: 'Plan MKT T7-2026.xlsx', url: '#', type: 'xls', sizeMb: 1.2 },
    ],
    minutesStatus: 'Chưa có',
    agenda: ['Review chiến dịch T6', 'Kế hoạch Open Day', 'Ngân sách quảng cáo'],
    isRecurring: false,
    createdAt: '2026-07-02T14:00:00',
    updatedAt: '2026-07-02T14:00:00',
  },
  {
    id: 'M005',
    title: 'Họp phụ huynh đầu năm học 2026-2027',
    description: 'Họp phụ huynh toàn trường, thông báo kế hoạch năm học mới và các quy định.',
    meetingType: 'Họp toàn trường',
    startTime: '2026-07-07T08:00:00',
    endTime: '2026-07-07T11:00:00',
    roomId: 'R03',
    roomName: 'Hội trường lớn',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u01',
    hostName: 'Nguyễn Văn Minh',
    hostAvatar: 'NM',
    departmentId: 'ALL',
    departmentName: 'Toàn trường',
    participants: participants.toanTruong,
    status: 'Sắp diễn ra',
    myResponseStatus: 'Tham dự',
    attachments: [
      { id: 'A05', name: 'Kế hoạch năm học 2026-2027.pdf', url: '#', type: 'pdf', sizeMb: 3.5 },
    ],
    minutesStatus: 'Chưa có',
    agenda: ['Chào mừng phụ huynh', 'Thông báo kế hoạch năm học', 'Q&A'],
    isRecurring: false,
    createdAt: '2026-06-25T08:00:00',
    updatedAt: '2026-06-25T08:00:00',
  },
  {
    id: 'M006',
    title: 'Họp giao ban vận hành – Tháng 7/2026',
    description: 'Họp vận hành hành chính tháng 7: cơ sở vật chất, an ninh, vệ sinh.',
    meetingType: 'Họp phòng ban',
    startTime: '2026-07-04T10:00:00',
    endTime: '2026-07-04T11:30:00',
    roomId: 'R01',
    roomName: 'Phòng họp A (P.201)',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u12',
    hostName: 'Lê Văn Bình',
    hostAvatar: 'LB',
    departmentId: 'HC',
    departmentName: 'P. Hành chính',
    participants: participants.hanhchinh,
    status: 'Đang diễn ra',
    myResponseStatus: 'Tham dự',
    attachments: [],
    minutesStatus: 'Chưa có',
    agenda: ['Kiểm tra CSVC tháng 7', 'Lịch bảo trì thiết bị', 'Phân công vệ sinh trường'],
    isRecurring: true,
    recurringNote: 'Đầu mỗi tháng',
    createdAt: '2026-07-01T08:00:00',
    updatedAt: '2026-07-04T10:05:00',
  },
  {
    id: 'M007',
    title: 'Họp tuyển sinh – Review hồ sơ đợt 3',
    description: 'Review và xét duyệt hồ sơ tuyển sinh đợt 3 năm học 2026-2027.',
    meetingType: 'Họp phòng ban',
    startTime: '2026-07-02T14:00:00',
    endTime: '2026-07-02T16:00:00',
    roomId: 'R01',
    roomName: 'Phòng họp A (P.201)',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u09',
    hostName: 'Hoàng Thị Thu',
    hostAvatar: 'HT',
    departmentId: 'TS',
    departmentName: 'P. Tuyển sinh',
    participants: participants.tuyensinh,
    status: 'Đã hoàn thành',
    myResponseStatus: 'Tham dự',
    attachments: [
      { id: 'A06', name: 'Danh sách hồ sơ đợt 3.xlsx', url: '#', type: 'xls', sizeMb: 0.9 },
    ],
    minutesStatus: 'Đã hoàn thành',
    agenda: ['Rà soát hồ sơ', 'Phân loại hồ sơ ưu tiên', 'Lịch phỏng vấn'],
    isRecurring: false,
    createdAt: '2026-06-28T10:00:00',
    updatedAt: '2026-07-02T16:30:00',
  },
  {
    id: 'M008',
    title: 'Họp chuyên môn – Đánh giá năng lực giáo viên',
    description: 'Họp đánh giá năng lực và phân công chuyên môn giáo viên chuẩn bị năm học mới.',
    meetingType: 'Họp chuyên môn',
    startTime: '2026-07-08T14:00:00',
    endTime: '2026-07-08T16:30:00',
    roomId: 'R05',
    roomName: 'Phòng họp chuyên môn',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u02',
    hostName: 'Trần Thị Hoa',
    hostAvatar: 'TH',
    departmentId: 'CM',
    departmentName: 'Tổ Chuyên môn',
    participants: [...participants.bgh, ...participants.tieuhoc].slice(0, 6),
    status: 'Sắp diễn ra',
    myResponseStatus: 'Chưa phản hồi',
    attachments: [
      { id: 'A07', name: 'Tiêu chí đánh giá GV 2026.pdf', url: '#', type: 'pdf', sizeMb: 1.5 },
    ],
    minutesStatus: 'Chưa có',
    agenda: ['Tiêu chí đánh giá', 'Phân công chuyên môn', 'Kế hoạch bồi dưỡng'],
    isRecurring: false,
    createdAt: '2026-07-03T09:00:00',
    updatedAt: '2026-07-03T09:00:00',
  },
  {
    id: 'M009',
    title: 'Họp khẩn – Xử lý sự cố PCCC khu B',
    description: 'Họp khẩn để xử lý sự cố thiết bị PCCC khu B và lên kế hoạch khắc phục.',
    meetingType: 'Họp phòng ban',
    startTime: '2026-07-03T16:00:00',
    endTime: '2026-07-03T17:00:00',
    roomId: 'R04',
    roomName: 'Phòng BGH',
    isOnline: false,
    onlineUrl: null,
    hostId: 'u01',
    hostName: 'Nguyễn Văn Minh',
    hostAvatar: 'NM',
    departmentId: 'CS',
    departmentName: 'CSVC & An ninh',
    participants: [...participants.bgh.slice(0, 2), ...participants.hanhchinh.slice(0, 2)],
    status: 'Đã hoàn thành',
    myResponseStatus: 'Vắng mặt',
    attachments: [],
    minutesStatus: 'Chưa có',
    agenda: ['Báo cáo sự cố', 'Phương án xử lý', 'Phân công thực hiện'],
    isRecurring: false,
    changedAt: '2026-07-03T15:30:00',
    createdAt: '2026-07-03T15:00:00',
    updatedAt: '2026-07-03T17:10:00',
  },
  {
    id: 'M010',
    title: 'Họp đặt phòng – Lễ khai giảng 2026',
    description: 'Lên kế hoạch sử dụng hội trường và các phòng chức năng cho lễ khai giảng.',
    meetingType: 'Họp phòng ban',
    startTime: '2026-07-09T08:30:00',
    endTime: '2026-07-09T10:00:00',
    roomId: null,
    roomName: null,
    isOnline: false,
    onlineUrl: null,
    hostId: 'u12',
    hostName: 'Lê Văn Bình',
    hostAvatar: 'LB',
    departmentId: 'HC',
    departmentName: 'P. Hành chính',
    participants: participants.hanhchinh,
    status: 'Chờ duyệt phòng',
    myResponseStatus: 'Tham dự',
    attachments: [],
    minutesStatus: 'Chưa có',
    agenda: ['Yêu cầu phòng & thiết bị', 'Phân công chuẩn bị', 'Timeline lễ khai giảng'],
    isRecurring: false,
    createdAt: '2026-07-04T08:00:00',
    updatedAt: '2026-07-04T08:00:00',
  },
];

// ─── KPI helpers ──────────────────────────────────────────────
export function getMeetingKPI(meetings: Meeting[], today = '2026-07-04') {
  const todayMeetings = meetings.filter(m => m.startTime.startsWith(today));
  return {
    todayTotal: todayMeetings.length,
    upcoming: meetings.filter(m => m.status === 'Sắp diễn ra').length,
    pending: meetings.filter(m => m.status === 'Chờ duyệt phòng').length,
    ongoing: meetings.filter(m => m.status === 'Đang diễn ra').length,
    completed: meetings.filter(m => m.status === 'Đã hoàn thành').length,
    cancelled: meetings.filter(m => m.status === 'Đã hủy').length,
    unconfirmed: meetings.filter(m => m.myResponseStatus === 'Chưa phản hồi').length,
    noMinutes: meetings.filter(m => m.status === 'Đã hoàn thành' && m.minutesStatus === 'Chưa có').length,
  };
}

export const MEETING_KPI = getMeetingKPI(MEETINGS);
