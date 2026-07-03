export interface Area {
  id: string;
  code: string;
  name: string;
  type: string;
  floor: string;
  assignee: string;
  frequency: string;
  status: 'Đang hoạt động' | 'Tạm dừng' | 'Cần kiểm tra';
}

export interface Schedule {
  id: string;
  date: string;
  shift: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối';
  areaId: string;
  areaName: string;
  assignee: string;
  status: 'Chưa thực hiện' | 'Đang thực hiện' | 'Hoàn thành' | 'Quá hạn' | 'Cần làm lại';
}

export interface ChecklistItem {
  id: string;
  name: string;
  passed: boolean;
  notes?: string;
}

export interface Checklist {
  id: string;
  scheduleId: string;
  areaName: string;
  date: string;
  score: number;
  maxScore: number;
  items: ChecklistItem[];
  inspector: string;
}

export interface Incident {
  id: string;
  areaName: string;
  type: string;
  severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
  description: string;
  reporter: string;
  assignedTo: string;
  dueDate: string;
  status: 'Chưa xử lý' | 'Đang xử lý' | 'Đã hoàn thành';
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  lastImport: string;
  lastExport: string;
  areaUsed: string;
}

export const CLEANING_AREAS: Area[] = [
  { id: '1', code: 'KV01', name: 'Nhà vệ sinh nam tầng 1', type: 'Nhà vệ sinh', floor: 'Tầng 1', assignee: 'Nguyễn Văn A', frequency: '2 lần/ngày', status: 'Đang hoạt động' },
  { id: '2', code: 'KV02', name: 'Hành lang khu B', type: 'Hành lang', floor: 'Tầng 2', assignee: 'Trần Thị B', frequency: '1 lần/ngày', status: 'Cần kiểm tra' },
  { id: '3', code: 'KV03', name: 'Nhà ăn học sinh', type: 'Nhà ăn', floor: 'Tầng trệt', assignee: 'Lê Văn C', frequency: '3 lần/ngày', status: 'Đang hoạt động' },
  { id: '4', code: 'KV04', name: 'Sân bóng rổ', type: 'Sân trường', floor: 'Ngoài trời', assignee: 'Phạm Thị D', frequency: '1 lần/tuần', status: 'Đang hoạt động' },
  { id: '5', code: 'KV05', name: 'Phòng Lab Hóa', type: 'Phòng chức năng', floor: 'Tầng 3', assignee: 'Nguyễn Văn E', frequency: 'Sau mỗi ca', status: 'Tạm dừng' },
];

export const CLEANING_SCHEDULES: Schedule[] = [
  { id: '1', date: '2026-07-03', shift: 'Sáng', areaId: '1', areaName: 'Nhà vệ sinh nam tầng 1', assignee: 'Nguyễn Văn A', status: 'Hoàn thành' },
  { id: '2', date: '2026-07-03', shift: 'Trưa', areaId: '3', areaName: 'Nhà ăn học sinh', assignee: 'Lê Văn C', status: 'Đang thực hiện' },
  { id: '3', date: '2026-07-03', shift: 'Chiều', areaId: '2', areaName: 'Hành lang khu B', assignee: 'Trần Thị B', status: 'Chưa thực hiện' },
  { id: '4', date: '2026-07-02', shift: 'Sáng', areaId: '4', areaName: 'Sân bóng rổ', assignee: 'Phạm Thị D', status: 'Quá hạn' },
  { id: '5', date: '2026-07-03', shift: 'Sáng', areaId: '5', areaName: 'Phòng Lab Hóa', assignee: 'Nguyễn Văn E', status: 'Cần làm lại' },
];

export const CLEANING_CHECKLISTS: Checklist[] = [
  {
    id: '1',
    scheduleId: '1',
    areaName: 'Nhà vệ sinh nam tầng 1',
    date: '2026-07-03 10:00',
    score: 5,
    maxScore: 5,
    inspector: 'Nguyễn Trưởng Tổ',
    items: [
      { id: 'c1', name: 'Sàn sạch, không trơn trượt', passed: true },
      { id: 'c2', name: 'Thùng rác đã đổ', passed: true },
      { id: 'c3', name: 'Có giấy vệ sinh', passed: true },
      { id: 'c4', name: 'Có xà phòng', passed: true },
      { id: 'c5', name: 'Không có mùi hôi', passed: true },
    ]
  },
  {
    id: '2',
    scheduleId: '5',
    areaName: 'Phòng Lab Hóa',
    date: '2026-07-03 09:30',
    score: 3,
    maxScore: 5,
    inspector: 'Trần Phó Tổ',
    items: [
      { id: 'c1', name: 'Sàn sạch', passed: true },
      { id: 'c2', name: 'Bàn ghế gọn gàng', passed: false, notes: 'Bàn số 2 còn hóa chất vương vãi' },
      { id: 'c3', name: 'Kính/cửa sạch', passed: true },
      { id: 'c4', name: 'Không có nước đọng', passed: false, notes: 'Bồn rửa bị tắc nhẹ' },
      { id: 'c5', name: 'Thùng rác đã đổ', passed: true },
    ]
  }
];

export const CLEANING_INCIDENTS: Incident[] = [
  { id: '1', areaName: 'Hành lang khu B', type: 'Bẩn', severity: 'Trung bình', description: 'Có rác thải nhựa nhiều ở góc hành lang', reporter: 'GV. Lan', assignedTo: 'Trần Thị B', dueDate: '2026-07-03', status: 'Chưa xử lý' },
  { id: '2', areaName: 'Nhà vệ sinh nữ tầng 2', type: 'Mùi hôi', severity: 'Cao', description: 'Có mùi khai nồng nặc', reporter: 'HS. Minh', assignedTo: 'Tổ Vệ sinh', dueDate: '2026-07-03', status: 'Đang xử lý' },
  { id: '3', areaName: 'Nhà ăn học sinh', type: 'Tràn nước', severity: 'Khẩn cấp', description: 'Vỡ ống nước bồn rửa tay', reporter: 'NV. Dinh Dưỡng', assignedTo: 'Đội Bảo trì', dueDate: '2026-07-03', status: 'Đã hoàn thành' },
];

export const CLEANING_MATERIALS: Material[] = [
  { id: '1', name: 'Nước lau sàn Sunlight', unit: 'Can 5L', stock: 12, minStock: 5, lastImport: '2026-06-15', lastExport: '2026-07-01', areaUsed: 'Toàn trường' },
  { id: '2', name: 'Giấy vệ sinh cuộn lớn', unit: 'Cuộn', stock: 15, minStock: 20, lastImport: '2026-06-20', lastExport: '2026-07-03', areaUsed: 'Khu vệ sinh' },
  { id: '3', name: 'Xà phòng rửa tay Lifebuoy', unit: 'Chai 500ml', stock: 30, minStock: 10, lastImport: '2026-06-10', lastExport: '2026-06-28', areaUsed: 'Khu vệ sinh, Nhà ăn' },
  { id: '4', name: 'Túi đựng rác 120L', unit: 'Kg', stock: 5, minStock: 10, lastImport: '2026-05-20', lastExport: '2026-07-02', areaUsed: 'Toàn trường' },
];

export const CLEANING_KPI = {
  totalAreas: 45,
  areasChecked: 38,
  areasPassed: 35,
  areasFailed: 3,
  schedulesToday: 120,
  schedulesCompleted: 85,
  completionRate: 70.8,
  pendingIncidents: 12,
  criticalIncidents: 2,
};
