export type FacilityLocation = {
  id: string;
  code: string;
  name: string;
  type: string;
  building: string | null;
  floor: string | null;
  capacity: number | null;
  managerId: string | null;
  managerName: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FacilityAsset = {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  startUsingDate: string | null;
  locationId: string | null;
  locationName: string | null;
  responsibleUserId: string | null;
  responsibleUserName: string | null;
  status: string;
  maintenancePriority: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  imageUrl: string | null;
  qrCode: string | null;
  note: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FacilityRepairRequest = {
  id: string;
  title: string;
  assetId: string | null;
  assetName: string | null;
  locationId: string | null;
  locationName: string | null;
  description: string;
  priority: string;
  status: string;
  requestedById: string;
  requestedByName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  dueDate: string | null;
  completedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FacilityMaintenanceLog = {
  id: string;
  assetId: string;
  assetName: string | null;
  maintenanceType: string;
  scheduledDate: string;
  completedDate: string | null;
  responsibleUserId: string | null;
  responsibleUserName: string | null;
  status: string;
  checklist: any;
  result: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type FacilityHandoverLog = {
  id: string;
  assetId: string;
  assetName: string | null;
  receiverId: string;
  receiverName: string | null;
  department: string | null;
  handoverDate: string;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  conditionOnHandover: string | null;
  conditionOnReturn: string | null;
  handedOverById: string | null;
  handedOverByName: string | null;
  status: string;
  note: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const FACILITY_LOCATION_TYPES = {
  CLASSROOM: 'Phòng học',
  LAB: 'Phòng thực hành/Thí nghiệm',
  LIBRARY: 'Thư viện',
  MEETING_ROOM: 'Phòng họp/Văn phòng',
  WAREHOUSE: 'Kho thiết bị',
  CANTEEN: 'Nhà ăn',
  SPORTS_AREA: 'Khu thể thao',
  OTHER: 'Khác',
};

export const FACILITY_LOCATION_STATUS = {
  ACTIVE: 'Đang sử dụng',
  MAINTENANCE: 'Đang sửa chữa/Bảo trì',
  INACTIVE: 'Tạm ngừng sử dụng',
};

const FACILITY_ASSET_CATEGORIES = {
  IT: 'Thiết bị CNTT (Máy tính, Máy chiếu, Mạng)',
  FURNITURE: 'Bàn ghế & Nội thất',
  ELECTRONIC: 'Điện & Điện lạnh (Điều hòa, Quạt)',
  SPORT: 'Dụng cụ Thể thao',
  LAB: 'Thiết bị Thực hành',
  OTHER: 'Khác',
};

export const FACILITY_ASSET_STATUS = {
  ACTIVE: 'Đang sử dụng',
  READY: 'Sẵn sàng',
  MAINTENANCE: 'Đang bảo trì/Sửa chữa',
  BROKEN: 'Hỏng',
  LOST: 'Mất',
  LIQUIDATED: 'Đã thanh lý/Hủy',
};

export const REPAIR_PRIORITY = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

export const REPAIR_STATUS = {
  NEW: 'Mới tạo',
  PROCESSING: 'Đang xử lý',
  WAITING_PART: 'Chờ linh kiện',
  DONE: 'Đã hoàn thành',
  REJECTED: 'Từ chối',
};

const MAINTENANCE_TYPES = {
  ROUTINE: 'Bảo trì định kỳ',
  SAFETY: 'Kiểm tra an toàn',
  REPAIR: 'Sửa chữa',
  INSPECTION: 'Kiểm kê',
};

export const MAINTENANCE_STATUS = {
  SCHEDULED: 'Đã lên lịch',
  OVERDUE: 'Quá hạn',
  DONE: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const HANDOVER_STATUS = {
  ACTIVE: 'Đang bàn giao',
  RETURNED: 'Đã thu hồi',
  OVERDUE: 'Quá hạn trả',
  CANCELLED: 'Hủy',
};

type FacilityPurchaseRequest = {
  id: string;
  code: string;
  title: string;
  requestType: string;
  reason: string | null;
  departmentId: string | null;
  locationId: string | null;
  locationName: string | null;
  relatedRepairRequestId: string | null;
  relatedAssetId: string | null;
  priority: string | null;
  neededByDate: string | null;
  status: string;
  requestedById: string;
  requestedByName: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  approvedById: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type FacilityPurchaseItem = {
  id: string;
  purchaseRequestId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  specification: string | null;
  purpose: string | null;
  necessityLevel: string | null;
  estimatedUnitPrice: number | null;
  suggestedSupplier: string | null;
  status: string;
  receivedQuantity: number | null;
  createdAssetId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type FacilityInventoryCheck = {
  id: string;
  code: string;
  title: string;
  scope: string | null;
  locationId: string | null;
  category: string | null;
  status: string;
  assignedToId: string | null;
  assignedToName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  summary: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

type FacilityInventoryCheckItem = {
  id: string;
  inventoryCheckId: string;
  assetId: string;
  assetCode: string | null;
  assetName: string | null;
  expectedLocationId: string | null;
  actualLocationId: string | null;
  expectedStatus: string | null;
  actualStatus: string | null;
  result: string | null;
  note: string | null;
  checkedAt: string | null;
};

const PURCHASE_REQUEST_TYPES = {
  NEW: 'Mua mới',
  ADDITIONAL: 'Mua bổ sung',
  REPLACEMENT: 'Thay thế thiết bị hỏng',
  PART: 'Mua linh kiện sửa chữa',
  SUPPLY: 'Mua vật tư tiêu hao',
  URGENT: 'Mua khẩn cấp',
};

const PURCHASE_STATUS = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Đã gửi',
  INFO_REQUIRED: 'Cần bổ sung thông tin',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  PURCHASING: 'Đang mua',
  PARTIAL_RECEIVED: 'Đã nhận một phần',
  COMPLETED: 'Đã hoàn tất',
  CANCELLED: 'Đã hủy',
};

const PURCHASE_ITEM_STATUS = {
  PENDING: 'Chờ mua',
  PURCHASED: 'Đã mua',
  RECEIVED: 'Đã nhận hàng',
};

const INVENTORY_SCOPE = {
  ALL: 'Toàn trường',
  LOCATION: 'Theo phòng/khu vực',
  CATEGORY: 'Theo danh mục thiết bị',
};

const INVENTORY_STATUS = {
  DRAFT: 'Nháp',
  IN_PROGRESS: 'Đang kiểm kê',
  WAITING_APPROVAL: 'Chờ xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const INVENTORY_RESULT = {
  CORRECT: 'Đúng',
  WRONG_LOCATION: 'Sai vị trí',
  MISSING: 'Thiếu/Mất',
  SURPLUS: 'Thừa',
  DAMAGED: 'Hỏng',
  NEEDS_UPDATE: 'Cần cập nhật thông tin',
};

export const MOCK_LOCATIONS: FacilityLocation[] = [
  { id: 'L001', code: 'P101', name: 'Phòng học 1A', type: 'CLASSROOM', building: 'Tòa A', floor: '1', capacity: 35, managerId: null, managerName: null, status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L002', code: 'P102', name: 'Phòng học 2A', type: 'CLASSROOM', building: 'Tòa A', floor: '1', capacity: 35, managerId: null, managerName: null, status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L003', code: 'LAB01', name: 'Phòng máy tính 1', type: 'LAB', building: 'Tòa B', floor: '2', capacity: 40, managerId: null, managerName: 'Nguyễn Văn A', status: 'ACTIVE', note: 'Phòng thực hành tin học', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L004', code: 'LIB01', name: 'Thư viện Trung tâm', type: 'LIBRARY', building: 'Tòa C', floor: '1', capacity: 100, managerId: null, managerName: 'Trần Thị B', status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L005', code: 'STEM01', name: 'Phòng STEM', type: 'LAB', building: 'Tòa B', floor: '3', capacity: 30, managerId: null, managerName: null, status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L006', code: 'MEET01', name: 'Phòng họp BGH', type: 'MEETING_ROOM', building: 'Tòa A', floor: '2', capacity: 20, managerId: null, managerName: null, status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L007', code: 'CANT01', name: 'Nhà ăn học sinh', type: 'CANTEEN', building: 'Tòa D', floor: '1', capacity: 300, managerId: null, managerName: null, status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'L008', code: 'WH01', name: 'Kho thiết bị', type: 'WAREHOUSE', building: 'Tòa A', floor: '1', capacity: null, managerId: null, managerName: null, status: 'ACTIVE', note: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const MOCK_ASSETS: FacilityAsset[] = [
  { id: 'A001', code: 'EP-001', name: 'Máy chiếu Epson P01', category: 'IT', type: 'Projector', brand: 'Epson', model: 'EB-X06', serialNumber: 'SN12345678', purchaseDate: '2023-08-15T00:00:00Z', startUsingDate: '2023-09-01T00:00:00Z', locationId: 'L001', locationName: 'Phòng học 1A', responsibleUserId: null, responsibleUserName: null, status: 'ACTIVE', maintenancePriority: 'MEDIUM', lastMaintenanceDate: '2024-01-10T00:00:00Z', nextMaintenanceDate: '2024-07-10T00:00:00Z', imageUrl: null, qrCode: null, note: null, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A002', code: 'LT-001', name: 'Laptop Dell VP01', category: 'IT', type: 'Laptop', brand: 'Dell', model: 'Latitude 3420', serialNumber: 'SN87654321', purchaseDate: '2023-08-15T00:00:00Z', startUsingDate: '2023-09-01T00:00:00Z', locationId: 'L006', locationName: 'Phòng họp BGH', responsibleUserId: null, responsibleUserName: null, status: 'READY', maintenancePriority: 'LOW', lastMaintenanceDate: null, nextMaintenanceDate: null, imageUrl: null, qrCode: null, note: null, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A003', code: 'PR-001', name: 'Máy in Canon HC01', category: 'IT', type: 'Printer', brand: 'Canon', model: 'LBP2900', serialNumber: 'SN11223344', purchaseDate: '2022-01-10T00:00:00Z', startUsingDate: '2022-01-15T00:00:00Z', locationId: 'L006', locationName: 'Phòng họp BGH', responsibleUserId: null, responsibleUserName: null, status: 'BROKEN', maintenancePriority: 'HIGH', lastMaintenanceDate: '2023-10-05T00:00:00Z', nextMaintenanceDate: '2024-04-05T00:00:00Z', imageUrl: null, qrCode: null, note: 'Kẹt giấy liên tục', archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A004', code: 'AC-001', name: 'Điều hòa Daikin 1A', category: 'ELECTRONIC', type: 'Air Conditioner', brand: 'Daikin', model: 'FTF35UV1V', serialNumber: null, purchaseDate: '2021-05-20T00:00:00Z', startUsingDate: '2021-06-01T00:00:00Z', locationId: 'L001', locationName: 'Phòng học 1A', responsibleUserId: null, responsibleUserName: null, status: 'MAINTENANCE', maintenancePriority: 'MEDIUM', lastMaintenanceDate: '2023-05-15T00:00:00Z', nextMaintenanceDate: '2024-05-15T00:00:00Z', imageUrl: null, qrCode: null, note: 'Đang nạp gas', archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A005', code: 'CAM-001', name: 'Camera hành lang tầng 2', category: 'ELECTRONIC', type: 'Camera', brand: 'Hikvision', model: 'DS-2CE56D0T', serialNumber: null, purchaseDate: '2023-11-01T00:00:00Z', startUsingDate: '2023-11-05T00:00:00Z', locationId: null, locationName: 'Hành lang Tầng 2', responsibleUserId: null, responsibleUserName: null, status: 'ACTIVE', maintenancePriority: 'LOW', lastMaintenanceDate: null, nextMaintenanceDate: null, imageUrl: null, qrCode: null, note: null, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A006', code: 'FUR-001', name: 'Bộ bàn ghế lớp 1A', category: 'FURNITURE', type: 'Desk', brand: 'Hòa Phát', model: null, serialNumber: null, purchaseDate: '2023-07-20T00:00:00Z', startUsingDate: '2023-08-15T00:00:00Z', locationId: 'L001', locationName: 'Phòng học 1A', responsibleUserId: null, responsibleUserName: null, status: 'ACTIVE', maintenancePriority: 'LOW', lastMaintenanceDate: null, nextMaintenanceDate: null, imageUrl: null, qrCode: null, note: 'Bàn ghế học sinh', archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A007', code: 'NET-001', name: 'Router phòng máy', category: 'IT', type: 'Router', brand: 'Cisco', model: 'RV340', serialNumber: 'SN99887766', purchaseDate: '2022-09-10T00:00:00Z', startUsingDate: '2022-09-12T00:00:00Z', locationId: 'L003', locationName: 'Phòng máy tính 1', responsibleUserId: null, responsibleUserName: null, status: 'ACTIVE', maintenancePriority: 'MEDIUM', lastMaintenanceDate: '2023-09-10T00:00:00Z', nextMaintenanceDate: '2024-03-10T00:00:00Z', imageUrl: null, qrCode: null, note: null, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'A008', code: 'FUR-002', name: 'Tủ tài liệu thư viện', category: 'FURNITURE', type: 'Cabinet', brand: 'Hòa Phát', model: null, serialNumber: null, purchaseDate: '2021-08-05T00:00:00Z', startUsingDate: '2021-08-15T00:00:00Z', locationId: 'L004', locationName: 'Thư viện Trung tâm', responsibleUserId: null, responsibleUserName: null, status: 'ACTIVE', maintenancePriority: 'LOW', lastMaintenanceDate: null, nextMaintenanceDate: null, imageUrl: null, qrCode: null, note: null, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const MOCK_REPAIR_REQUESTS: FacilityRepairRequest[] = [
  { id: 'R001', title: 'Máy chiếu phòng 1A không lên hình', assetId: 'A001', assetName: 'Máy chiếu Epson P01', locationId: 'L001', locationName: 'Phòng học 1A', description: 'Bật máy chiếu không lên đèn báo, cáp nguồn đã cắm chặt.', priority: 'HIGH', status: 'NEW', requestedById: 'U001', requestedByName: 'Nguyễn Văn A', assignedToId: null, assignedToName: null, dueDate: null, completedAt: null, resolutionNote: null, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'R002', title: 'Điều hòa lớp 2A kêu to', assetId: null, assetName: 'Điều hòa Daikin', locationId: 'L002', locationName: 'Phòng học 2A', description: 'Khi bật quạt gió số to thì có tiếng kêu rè rè rất lớn.', priority: 'MEDIUM', status: 'PROCESSING', requestedById: 'U002', requestedByName: 'Trần Thị B', assignedToId: 'U003', assignedToName: 'Thợ bảo trì', dueDate: new Date(Date.now() + 86400000).toISOString(), completedAt: null, resolutionNote: null, createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'R003', title: 'Máy in hành chính kẹt giấy', assetId: 'A003', assetName: 'Máy in Canon HC01', locationId: 'L006', locationName: 'Phòng họp BGH', description: 'Giấy bị kẹt liên tục ở lô sấy, không in được.', priority: 'URGENT', status: 'WAITING_PART', requestedById: 'U004', requestedByName: 'Lê Văn C', assignedToId: 'U003', assignedToName: 'Thợ bảo trì', dueDate: new Date().toISOString(), completedAt: null, resolutionNote: 'Cần thay bao lụa sấy mới, đang đặt hàng.', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
];

export const MOCK_MAINTENANCE_LOGS: FacilityMaintenanceLog[] = [
  { id: 'M001', assetId: 'A004', assetName: 'Điều hòa Daikin 1A', maintenanceType: 'ROUTINE', scheduledDate: new Date().toISOString(), completedDate: null, responsibleUserId: 'U003', responsibleUserName: 'Thợ bảo trì', status: 'SCHEDULED', checklist: { filter: false, gas: false, drain: false }, result: null, note: 'Bảo dưỡng định kỳ hè', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const MOCK_HANDOVERS: FacilityHandoverLog[] = [
  { id: 'H001', assetId: 'A002', assetName: 'Laptop Dell VP01', receiverId: 'U005', receiverName: 'Phạm Thị D', department: 'Tuyển sinh', handoverDate: new Date(Date.now() - 2592000000).toISOString(), expectedReturnDate: null, actualReturnDate: null, conditionOnHandover: 'Mới 100%', conditionOnReturn: null, handedOverById: 'U001', handedOverByName: 'Admin', status: 'ACTIVE', note: 'Cấp laptop làm việc', attachmentUrl: null, createdAt: new Date(Date.now() - 2592000000).toISOString(), updatedAt: new Date(Date.now() - 2592000000).toISOString() },
];

const canManageFacilities = (user: any) => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER' || user.departmentId === 'CSVC';
};

const canViewFacilities = (user: any) => {
  if (!user) return false;
  return true; // Everyone can view some part
};
