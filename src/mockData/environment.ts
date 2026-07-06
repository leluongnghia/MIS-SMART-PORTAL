export const ENVIRONMENT_AREAS = [
  { id: 'AREA-001', code: 'KV-S1', name: 'Sân trường chính', type: 'Sân trường', building: 'Ngoài trời', floor: 'Trệt', frequency: '2 lần/ngày', responsibleTeam: 'Tổ Vệ sinh Sân', standard: 'Không rác, lá rụng', status: 'ACTIVE' },
  { id: 'AREA-002', code: 'KV-WC1', name: 'Nhà vệ sinh Tầng 1 Tòa A', type: 'Nhà vệ sinh', building: 'Tòa A', floor: 'Tầng 1', frequency: '4 lần/ngày', responsibleTeam: 'Tổ Vệ sinh Tòa A', standard: 'Sạch sẽ, không mùi, đủ giấy', status: 'ACTIVE' },
  { id: 'AREA-003', code: 'KV-C1', name: 'Hành lang Tầng 2 Tòa B', type: 'Hành lang', building: 'Tòa B', floor: 'Tầng 2', frequency: '2 lần/ngày', responsibleTeam: 'Tổ Vệ sinh Tòa B', standard: 'Sàn sạch, kính trong', status: 'ACTIVE' },
  { id: 'AREA-004', code: 'KV-CT', name: 'Khu vực Căng tin', type: 'Căng tin', building: 'Nhà Đa Năng', floor: 'Trệt', frequency: 'Sau mỗi bữa ăn', responsibleTeam: 'Tổ Vệ sinh Căng tin', standard: 'Bàn ghế sạch, sàn khô ráo', status: 'ACTIVE' },
  { id: 'AREA-005', code: 'KV-L1', name: 'Lớp học Khối 1', type: 'Lớp học', building: 'Tòa A', floor: 'Tầng 2', frequency: '1 lần/ngày (cuối giờ)', responsibleTeam: 'Tổ Vệ sinh Tòa A', standard: 'Bàn ghế ngay ngắn, sàn sạch, đổ rác', status: 'ACTIVE' },
  { id: 'AREA-006', code: 'KV-G1', name: 'Khu gom rác tập trung', type: 'Khu rác thải', building: 'Ngoài trời', floor: 'Trệt', frequency: '1 lần/ngày', responsibleTeam: 'Tổ Vận chuyển rác', standard: 'Không ùn ứ, khử mùi', status: 'ACTIVE' },
];

export const CLEANING_SCHEDULES = [
  { id: 'SCH-001', areaName: 'Sân trường chính', shift: 'Ca sáng', date: '2026-07-06', timeWindow: '06:00 - 07:00', assigneeName: 'Nguyễn Văn A', status: 'COMPLETED', score: 95, checkedByName: 'Trần Giám Sát' },
  { id: 'SCH-002', areaName: 'Nhà vệ sinh Tầng 1 Tòa A', shift: 'Ca sáng', date: '2026-07-06', timeWindow: '07:00 - 11:30', assigneeName: 'Lê Thị B', status: 'IN_PROGRESS', score: null, checkedByName: null },
  { id: 'SCH-003', areaName: 'Hành lang Tầng 2 Tòa B', shift: 'Ca trưa', date: '2026-07-06', timeWindow: '11:30 - 13:00', assigneeName: 'Phạm Văn C', status: 'PENDING', score: null, checkedByName: null },
  { id: 'SCH-004', areaName: 'Khu vực Căng tin', shift: 'Ca trưa', date: '2026-07-06', timeWindow: '12:00 - 13:30', assigneeName: 'Hoàng Thị D', status: 'PENDING', score: null, checkedByName: null },
  { id: 'SCH-005', areaName: 'Lớp học Khối 1', shift: 'Ca chiều', date: '2026-07-06', timeWindow: '16:30 - 18:00', assigneeName: 'Lê Thị B', status: 'PENDING', score: null, checkedByName: null },
  { id: 'SCH-006', areaName: 'Nhà vệ sinh Tầng 1 Tòa A', shift: 'Hôm qua', date: '2026-07-05', timeWindow: '14:00 - 18:00', assigneeName: 'Lê Thị B', status: 'FAILED', score: 40, checkedByName: 'Trần Giám Sát', note: 'Thiếu giấy, sàn còn ướt' },
  { id: 'SCH-007', areaName: 'Sân trường chính', shift: 'Hôm qua', date: '2026-07-05', timeWindow: '16:00 - 17:30', assigneeName: 'Nguyễn Văn A', status: 'REWORKED', score: 85, checkedByName: 'Trần Giám Sát', note: 'Đã quét lại khu vực góc cây' },
];

export const ENVIRONMENT_REPORTS = [
  { id: 'REP-001', title: 'Sàn WC trơn trượt', areaName: 'Nhà vệ sinh Tầng 1 Tòa A', reporterType: 'Giáo viên', reporterName: 'Cô Lan', severity: 'HIGH', category: 'Nước tràn', status: 'NEW', reportedAt: '2026-07-06T08:15:00Z' },
  { id: 'REP-002', title: 'Thùng rác đầy chưa đổ', areaName: 'Hành lang Tầng 2 Tòa B', reporterType: 'Học sinh', reporterName: 'Em Tuấn', severity: 'MEDIUM', category: 'Rác thải', status: 'IN_PROGRESS', reportedAt: '2026-07-06T09:30:00Z', assignedTo: 'Phạm Văn C' },
  { id: 'REP-003', title: 'Mùi khó chịu khu vực bếp', areaName: 'Khu vực Căng tin', reporterType: 'Nhân viên', reporterName: 'Chú Bình', severity: 'HIGH', category: 'Mùi khó chịu', status: 'RESOLVED', reportedAt: '2026-07-05T14:20:00Z', resolvedAt: '2026-07-05T15:00:00Z', assignedTo: 'Hoàng Thị D' },
  { id: 'REP-004', title: 'Cành cây gãy nguy hiểm', areaName: 'Sân trường chính', reporterType: 'Giám thị', reporterName: 'Thầy Hùng', severity: 'URGENT', category: 'Cây xanh/cảnh quan', status: 'NEW', reportedAt: '2026-07-06T10:00:00Z' },
];

export const CLEANING_CHECKLISTS = {
  'Nhà vệ sinh': [
    { id: 'c1', task: 'Quét và lau sàn', isRequired: true },
    { id: 'c2', task: 'Đổ rác', isRequired: true },
    { id: 'c3', task: 'Cọ bồn cầu/bồn tiểu', isRequired: true },
    { id: 'c4', task: 'Lau gương và bồn rửa tay', isRequired: true },
    { id: 'c5', task: 'Bổ sung giấy vệ sinh', isRequired: true },
    { id: 'c6', task: 'Bổ sung xà phòng rửa tay', isRequired: true },
    { id: 'c7', task: 'Khử mùi', isRequired: false },
    { id: 'c8', task: 'Chụp ảnh nghiệm thu', isRequired: true },
  ],
  'Lớp học': [
    { id: 'l1', task: 'Quét và lau sàn', isRequired: true },
    { id: 'l2', task: 'Lau bảng', isRequired: true },
    { id: 'l3', task: 'Sắp xếp lại bàn ghế', isRequired: true },
    { id: 'l4', task: 'Đổ rác', isRequired: true },
    { id: 'l5', task: 'Tắt điện/điều hòa (cuối ngày)', isRequired: true },
  ],
  'Sân trường': [
    { id: 's1', task: 'Quét sạch lá rụng và rác', isRequired: true },
    { id: 's2', task: 'Đổ các thùng rác công cộng', isRequired: true },
    { id: 's3', task: 'Xịt rửa sân (định kỳ)', isRequired: false },
  ],
  'Căng tin': [
    { id: 'ct1', task: 'Lau sạch các bàn ăn', isRequired: true },
    { id: 'ct2', task: 'Quét và lau sàn nhà', isRequired: true },
    { id: 'ct3', task: 'Thu dọn khay/thức ăn thừa rơi vãi', isRequired: true },
    { id: 'ct4', task: 'Đổ rác và vệ sinh thùng rác', isRequired: true },
  ]
};

export const ENVIRONMENT_STATS = {
  totalAreas: ENVIRONMENT_AREAS.length,
  completedToday: 12,
  pendingToday: 5,
  failedToday: 1,
  newReports: 2,
  overdueTasks: 1,
  averageScore: 92.5
};
