// ============================================================
// MOCK DATA — ĐẶT PHÒNG HỌP
// ============================================================

export type RoomType =
  | 'Phòng họp BGH'
  | 'Phòng hội đồng'
  | 'Phòng chuyên môn'
  | 'Hội trường'
  | 'Phòng chức năng'
  | 'Phòng tư vấn/phụ huynh';

export type RoomStatus = 'Đang hoạt động' | 'Bảo trì' | 'Tạm khóa';

export type BookingStatus =
  | 'Chờ duyệt'
  | 'Đã duyệt'
  | 'Từ chối'
  | 'Đã hủy'
  | 'Đã sử dụng'
  | 'Không sử dụng';

export type RoomEquipment =
  | 'Máy chiếu'
  | 'Màn hình'
  | 'Micro'
  | 'Loa'
  | 'Laptop'
  | 'Bảng viết'
  | 'Điều hòa'
  | 'Bàn ghế bổ sung'
  | 'Nước uống'
  | 'Thiết bị khác';

export const ALL_EQUIPMENT: RoomEquipment[] = [
  'Máy chiếu', 'Màn hình', 'Micro', 'Loa', 'Laptop',
  'Bảng viết', 'Điều hòa', 'Bàn ghế bổ sung', 'Nước uống', 'Thiết bị khác',
];

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  roomType: RoomType;
  equipment: RoomEquipment[];
  status: RoomStatus;
  /** true = cần BGH/Hành chính duyệt */
  requiresApproval: boolean;
  description?: string;
  imageUrl?: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  meetingId: string | null;
  meetingTitle: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  requestedEquipment: RoomEquipment[];
  extraSupport: string;
  notes: string;
  bookedBy: string;
  bookedByDept: string;
  status: BookingStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Rooms ─────────────────────────────────────────────────────
export const ROOMS: Room[] = [
  {
    id: 'R01',
    name: 'Phòng họp A',
    location: 'Phòng 201, Tầng 2, Tòa nhà A',
    capacity: 20,
    roomType: 'Phòng hội đồng',
    equipment: ['Máy chiếu', 'Micro', 'Loa', 'Điều hòa', 'Bảng viết', 'Nước uống'],
    status: 'Đang hoạt động',
    requiresApproval: false,
    description: 'Phòng họp đa năng, phù hợp họp nội bộ phòng ban và tổ chuyên môn.',
  },
  {
    id: 'R02',
    name: 'Phòng họp B',
    location: 'Phòng 301, Tầng 3, Tòa nhà A',
    capacity: 30,
    roomType: 'Phòng hội đồng',
    equipment: ['Máy chiếu', 'Màn hình', 'Micro', 'Loa', 'Điều hòa', 'Bảng viết', 'Nước uống'],
    status: 'Đang hoạt động',
    requiresApproval: false,
    description: 'Phòng họp lớn, có hệ thống âm thanh tích hợp.',
  },
  {
    id: 'R03',
    name: 'Hội trường lớn',
    location: 'Tầng 1, Tòa nhà B',
    capacity: 200,
    roomType: 'Hội trường',
    equipment: ['Máy chiếu', 'Màn hình', 'Micro', 'Loa', 'Laptop', 'Điều hòa', 'Bàn ghế bổ sung', 'Nước uống'],
    status: 'Đang hoạt động',
    requiresApproval: true,
    description: 'Hội trường toàn trường, dùng cho lễ khai giảng, sự kiện lớn, họp phụ huynh.',
  },
  {
    id: 'R04',
    name: 'Phòng BGH',
    location: 'Phòng 101, Tầng 1, Tòa nhà A',
    capacity: 10,
    roomType: 'Phòng họp BGH',
    equipment: ['Màn hình', 'Micro', 'Điều hòa', 'Laptop', 'Nước uống'],
    status: 'Đang hoạt động',
    requiresApproval: true,
    description: 'Phòng riêng của Ban Giám Hiệu, chỉ dùng cho họp BGH và tiếp khách quan trọng.',
  },
  {
    id: 'R05',
    name: 'Phòng chuyên môn',
    location: 'Phòng 205, Tầng 2, Tòa nhà A',
    capacity: 15,
    roomType: 'Phòng chuyên môn',
    equipment: ['Máy chiếu', 'Bảng viết', 'Điều hòa', 'Nước uống'],
    status: 'Đang hoạt động',
    requiresApproval: false,
    description: 'Phòng họp chuyên môn, phù hợp cho sinh hoạt tổ và bồi dưỡng giáo viên.',
  },
  {
    id: 'R06',
    name: 'Phòng tư vấn phụ huynh',
    location: 'Phòng 102, Tầng 1, Tòa nhà A',
    capacity: 8,
    roomType: 'Phòng tư vấn/phụ huynh',
    equipment: ['Điều hòa', 'Nước uống', 'Bảng viết'],
    status: 'Đang hoạt động',
    requiresApproval: false,
    description: 'Phòng tiếp đón và tư vấn phụ huynh, tạo không gian thân thiện.',
  },
  {
    id: 'R07',
    name: 'Phòng chức năng STEM',
    location: 'Phòng 302, Tầng 3, Tòa nhà B',
    capacity: 25,
    roomType: 'Phòng chức năng',
    equipment: ['Màn hình', 'Laptop', 'Điều hòa', 'Bảng viết'],
    status: 'Bảo trì',
    requiresApproval: false,
    description: 'Phòng STEM lab, đang bảo trì thiết bị.',
  },
];

// ─── Bookings ──────────────────────────────────────────────────
export const ROOM_BOOKINGS: RoomBooking[] = [
  {
    id: 'B001',
    roomId: 'R02',
    roomName: 'Phòng họp B',
    meetingId: 'M001',
    meetingTitle: 'Họp giao ban tuần – Tuần 27',
    date: '2026-07-04',
    startTime: '07:30',
    endTime: '09:00',
    purpose: 'Họp giao ban toàn trường tuần 27',
    expectedAttendees: 25,
    requestedEquipment: ['Máy chiếu', 'Micro', 'Nước uống'],
    extraSupport: '',
    notes: '',
    bookedBy: 'Nguyễn Văn Minh',
    bookedByDept: 'Ban Giám Hiệu',
    status: 'Đã sử dụng',
    approvedBy: 'Lê Văn Bình',
    approvedAt: '2026-07-03T16:00:00',
    rejectReason: null,
    createdAt: '2026-07-02T09:00:00',
    updatedAt: '2026-07-04T09:05:00',
  },
  {
    id: 'B002',
    roomId: 'R05',
    roomName: 'Phòng chuyên môn',
    meetingId: 'M002',
    meetingTitle: 'Họp chuyên môn khối Tiểu học',
    date: '2026-07-04',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Họp chuyên môn chuẩn bị năm học mới',
    expectedAttendees: 12,
    requestedEquipment: ['Máy chiếu', 'Bảng viết', 'Nước uống'],
    extraSupport: 'Cần in tài liệu 15 bộ',
    notes: '',
    bookedBy: 'Phạm Thị Lan',
    bookedByDept: 'Tổ Tiểu học',
    status: 'Đã duyệt',
    approvedBy: 'Lê Văn Bình',
    approvedAt: '2026-07-03T14:00:00',
    rejectReason: null,
    createdAt: '2026-07-01T10:00:00',
    updatedAt: '2026-07-03T14:00:00',
  },
  {
    id: 'B003',
    roomId: 'R04',
    roomName: 'Phòng BGH',
    meetingId: 'M003',
    meetingTitle: 'Họp BGH – Chiến lược tuyển sinh Q3',
    date: '2026-07-04',
    startTime: '15:00',
    endTime: '17:00',
    purpose: 'Họp BGH nội bộ về chiến lược tuyển sinh',
    expectedAttendees: 3,
    requestedEquipment: ['Màn hình', 'Laptop', 'Nước uống'],
    extraSupport: '',
    notes: 'Cần chuẩn bị tài liệu báo cáo Q2',
    bookedBy: 'Nguyễn Văn Minh',
    bookedByDept: 'Ban Giám Hiệu',
    status: 'Đã duyệt',
    approvedBy: 'Lê Văn Bình',
    approvedAt: '2026-07-03T09:00:00',
    rejectReason: null,
    createdAt: '2026-07-01T09:00:00',
    updatedAt: '2026-07-03T09:00:00',
  },
  {
    id: 'B004',
    roomId: 'R01',
    roomName: 'Phòng họp A',
    meetingId: 'M006',
    meetingTitle: 'Họp giao ban vận hành T7',
    date: '2026-07-04',
    startTime: '10:00',
    endTime: '11:30',
    purpose: 'Họp vận hành hành chính tháng 7',
    expectedAttendees: 8,
    requestedEquipment: ['Máy chiếu', 'Nước uống'],
    extraSupport: '',
    notes: '',
    bookedBy: 'Lê Văn Bình',
    bookedByDept: 'P. Hành chính',
    status: 'Đã sử dụng',
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
    createdAt: '2026-07-01T08:00:00',
    updatedAt: '2026-07-04T11:35:00',
  },
  {
    id: 'B005',
    roomId: 'R03',
    roomName: 'Hội trường lớn',
    meetingId: 'M005',
    meetingTitle: 'Họp phụ huynh đầu năm 2026-2027',
    date: '2026-07-07',
    startTime: '08:00',
    endTime: '11:00',
    purpose: 'Họp phụ huynh toàn trường đầu năm học',
    expectedAttendees: 180,
    requestedEquipment: ['Máy chiếu', 'Micro', 'Loa', 'Điều hòa', 'Nước uống', 'Bàn ghế bổ sung'],
    extraSupport: 'Cần sắp xếp bàn ghế theo sơ đồ khối',
    notes: 'Bắt đầu chuẩn bị từ 7h00',
    bookedBy: 'Lê Văn Bình',
    bookedByDept: 'P. Hành chính',
    status: 'Chờ duyệt',
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
    createdAt: '2026-07-04T08:00:00',
    updatedAt: '2026-07-04T08:00:00',
  },
  {
    id: 'B006',
    roomId: 'R01',
    roomName: 'Phòng họp A',
    meetingId: 'M007',
    meetingTitle: 'Họp tuyển sinh – Review hồ sơ đợt 3',
    date: '2026-07-02',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Xét duyệt hồ sơ tuyển sinh đợt 3',
    expectedAttendees: 6,
    requestedEquipment: ['Máy chiếu', 'Nước uống'],
    extraSupport: '',
    notes: '',
    bookedBy: 'Hoàng Thị Thu',
    bookedByDept: 'P. Tuyển sinh',
    status: 'Đã sử dụng',
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
    createdAt: '2026-06-28T10:00:00',
    updatedAt: '2026-07-02T16:30:00',
  },
  {
    id: 'B007',
    roomId: 'R02',
    roomName: 'Phòng họp B',
    meetingId: null,
    meetingTitle: null,
    date: '2026-07-05',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Đào tạo nội bộ – kỹ năng sử dụng phần mềm',
    expectedAttendees: 20,
    requestedEquipment: ['Máy chiếu', 'Laptop', 'Điều hòa'],
    extraSupport: '',
    notes: '',
    bookedBy: 'Trần Thị Hoa',
    bookedByDept: 'P. Hành chính',
    status: 'Đã duyệt',
    approvedBy: 'Lê Văn Bình',
    approvedAt: '2026-07-04T09:00:00',
    rejectReason: null,
    createdAt: '2026-07-03T14:00:00',
    updatedAt: '2026-07-04T09:00:00',
  },
  {
    id: 'B008',
    roomId: 'R05',
    roomName: 'Phòng chuyên môn',
    meetingId: 'M008',
    meetingTitle: 'Họp chuyên môn – Đánh giá năng lực GV',
    date: '2026-07-08',
    startTime: '14:00',
    endTime: '16:30',
    purpose: 'Đánh giá năng lực chuyên môn giáo viên',
    expectedAttendees: 14,
    requestedEquipment: ['Máy chiếu', 'Bảng viết', 'Nước uống'],
    extraSupport: 'In phiếu đánh giá 15 bộ',
    notes: '',
    bookedBy: 'Trần Thị Hoa',
    bookedByDept: 'BGH',
    status: 'Chờ duyệt',
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
    createdAt: '2026-07-03T09:00:00',
    updatedAt: '2026-07-03T09:00:00',
  },
  {
    id: 'B009',
    roomId: 'R03',
    roomName: 'Hội trường lớn',
    meetingId: null,
    meetingTitle: null,
    date: '2026-07-03',
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Tổng kết năm học 2025-2026',
    expectedAttendees: 150,
    requestedEquipment: ['Máy chiếu', 'Micro', 'Loa', 'Điều hòa'],
    extraSupport: '',
    notes: '',
    bookedBy: 'Nguyễn Văn Minh',
    bookedByDept: 'BGH',
    status: 'Đã sử dụng',
    approvedBy: 'Lê Văn Bình',
    approvedAt: '2026-07-01T10:00:00',
    rejectReason: null,
    createdAt: '2026-06-28T08:00:00',
    updatedAt: '2026-07-03T11:30:00',
  },
  {
    id: 'B010',
    roomId: 'R01',
    roomName: 'Phòng họp A',
    meetingId: null,
    meetingTitle: null,
    date: '2026-07-06',
    startTime: '08:00',
    endTime: '09:30',
    purpose: 'Họp nhóm nghiên cứu đề tài',
    expectedAttendees: 5,
    requestedEquipment: ['Bảng viết', 'Nước uống'],
    extraSupport: '',
    notes: '',
    bookedBy: 'Phạm Thị Lan',
    bookedByDept: 'Tổ Tiểu học',
    status: 'Đã duyệt',
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
    createdAt: '2026-07-04T14:00:00',
    updatedAt: '2026-07-04T14:00:00',
  },
];

// ─── Helpers ───────────────────────────────────────────────────
/** Kiểm tra phòng có bị đặt trùng không */
export function isRoomConflict(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string,
): RoomBooking | null {
  return ROOM_BOOKINGS.find(b => {
    if (b.roomId !== roomId) return false;
    if (b.date !== date) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.status === 'Đã hủy' || b.status === 'Từ chối') return false;
    // Overlap: start < b.endTime && end > b.startTime
    return startTime < b.endTime && endTime > b.startTime;
  }) ?? null;
}

/** Phòng còn trống tại ngày/giờ đã chọn */
export function getAvailableRooms(date: string, startTime: string, endTime: string): string[] {
  if (!date || !startTime || !endTime) return ROOMS.map(r => r.id);
  return ROOMS
    .filter(r => r.status === 'Đang hoạt động')
    .filter(r => !isRoomConflict(r.id, date, startTime, endTime))
    .map(r => r.id);
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { color: string; dot: string }> = {
  'Chờ duyệt':     { color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  'Đã duyệt':      { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Từ chối':       { color: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  'Đã hủy':        { color: 'bg-slate-100 text-slate-500 border-slate-200',    dot: 'bg-slate-400' },
  'Đã sử dụng':    { color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  'Không sử dụng': { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};

export const ROOM_TYPE_CONFIG: Record<RoomType, { color: string; icon: string }> = {
  'Phòng họp BGH':         { color: 'bg-rose-50 text-rose-700 border-rose-200',     icon: '🏛️' },
  'Phòng hội đồng':        { color: 'bg-blue-50 text-blue-700 border-blue-200',     icon: '🪑' },
  'Phòng chuyên môn':      { color: 'bg-teal-50 text-teal-700 border-teal-200',     icon: '📚' },
  'Hội trường':            { color: 'bg-purple-50 text-purple-700 border-purple-200',icon: '🎭' },
  'Phòng chức năng':       { color: 'bg-indigo-50 text-indigo-700 border-indigo-200',icon: '⚙️' },
  'Phòng tư vấn/phụ huynh':{ color: 'bg-emerald-50 text-emerald-700 border-emerald-200',icon: '👨‍👩‍👧' },
};
