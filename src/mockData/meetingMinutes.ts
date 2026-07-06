// ============================================================
// MOCK DATA — BIÊN BẢN HỌP & GIAO VIỆC SAU HỌP
// ============================================================

export type MinutesStatus =
  | 'Chưa tạo'
  | 'Đang soạn'
  | 'Chờ duyệt'
  | 'Đã duyệt'
  | 'Đã gửi người tham gia'
  | 'Cần chỉnh sửa';

export type TaskPriority = 'Thấp' | 'Bình thường' | 'Cao' | 'Khẩn cấp';

export type TaskStatus =
  | 'Chưa thực hiện'
  | 'Đang thực hiện'
  | 'Chờ xác nhận'
  | 'Hoàn thành'
  | 'Quá hạn';

export interface PostMeetingTask {
  id: string;
  minutesId: string;
  meetingId: string;
  title: string;
  description: string;
  assignee: string;        // tên người phụ trách
  assigneeId: string;
  collaborators: string[]; // tên người phối hợp
  department: string;
  dueDate: string;         // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;     // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  host: string;
  secretary: string;
  attendees: string[];     // tên người có mặt
  absentees: string[];     // tên người vắng
  meetingSummary: string;  // nội dung chính
  discussionNotes: string; // ý kiến thảo luận
  conclusion: string;      // kết luận cuộc họp
  tasks: PostMeetingTask[];
  attachments: { name: string; size: string }[];
  status: MinutesStatus;
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
}

// ─── Seed data ─────────────────────────────────────────────────
export const MEETING_MINUTES: MeetingMinutes[] = [
  {
    id: 'MM001',
    meetingId: 'MD002',
    meetingTitle: 'Họp BGH – Chiến lược tuyển sinh Q3',
    meetingDate: '2026-07-04',
    startTime: '15:00',
    endTime: '17:00',
    location: 'Phòng BGH',
    host: 'Nguyễn Văn Minh',
    secretary: 'Lê Văn Bình',
    attendees: ['Nguyễn Văn Minh', 'Trần Thị Hoa', 'Lê Văn Bình', 'Hoàng Thị Thu'],
    absentees: [],
    meetingSummary: `1. BGH thống nhất chỉ tiêu tuyển sinh Q3 tăng 15% so với Q2.\n2. Triển khai chiến dịch marketing online trên 3 kênh chính: Facebook, Zalo, Website.\n3. Mở thêm 2 hội thảo tư vấn tuyển sinh tại quận 9 và Bình Thạnh.\n4. Cải thiện quy trình tiếp nhận hồ sơ — mục tiêu xử lý trong 24h.`,
    discussionNotes: `- Phó HT Trần Thị Hoa đề xuất thêm chương trình học bổng thu hút học sinh giỏi.\n- Trưởng P. Tuyển sinh Hoàng Thị Thu báo cáo: tỉ lệ chuyển đổi Q2 đạt 68%, cần cải thiện follow-up.\n- Thống nhất bổ sung 1 chuyên viên tư vấn tuyển sinh cho tháng 8.\n- BGH yêu cầu báo cáo kết quả hàng tuần vào thứ Hai.`,
    conclusion: `1. Mục tiêu tuyển sinh Q3: 450 học sinh (tăng 15% so Q2).\n2. Ra mắt chiến dịch "Học bổng tài năng 2026" từ ngày 10/07.\n3. Phòng Tuyển sinh phối hợp P. Marketing tổ chức 2 hội thảo tháng 7.\n4. Hoàng Thị Thu chịu trách nhiệm báo cáo tiến độ mỗi thứ Hai.`,
    tasks: [
      {
        id: 'T001', minutesId: 'MM001', meetingId: 'MD002',
        title: 'Xây dựng kế hoạch chi tiết chiến dịch "Học bổng tài năng 2026"',
        description: 'Lập kế hoạch marketing, ngân sách, timeline và kênh triển khai chiến dịch học bổng Q3.',
        assignee: 'Hoàng Thị Thu', assigneeId: 'S005',
        collaborators: ['Lý Thị Hạnh', 'Lê Văn Bình'],
        department: 'P. Tuyển sinh',
        dueDate: '2026-07-10',
        priority: 'Cao',
        status: 'Đang thực hiện',
        notes: 'Cần xin ngân sách từ BGH trước ngày 08/07',
        completedAt: null,
        createdAt: '2026-07-04T17:30:00',
        updatedAt: '2026-07-05T09:00:00',
      },
      {
        id: 'T002', minutesId: 'MM001', meetingId: 'MD002',
        title: 'Tổ chức hội thảo tuyển sinh tại quận 9',
        description: 'Lên kế hoạch, đặt địa điểm, mời phụ huynh và học sinh tham dự hội thảo.',
        assignee: 'Hoàng Thị Thu', assigneeId: 'S005',
        collaborators: ['Lý Thị Hạnh'],
        department: 'P. Tuyển sinh',
        dueDate: '2026-07-20',
        priority: 'Cao',
        status: 'Chưa thực hiện',
        notes: '',
        completedAt: null,
        createdAt: '2026-07-04T17:30:00',
        updatedAt: '2026-07-04T17:30:00',
      },
      {
        id: 'T003', minutesId: 'MM001', meetingId: 'MD002',
        title: 'Tuyển thêm 1 chuyên viên tư vấn tuyển sinh',
        description: 'Đăng tuyển, phỏng vấn và onboarding nhân sự tư vấn mới để tăng cường cho tháng 8.',
        assignee: 'Lê Văn Bình', assigneeId: 'S003',
        collaborators: ['Trần Thị Hoa'],
        department: 'P. Hành chính',
        dueDate: '2026-07-31',
        priority: 'Bình thường',
        status: 'Chưa thực hiện',
        notes: 'JD đã có sẵn từ đợt tuyển trước',
        completedAt: null,
        createdAt: '2026-07-04T17:30:00',
        updatedAt: '2026-07-04T17:30:00',
      },
      {
        id: 'T004', minutesId: 'MM001', meetingId: 'MD002',
        title: 'Cải thiện quy trình tiếp nhận hồ sơ (target 24h)',
        description: 'Rà soát quy trình hiện tại, đề xuất cải tiến để rút ngắn thời gian xử lý xuống 24h.',
        assignee: 'Lê Văn Bình', assigneeId: 'S003',
        collaborators: ['Hoàng Thị Thu'],
        department: 'P. Hành chính',
        dueDate: '2026-07-08',
        priority: 'Khẩn cấp',
        status: 'Quá hạn',
        notes: 'Deadline đã qua, cần họp lại để xử lý',
        completedAt: null,
        createdAt: '2026-07-04T17:30:00',
        updatedAt: '2026-07-04T17:30:00',
      },
    ],
    attachments: [
      { name: 'Bao-cao-tuyen-sinh-Q2.pdf', size: '1.2 MB' },
      { name: 'Ke-hoach-Q3-draft.docx', size: '856 KB' },
    ],
    status: 'Đã duyệt',
    createdBy: 'Lê Văn Bình',
    approvedBy: 'Nguyễn Văn Minh',
    createdAt: '2026-07-04T17:15:00',
    updatedAt: '2026-07-04T18:00:00',
    approvedAt: '2026-07-04T18:00:00',
  },
  {
    id: 'MM002',
    meetingId: 'MD001',
    meetingTitle: 'Họp giao ban tuần – Tuần 28',
    meetingDate: '2026-07-06',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Phòng họp B (P.301)',
    host: 'Nguyễn Văn Minh',
    secretary: 'Lê Văn Bình',
    attendees: [],
    absentees: [],
    meetingSummary: '',
    discussionNotes: '',
    conclusion: '',
    tasks: [],
    attachments: [],
    status: 'Chưa tạo',
    createdBy: '',
    approvedBy: null,
    createdAt: '',
    updatedAt: '',
    approvedAt: null,
  },
];

// ─── Config ────────────────────────────────────────────────────
export const MINUTES_STATUS_CONFIG: Record<MinutesStatus, { color: string; dot: string; icon: string }> = {
  'Chưa tạo':              { color: 'bg-slate-100 text-slate-500 border-slate-200',    dot: 'bg-slate-400',   icon: '⭕' },
  'Đang soạn':             { color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',    icon: '✏️' },
  'Chờ duyệt':             { color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',   icon: '⏳' },
  'Đã duyệt':              { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: '✅' },
  'Đã gửi người tham gia': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500',  icon: '📨' },
  'Cần chỉnh sửa':         { color: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500',    icon: '🔄' },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { color: string; dot: string }> = {
  'Thấp':      { color: 'bg-slate-100 text-slate-600 border-slate-200',  dot: 'bg-slate-400' },
  'Bình thường':{ color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  'Cao':       { color: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  'Khẩn cấp':  { color: 'bg-rose-100 text-rose-700 border-rose-200',     dot: 'bg-rose-500' },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { color: string; dot: string }> = {
  'Chưa thực hiện': { color: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
  'Đang thực hiện': { color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500'  },
  'Chờ xác nhận':   { color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  'Hoàn thành':     { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Quá hạn':        { color: 'bg-rose-100 text-rose-700 border-rose-200',        dot: 'bg-rose-500'  },
};
