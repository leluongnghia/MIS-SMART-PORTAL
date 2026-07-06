// ============================================================
// MOCK DATA — TRUNG TÂM TICKET DỊCH VỤ
// ============================================================

export type TicketStatus =
  | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_INFO'
  | 'WAITING_APPROVAL' | 'RESOLVED' | 'CLOSED' | 'OVERDUE'
  | 'CANCELLED' | 'REJECTED';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketGroup =
  | 'transport' | 'canteen' | 'medical' | 'boarding'
  | 'facility' | 'cleaning' | 'other';
export type SenderRole = 'parent' | 'teacher' | 'staff' | 'student' | 'bgh';

export interface TicketActivity {
  id: string;
  actorName: string;
  action: 'status_change' | 'comment' | 'assign' | 'transfer' | 'rating';
  fromStatus?: TicketStatus;
  toStatus?: TicketStatus;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketRating {
  stars: number;        // 1-5
  comment: string;
  ratedAt: string;
}

export interface ServiceTicket {
  id: string;
  code: string;
  title: string;
  description: string;
  serviceGroup: TicketGroup;
  senderName: string;
  senderRole: SenderRole;
  studentName: string | null;
  classOrDept: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  desiredDeadline: string | null;  // YYYY-MM-DD
  slaDeadline: string | null;      // computed
  attachments: { name: string; size: string }[];
  activities: TicketActivity[];
  rating: TicketRating | null;
  createdAt: string;
  updatedAt: string;
}

// ─── SLA config ────────────────────────────────────────────────
export const SLA_HOURS: Record<TicketPriority, number | null> = {
  urgent: 8,
  high:   24,
  normal: 72,
  low:    null,  // định kỳ
};

export function computeSlaDeadline(createdAt: string, priority: TicketPriority): string | null {
  const hours = SLA_HOURS[priority];
  if (!hours) return null;
  const d = new Date(createdAt);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function getSlaStatus(ticket: ServiceTicket): 'ok' | 'warning' | 'overdue' | null {
  if (!ticket.slaDeadline) return null;
  if (['RESOLVED', 'CLOSED', 'CANCELLED', 'REJECTED'].includes(ticket.status)) return 'ok';
  const now = new Date();
  const deadline = new Date(ticket.slaDeadline);
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs < 0) return 'overdue';
  if (diffMs < 2 * 3600 * 1000) return 'warning';
  return 'ok';
}

// ─── Config maps ───────────────────────────────────────────────
export const GROUP_CONFIG: Record<TicketGroup, { label: string; icon: string; color: string; dot: string }> = {
  transport: { label: 'Xe đưa đón',        icon: '🚌', color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  canteen:   { label: 'Suất ăn / Căng tin',icon: '🍱', color: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  medical:   { label: 'Y tế học đường',    icon: '🏥', color: 'bg-rose-50 text-rose-700 border-rose-200',     dot: 'bg-rose-500' },
  boarding:  { label: 'Bán trú / Nội trú', icon: '🏠', color: 'bg-indigo-50 text-indigo-700 border-indigo-200',dot: 'bg-indigo-500' },
  facility:  { label: 'Cơ sở vật chất',   icon: '🔧', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  cleaning:  { label: 'Vệ sinh / Môi trường',icon:'🧹',color: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot:'bg-emerald-500'},
  other:     { label: 'Khác',              icon: '📋', color: 'bg-purple-50 text-purple-700 border-purple-200',dot: 'bg-purple-500' },
};

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; dot: string }> = {
  NEW:              { label: 'Mới tạo',             color: 'bg-slate-100 text-slate-700 border-slate-200',    dot: 'bg-slate-400' },
  ASSIGNED:         { label: 'Đã tiếp nhận',        color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500'  },
  IN_PROGRESS:      { label: 'Đang xử lý',          color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  WAITING_INFO:     { label: 'Chờ bổ sung TT',      color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500'},
  WAITING_APPROVAL: { label: 'Chờ duyệt',           color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500'},
  RESOLVED:         { label: 'Đã giải quyết',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200',dot:'bg-emerald-500'},
  CLOSED:           { label: 'Đã đóng',             color: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-300' },
  OVERDUE:          { label: 'Quá hạn',             color: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500'  },
  CANCELLED:        { label: 'Đã hủy',              color: 'bg-slate-100 text-slate-500 border-slate-200',    dot: 'bg-slate-300' },
  REJECTED:         { label: 'Từ chối xử lý',       color: 'bg-rose-100 text-rose-800 border-rose-300',       dot: 'bg-rose-600'  },
};

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; dot: string }> = {
  urgent: { label: 'Khẩn cấp',  color: 'text-rose-700 bg-rose-50 border-rose-200',   dot: 'bg-rose-500' },
  high:   { label: 'Cao',       color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  normal: { label: 'Bình thường',color: 'text-blue-700 bg-blue-50 border-blue-200',   dot: 'bg-blue-400' },
  low:    { label: 'Thấp',      color: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
};

const SENDER_ROLE_LABELS: Record<SenderRole, string> = {
  parent: 'Phụ huynh', teacher: 'Giáo viên', staff: 'Nhân viên', student: 'Học sinh', bgh: 'BGH',
};

// ─── Seed data ─────────────────────────────────────────────────
const NOW = new Date().toISOString();
const d = (h: number) => { const t = new Date(); t.setHours(t.getHours() - h); return t.toISOString(); };

export const MOCK_TICKETS: ServiceTicket[] = [
  {
    id: 'TK001', code: 'TK-2026-001',
    title: 'Con tôi bị bỏ quên trên xe không về kịp',
    description: 'Hôm nay ngày 06/07 xe số 3 rời điểm dừng lúc 17:05 nhưng con tôi vẫn còn trong sân. Người nhà đã chờ đến 17:45 mới đón được. Rất mong nhà trường xem xét và xử lý nghiêm.',
    serviceGroup: 'transport', senderName: 'Nguyễn Thị Mai', senderRole: 'parent',
    studentName: 'Nguyễn Minh Khang', classOrDept: 'Lớp 3A', priority: 'urgent',
    status: 'IN_PROGRESS', assignedTo: 'Trần Văn Hùng',
    desiredDeadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    slaDeadline: new Date(Date.now() + 3600000).toISOString(), // 1h còn lại → warning
    attachments: [{ name: 'chup-man-hinh-lich-xe.jpg', size: '1.2 MB' }],
    activities: [
      { id: 'a1', actorName: 'Hệ thống', action: 'status_change', fromStatus: 'NEW', toStatus: 'ASSIGNED', content: 'Ticket được tiếp nhận tự động', isInternal: false, createdAt: d(5) },
      { id: 'a2', actorName: 'Lê Văn Bình', action: 'assign', content: 'Giao cho Trần Văn Hùng xử lý', isInternal: true, createdAt: d(4) },
      { id: 'a3', actorName: 'Trần Văn Hùng', action: 'status_change', fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', content: 'Đang liên hệ lái xe và xác minh sự việc', isInternal: false, createdAt: d(2) },
    ],
    rating: null, createdAt: d(6), updatedAt: d(2),
  },
  {
    id: 'TK002', code: 'TK-2026-002',
    title: 'Suất ăn bán trú thiếu rau và quá nhạt',
    description: 'Tuần này nhiều ngày suất ăn của con thiếu rau xanh, chỉ có cơm và thịt. Bé về nhà than đói và thức ăn nhạt. Xin nhà trường kiểm tra thực đơn.',
    serviceGroup: 'canteen', senderName: 'Trần Thị Lan', senderRole: 'parent',
    studentName: 'Trần Anh Dũng', classOrDept: 'Lớp 2B', priority: 'normal',
    status: 'WAITING_INFO', assignedTo: 'Nguyễn Thị Hoa',
    desiredDeadline: null, slaDeadline: new Date(Date.now() + 48 * 3600000).toISOString(),
    attachments: [],
    activities: [
      { id: 'b1', actorName: 'Nguyễn Thị Hoa', action: 'status_change', fromStatus: 'ASSIGNED', toStatus: 'WAITING_INFO', content: 'Cần phụ huynh cung cấp thêm ngày cụ thể xảy ra sự việc để đối chiếu thực đơn.', isInternal: false, createdAt: d(10) },
    ],
    rating: null, createdAt: d(24), updatedAt: d(10),
  },
  {
    id: 'TK003', code: 'TK-2026-003',
    title: 'Phòng vệ sinh tầng 2 tòa A bị tắc nghẽn',
    description: 'Toilet tầng 2 tòa A bị tắc từ sáng, đã báo lao công nhưng chưa xử lý. Học sinh phải đi xuống tầng 1.',
    serviceGroup: 'facility', senderName: 'Phạm Văn Nam', senderRole: 'teacher',
    studentName: null, classOrDept: 'Khối THCS', priority: 'high',
    status: 'RESOLVED', assignedTo: 'Đội kỹ thuật',
    desiredDeadline: null, slaDeadline: null,
    attachments: [{ name: 'anh-toilet.jpg', size: '856 KB' }],
    activities: [
      { id: 'c1', actorName: 'Đội kỹ thuật', action: 'status_change', fromStatus: 'IN_PROGRESS', toStatus: 'RESOLVED', content: 'Đã thông cống và vệ sinh sạch sẽ lúc 14:30', isInternal: false, createdAt: d(3) },
    ],
    rating: { stars: 5, comment: 'Xử lý nhanh, cảm ơn!', ratedAt: d(2) },
    createdAt: d(48), updatedAt: d(3),
  },
  {
    id: 'TK004', code: 'TK-2026-004',
    title: 'Học sinh bị dị ứng thuốc tại phòng y tế',
    description: 'Con tôi (Lê Minh Tuấn – Lớp 4C) bị dị ứng sau khi uống thuốc tại phòng y tế trưa hôm qua. Da nổi mẩn đỏ khắp người, phải đưa đi bệnh viện. Đề nghị giải thích rõ loại thuốc đã dùng.',
    serviceGroup: 'medical', senderName: 'Lê Văn Đức', senderRole: 'parent',
    studentName: 'Lê Minh Tuấn', classOrDept: 'Lớp 4C', priority: 'urgent',
    status: 'OVERDUE', assignedTo: 'Phòng Y tế',
    desiredDeadline: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    slaDeadline: new Date(Date.now() - 3600000).toISOString(), // đã quá hạn
    attachments: [],
    activities: [
      { id: 'd1', actorName: 'Hệ thống', action: 'status_change', fromStatus: 'IN_PROGRESS', toStatus: 'OVERDUE', content: 'Ticket đã vượt quá thời gian xử lý SLA 8h', isInternal: true, createdAt: d(1) },
    ],
    rating: null, createdAt: d(30), updatedAt: d(1),
  },
  {
    id: 'TK005', code: 'TK-2026-005',
    title: 'Đề nghị kiểm tra hệ thống điều hòa phòng học 301',
    description: 'Điều hòa phòng 301 phát ra tiếng ồn lớn từ đầu tuần. Học sinh không tập trung học được.',
    serviceGroup: 'facility', senderName: 'Hoàng Thị Thu', senderRole: 'teacher',
    studentName: null, classOrDept: 'Phòng 301', priority: 'normal',
    status: 'NEW', assignedTo: null,
    desiredDeadline: null, slaDeadline: new Date(Date.now() + 72 * 3600000).toISOString(),
    attachments: [],
    activities: [],
    rating: null, createdAt: d(2), updatedAt: d(2),
  },
  {
    id: 'TK006', code: 'TK-2026-006',
    title: 'Học sinh nội trú bị thiếu chăn ga trong đợt lạnh',
    description: 'Phòng nội trú A2 chỉ có 6 bộ chăn ga cho 8 học sinh. 2 bạn phải mượn của nhau.',
    serviceGroup: 'boarding', senderName: 'Quản lý nội trú', senderRole: 'staff',
    studentName: null, classOrDept: 'Phòng nội trú A2', priority: 'high',
    status: 'ASSIGNED', assignedTo: 'P. Hành chính',
    desiredDeadline: null, slaDeadline: new Date(Date.now() + 20 * 3600000).toISOString(),
    attachments: [],
    activities: [
      { id: 'e1', actorName: 'Lê Văn Bình', action: 'assign', content: 'Giao P. Hành chính mua bổ sung', isInternal: true, createdAt: d(4) },
    ],
    rating: null, createdAt: d(8), updatedAt: d(4),
  },
  {
    id: 'TK007', code: 'TK-2026-007',
    title: 'Sân trường có vũng nước lớn sau mưa gây trơn trượt',
    description: 'Khu vực cổng phụ B có vũng nước đọng lớn. Học sinh đã bị trượt 2 lần trong buổi sáng.',
    serviceGroup: 'cleaning', senderName: 'Bảo vệ ca sáng', senderRole: 'staff',
    studentName: null, classOrDept: 'Cơ sở 1', priority: 'high',
    status: 'CLOSED', assignedTo: 'Đội vệ sinh',
    desiredDeadline: null, slaDeadline: null,
    attachments: [{ name: 'san-truong-nuoc.jpg', size: '2.1 MB' }],
    activities: [
      { id: 'f1', actorName: 'Đội vệ sinh', action: 'status_change', fromStatus: 'IN_PROGRESS', toStatus: 'RESOLVED', content: 'Đã dọn nước và rải cát chống trơn', isInternal: false, createdAt: d(20) },
    ],
    rating: { stars: 4, comment: 'Xử lý ổn nhưng hơi lâu', ratedAt: d(18) },
    createdAt: d(72), updatedAt: d(18),
  },
];

// Staff list for assignment
export const SERVICE_STAFF = [
  'Trần Văn Hùng', 'Nguyễn Thị Hoa', 'Đội kỹ thuật',
  'Phòng Y tế', 'P. Hành chính', 'Đội vệ sinh',
  'Lê Văn Bình', 'Quản lý xe', 'Phòng bán trú',
];
