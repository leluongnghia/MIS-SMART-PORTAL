
export type RiskCategory = 'ADMISSION' | 'PROJECT' | 'HR' | 'OPERATIONAL' | 'SAFETY' | 'FACILITY' | 'DATA' | 'COMMUNICATION' | 'LEGAL' | 'PARENT_SERVICE' | 'OTHER';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'NEW' | 'WATCHING' | 'MITIGATING' | 'CONTROLLED' | 'CLOSED' | 'RECURRING';

export interface TimelineEvent {
  id: string;
  action: string;
  by: string;
  at: string;
  note?: string;
}

export interface RiskItem {
  id: string;
  code: string;
  category: RiskCategory;
  title: string;
  description: string;
  level: RiskLevel;
  department: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  owner: string;
  status: RiskStatus;
  currentControl: string;
  mitigationAction: string;
  deadline: string;
  sopRef?: string;
  timeline: TimelineEvent[];
}

export interface AuditChecklistItem {
  id: string;
  group: string;
  content: string;
  result: 'PASS' | 'FAIL' | 'OBSERVE' | 'NA' | 'PENDING';
  evidence?: string;
  note?: string;
  assessor?: string;
  severityIfFail?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  createCapa: boolean;
}

export type AuditStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REPORTED' | 'CANCELLED';

export interface AuditPlan {
  id: string;
  code: string;
  name: string;
  scope: 'SCHOOL' | 'DEPARTMENT' | 'PROCESS' | 'MODULE' | 'FACILITY';
  startDate: string;
  endDate: string;
  leadAuditor: string;
  auditors: string[];
  auditedDepartment: string;
  criteria: string;
  status: AuditStatus;
  checklist: AuditChecklistItem[];
  timeline: TimelineEvent[];
}

export type NCSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type NCStatus = 'NEW' | 'ROOT_CAUSE_ANALYSIS' | 'WAITING_CAPA' | 'IN_PROGRESS' | 'WAITING_VERIFICATION' | 'CLOSED' | 'RECURRING';
export type NCSource = 'AUDIT' | 'PROCESS_CHECK' | 'PARENT_COMPLAINT' | 'RISK' | 'BOARD_DIRECTIVE' | 'FACILITY_INCIDENT' | 'STUDENT_INCIDENT' | 'OTHER';

export interface NonConformity {
  id: string;
  code: string;
  source: NCSource;
  department: string;
  description: string;
  evidence: string;
  severity: NCSeverity;
  initialCause: string;
  owner: string;
  responseDeadline: string;
  status: NCStatus;
  relatedRiskId?: string;
  timeline: TimelineEvent[];
}

export type CapaStatus = 'NEW' | 'ANALYZING' | 'IN_PROGRESS' | 'OVERDUE' | 'WAITING_VERIFICATION' | 'EFFECTIVE' | 'INEFFECTIVE' | 'CLOSED';

export interface Capa {
  id: string;
  code: string;
  ncId: string;
  source: string;
  problemDescription: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  owner: string;
  department: string;
  startDate: string;
  deadline: string;
  status: CapaStatus;
  result?: string;
  verifier?: string;
  verifyDate?: string;
  verifyConclusion?: string;
  timeline: TimelineEvent[];
}

export interface ManagementReview {
  id: string;
  code: string;
  name: string;
  date: string;
  chairperson: string;
  attendees: string[];
  content: string;
  inputs: {
    highRisks: boolean;
    overdueCapas: boolean;
    auditResults: boolean;
    complaints: boolean;
    incidents: boolean;
    processEfficiency: boolean;
  };
  conclusion: string;
  directives: string;
  owner: string;
  deadline: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  timeline: TimelineEvent[];
}

export interface Incident {
  id: string;
  code: string;
  source: string;
  reporter: string;
  content: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department: string;
  owner: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  createRiskOrCapa: boolean;
  relatedCrmCaseId?: string;
  relatedStudentId?: string;
  relatedRiskId?: string;
  relatedCapaId?: string;
  timeline: TimelineEvent[];
}

const mockTimeline = (action: string, by: string = 'Hệ thống', daysAgo: number = 1): TimelineEvent[] => [
  {
    id: `tl_${Date.now()}_${Math.random()}`,
    action,
    by,
    at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const MOCK_RISKS: RiskItem[] = [
  {
    id: 'r_1', code: 'RSK-2601', category: 'SAFETY', title: 'Học sinh bị đón nhầm sau giờ học', description: 'Giáo viên mượn trả muộn, người nhà đón không có thẻ, bảo vệ không kiểm tra kỹ.', level: 'CRITICAL', department: 'Hành chính / Bảo vệ', probability: 2, impact: 5, owner: 'TP Hành chính', status: 'MITIGATING', currentControl: 'Phát thẻ đón học sinh đầu năm', mitigationAction: 'Yêu cầu 100% quẹt thẻ, dùng App nhận diện khuôn mặt', deadline: '2026-06-30', timeline: mockTimeline('Ghi nhận rủi ro', 'Admin')
  },
  {
    id: 'r_2', code: 'RSK-2602', category: 'DATA', title: 'Hồ sơ học sinh chưa cập nhật đầy đủ', description: 'Học bạ, giấy khám sức khỏe thiếu bản cứng và bản scan.', level: 'HIGH', department: 'Học vụ', probability: 4, impact: 3, owner: 'TP Học vụ', status: 'WATCHING', currentControl: 'Nhắc nhở GVCN', mitigationAction: 'Giao task thu thập trước 15/08 trên hệ thống', deadline: '2026-08-15', timeline: mockTimeline('Phát hiện thiếu sót', 'Giáo vụ')
  },
  {
    id: 'r_3', code: 'RSK-2603', category: 'FACILITY', title: 'Thiết bị phòng học STEAM hỏng chưa xử lý', description: '3 máy in 3D lỗi kẹt nhựa quá 2 tuần chưa có linh kiện thay thế.', level: 'MEDIUM', department: 'CSVC', probability: 3, impact: 2, owner: 'NV Kỹ thuật', status: 'NEW', currentControl: 'Tạm ngưng dùng máy', mitigationAction: 'Xin ngân sách mua linh kiện khẩn cấp', deadline: '2026-06-25', timeline: mockTimeline('Báo cáo hỏng', 'Giáo viên STEAM')
  },
  {
    id: 'r_4', code: 'RSK-2604', category: 'HR', title: 'Hợp đồng giáo viên sắp hết hạn chưa gia hạn', description: '15 GV hết hạn HĐLĐ vào 30/06, chưa ký phụ lục.', level: 'HIGH', department: 'Nhân sự', probability: 4, impact: 3, owner: 'TP Nhân sự', status: 'MITIGATING', currentControl: 'Cảnh báo excel', mitigationAction: 'Chạy workflow ký tự động trên HRM', deadline: '2026-06-28', timeline: mockTimeline('Hệ thống cảnh báo', 'System', 5)
  },
  {
    id: 'r_5', code: 'RSK-2605', category: 'PARENT_SERVICE', title: 'Khiếu nại phụ huynh chưa phản hồi đúng hạn', description: '5 vé khiếu nại chất lượng bữa ăn quá 48h chưa đóng.', level: 'CRITICAL', department: 'CSKH', probability: 3, impact: 4, owner: 'Trưởng CSKH', status: 'CONTROLLED', currentControl: 'Call center nhận', mitigationAction: 'Thiết lập SLA escalation trong CRM', deadline: '2026-06-20', timeline: mockTimeline('Xử lý xong', 'Trưởng CSKH', 0)
  },
  {
    id: 'r_6', code: 'RSK-2606', category: 'ADMISSION', title: 'Lead tuyển sinh không được chăm sóc sau 24h', description: 'Lead từ Facebook Ads bỏ sót 30%.', level: 'HIGH', department: 'Tuyển sinh', probability: 5, impact: 3, owner: 'Trưởng phòng PR', status: 'WATCHING', currentControl: 'Phân lead thủ công', mitigationAction: 'Cấu hình auto-assign và bot nhắc nhở', deadline: '2026-07-01', timeline: mockTimeline('Đánh giá hàng tuần', 'Marketing', 2)
  },
  {
    id: 'r_7', code: 'RSK-2607', category: 'SAFETY', title: 'Camera cổng trường mất tín hiệu', description: 'Camera CAM-01 chập chờn do mưa bão.', level: 'MEDIUM', department: 'CSVC / IT', probability: 2, impact: 3, owner: 'IT Admin', status: 'CLOSED', currentControl: 'Bảo vệ nhìn tay', mitigationAction: 'Thay thế cáp quang', deadline: '2026-06-15', timeline: mockTimeline('Đã thay cáp', 'IT Admin', 10)
  },
  {
    id: 'r_8', code: 'RSK-2608', category: 'DATA', title: 'Dữ liệu phụ huynh bị phân quyền sai', description: 'Nhân viên tuyển sinh thấy được điểm số nội bộ học sinh.', level: 'CRITICAL', department: 'IT', probability: 1, impact: 5, owner: 'IT Admin', status: 'NEW', currentControl: 'Review thủ công', mitigationAction: 'Áp dụng RBAC strict cho module học vụ', deadline: '2026-06-23', timeline: mockTimeline('Phát hiện lỗi', 'Hệ thống')
  },
  {
    id: 'r_9', code: 'RSK-2609', category: 'HR', title: 'Quy trình nghỉ phép không có người bàn giao', description: 'GV nghỉ ốm nhưng không có GV dạy thay trên TKB.', level: 'MEDIUM', department: 'Học vụ / Nhân sự', probability: 3, impact: 3, owner: 'Trưởng phòng Đào tạo', status: 'MITIGATING', currentControl: 'Gọi điện báo', mitigationAction: 'Bắt buộc chọn người dạy thay khi tạo form nghỉ', deadline: '2026-07-10', timeline: mockTimeline('Thay đổi quy trình', 'BGH')
  },
  {
    id: 'r_10', code: 'RSK-2610', category: 'COMMUNICATION', title: 'Sự kiện truyền thông chưa có phương án xử lý khủng hoảng', description: 'Lễ khai giảng có rủi ro phụ huynh phàn nàn kẹt xe.', level: 'MEDIUM', department: 'PR', probability: 4, impact: 2, owner: 'TP PR', status: 'NEW', currentControl: 'Xin lỗi trực tiếp', mitigationAction: 'Viết SOP phân luồng giao thông', deadline: '2026-08-20', timeline: mockTimeline('Lên kế hoạch', 'TP PR')
  },
  {
    id: 'r_11', code: 'RSK-2611', category: 'OPERATIONAL', title: 'Chậm thanh toán nhà cung cấp thực phẩm', description: 'Kế toán trễ duyệt do sai quy trình.', level: 'LOW', department: 'Kế toán', probability: 2, impact: 2, owner: 'Kế toán trưởng', status: 'CLOSED', currentControl: 'Quy trình 3 bước', mitigationAction: 'Số hóa duyệt hóa đơn', deadline: '2026-05-01', timeline: mockTimeline('Đã hoàn thành', 'Kế toán', 40)
  },
  {
    id: 'r_12', code: 'RSK-2612', category: 'LEGAL', title: 'Chưa nộp báo cáo PCCC hàng năm', description: 'Hạn chót 30/06 nhưng chưa có biên bản kiểm tra bảo dưỡng thiết bị.', level: 'HIGH', department: 'Hành chính', probability: 2, impact: 4, owner: 'TP Hành chính', status: 'WATCHING', currentControl: 'Theo dõi excel', mitigationAction: 'Thuê đơn vị bảo dưỡng kiểm tra ngay tuần này', deadline: '2026-06-25', timeline: mockTimeline('Nhận thông báo', 'Sở PCCC')
  }
];

export const MOCK_AUDIT_PLANS: AuditPlan[] = [
  {
    id: 'ap_1', code: 'AUD-2026-01', name: 'Đánh giá nội bộ Vận hành học kỳ 2', scope: 'SCHOOL', startDate: '2026-05-10', endDate: '2026-05-20', leadAuditor: 'Nguyễn Văn A (Kiểm soát NB)', auditors: ['Trần Thị B', 'Lê Văn C'], auditedDepartment: 'Toàn trường', criteria: 'Quy chế tổ chức hoạt động trường MIS', status: 'COMPLETED', timeline: mockTimeline('Kết thúc đánh giá', 'Nguyễn Văn A', 30),
    checklist: [
      { id: 'cl_1', group: 'Quản trị/BGH', content: 'Có họp xem xét định kỳ', result: 'PASS', createCapa: false },
      { id: 'cl_2', group: 'Hành chính - Nhân sự', content: 'Hồ sơ nhân sự đầy đủ', result: 'FAIL', severityIfFail: 'MAJOR', createCapa: true, evidence: '5 GV thiếu bằng ĐH bản sao' },
      { id: 'cl_3', group: 'Học vụ', content: 'Sự cố học vụ được xử lý', result: 'PASS', createCapa: false },
      { id: 'cl_4', group: 'Tuyển sinh/CSKH', content: 'Khiếu nại được xử lý < 24h', result: 'FAIL', severityIfFail: 'MINOR', createCapa: true, evidence: 'SLA thực tế là 48h' },
      { id: 'cl_5', group: 'Tài sản/CSVC', content: 'Tài sản có mã và người quản lý', result: 'OBSERVE', note: 'Một số ghế mới chưa dán mã', createCapa: false },
    ]
  },
  {
    id: 'ap_2', code: 'AUD-2026-02', name: 'Đánh giá an toàn thực phẩm & Y tế', scope: 'PROCESS', startDate: '2026-06-01', endDate: '2026-06-05', leadAuditor: 'Phạm Y Tế', auditors: ['Nguyễn Canteen'], auditedDepartment: 'Bếp / Y tế', criteria: 'VSATTP', status: 'REPORTED', timeline: mockTimeline('Lập báo cáo', 'Phạm Y Tế', 15),
    checklist: [
      { id: 'cl_6', group: 'Hành chính', content: 'Giấy chứng nhận VSATTP còn hạn', result: 'PASS', createCapa: false },
      { id: 'cl_7', group: 'Vận hành', content: 'Lưu mẫu thức ăn đúng 24h', result: 'PASS', createCapa: false },
      { id: 'cl_8', group: 'CSVC', content: 'Tủ lạnh lưu mẫu đạt nhiệt độ chuẩn', result: 'FAIL', severityIfFail: 'CRITICAL', createCapa: true, evidence: 'Tủ số 2 nhiệt độ > 8 độ C' },
    ]
  },
  {
    id: 'ap_3', code: 'AUD-2026-03', name: 'Kiểm tra quy trình Tuyển sinh đầu năm', scope: 'DEPARTMENT', startDate: '2026-06-25', endDate: '2026-06-28', leadAuditor: 'Trần KSNB', auditors: [], auditedDepartment: 'Tuyển sinh', criteria: 'SOP Tuyển sinh', status: 'APPROVED', timeline: mockTimeline('Phê duyệt KH', 'BGH', 2),
    checklist: [
      { id: 'cl_9', group: 'Tuyển sinh', content: 'Lead được ghi nhận đầy đủ', result: 'PENDING', createCapa: false },
      { id: 'cl_10', group: 'Tuyển sinh', content: 'Hồ sơ nhập học được kiểm soát', result: 'PENDING', createCapa: false },
    ]
  },
  {
    id: 'ap_4', code: 'AUD-2026-04', name: 'Rà soát an ninh mạng và bảo mật dữ liệu', scope: 'MODULE', startDate: '2026-07-01', endDate: '2026-07-05', leadAuditor: 'GĐ IT', auditors: ['Chuyên viên Bảo mật'], auditedDepartment: 'IT', criteria: 'ISO 27001 base', status: 'DRAFT', timeline: mockTimeline('Tạo nháp', 'GĐ IT', 1),
    checklist: [
      { id: 'cl_11', group: 'Dữ liệu/Hệ thống', content: 'Quyền truy cập phù hợp', result: 'PENDING', createCapa: false },
      { id: 'cl_12', group: 'Dữ liệu/Hệ thống', content: 'Không lộ thông tin nhạy cảm', result: 'PENDING', createCapa: false },
    ]
  }
];

export const MOCK_NCS: NonConformity[] = [
  { id: 'nc_1', code: 'NC-26001', source: 'AUDIT', department: 'Nhân sự', description: '5 GV thiếu bằng ĐH bản sao trong hồ sơ', evidence: 'Biên bản Audit AUD-2026-01', severity: 'MAJOR', initialCause: 'Nhân viên thu hồ sơ quên nhắc', owner: 'TP Nhân sự', responseDeadline: '2026-05-25', status: 'WAITING_VERIFICATION', relatedRiskId: 'r_4', timeline: mockTimeline('Tạo NC từ Audit', 'Nguyễn Văn A') },
  { id: 'nc_2', code: 'NC-26002', source: 'AUDIT', department: 'CSKH', description: 'Khiếu nại được xử lý SLA 48h thay vì 24h', evidence: 'Log CRM', severity: 'MINOR', initialCause: 'Thiếu người trực hotline cuối tuần', owner: 'Trưởng CSKH', responseDeadline: '2026-05-25', status: 'CLOSED', relatedRiskId: 'r_5', timeline: mockTimeline('Đã xử lý', 'Trưởng CSKH') },
  { id: 'nc_3', code: 'NC-26003', source: 'AUDIT', department: 'Bếp', description: 'Tủ lưu mẫu số 2 nhiệt độ > 8 độ C', evidence: 'Hình chụp nhiệt kế', severity: 'CRITICAL', initialCause: 'Ron cao su cửa tủ bị hở', owner: 'Quản lý Bếp', responseDeadline: '2026-06-06', status: 'WAITING_CAPA', timeline: mockTimeline('Tạo NC từ Audit Y Tế', 'Phạm Y Tế') },
  { id: 'nc_4', code: 'NC-26004', source: 'PARENT_COMPLAINT', department: 'Hành chính / Bảo vệ', description: 'Bảo vệ cho người lạ đón học sinh mà không có thẻ', evidence: 'Phản ánh của Phụ huynh mã PH-112', severity: 'CRITICAL', initialCause: 'Bảo vệ mới chưa rành quy trình', owner: 'Đội trưởng Bảo vệ', responseDeadline: '2026-06-23', status: 'ROOT_CAUSE_ANALYSIS', relatedRiskId: 'r_1', timeline: mockTimeline('Ghi nhận từ Hotline', 'CSKH') },
  { id: 'nc_5', code: 'NC-26005', source: 'PROCESS_CHECK', department: 'Tuyển sinh', description: 'Tư vấn viên không gọi lại lead sau 24h', evidence: 'Kiểm tra random 20 leads', severity: 'MAJOR', initialCause: 'Quá tải lead từ chiến dịch Mùa Hè', owner: 'Trưởng phòng PR', responseDeadline: '2026-06-25', status: 'NEW', relatedRiskId: 'r_6', timeline: mockTimeline('Tạo NC', 'KSNB') },
  { id: 'nc_6', code: 'NC-26006', source: 'FACILITY_INCIDENT', department: 'CSVC', description: 'Phòng STEAM máy in 3D hỏng 2 tuần', evidence: 'Ticket YeuCau-551', severity: 'MINOR', initialCause: 'Nhà cung cấp hết linh kiện', owner: 'Trưởng phòng CSVC', responseDeadline: '2026-06-22', status: 'IN_PROGRESS', relatedRiskId: 'r_3', timeline: mockTimeline('Đang xin mua mới', 'NV Kỹ thuật') },
  { id: 'nc_7', code: 'NC-26007', source: 'RISK', department: 'IT', description: 'Phân quyền sai, Sale thấy điểm số', evidence: 'Log truy cập lúc 14:00', severity: 'CRITICAL', initialCause: 'Code nhầm role ID', owner: 'GĐ IT', responseDeadline: '2026-06-20', status: 'OVERDUE' as any, timeline: mockTimeline('Quá hạn', 'System') }, // Cast OVERDUE for demo
  { id: 'nc_8', code: 'NC-26008', source: 'BOARD_DIRECTIVE', department: 'Học vụ', description: 'Chưa có form nghỉ phép online', evidence: 'Chỉ đạo cuộc họp tháng 5', severity: 'MAJOR', initialCause: 'Chưa cấu hình Workflow', owner: 'IT / Học vụ', responseDeadline: '2026-06-25', status: 'IN_PROGRESS', relatedRiskId: 'r_9', timeline: mockTimeline('Đang build workflow', 'IT') },
  { id: 'nc_9', code: 'NC-26009', source: 'PROCESS_CHECK', department: 'PR', description: 'Chưa có SOP xử lý truyền thông', evidence: 'Kiểm tra hồ sơ quy trình', severity: 'MINOR', initialCause: 'Nhân sự nghỉ thai sản', owner: 'TP PR', responseDeadline: '2026-06-30', status: 'NEW', relatedRiskId: 'r_10', timeline: mockTimeline('Tạo NC', 'KSNB') },
  { id: 'nc_10', code: 'NC-26010', source: 'OTHER', department: 'Hành chính', description: 'Chưa nộp BC PCCC', evidence: 'CV Sở', severity: 'MAJOR', initialCause: 'Quên lịch', owner: 'TP Hành chính', responseDeadline: '2026-06-22', status: 'WAITING_CAPA', relatedRiskId: 'r_12', timeline: mockTimeline('Mới ghi nhận', 'KSNB') }
];

export const MOCK_CAPAS: Capa[] = [
  { id: 'capa_1', code: 'CAPA-26-01', ncId: 'nc_1', source: 'AUD-2026-01', problemDescription: 'Thiếu bằng ĐH 5 GV', rootCause: 'Quy trình Onboarding không block ký HĐ nếu thiếu hồ sơ', correctiveAction: 'Thu hồi ngay 5 bản sao trong 3 ngày', preventiveAction: 'Cài checklist bắt buộc trên hệ thống HRM', owner: 'TP Nhân sự', department: 'Nhân sự', startDate: '2026-05-26', deadline: '2026-06-15', status: 'WAITING_VERIFICATION', timeline: mockTimeline('Đã hoàn thành action', 'TP Nhân sự') },
  { id: 'capa_2', code: 'CAPA-26-02', ncId: 'nc_2', source: 'AUD-2026-01', problemDescription: 'Xử lý KN chậm SLA', rootCause: 'Nhân sự trực off thứ 7', correctiveAction: 'Trưởng bộ phận trực thay ngay', preventiveAction: 'Lên lịch trực luân phiên cuối tuần', owner: 'Trưởng CSKH', department: 'CSKH', startDate: '2026-05-26', deadline: '2026-06-05', status: 'CLOSED', result: 'Hiệu quả', verifier: 'KSNB', verifyDate: '2026-06-10', verifyConclusion: 'Đã check log, SLA < 24h', timeline: mockTimeline('Xác minh xong', 'KSNB', 10) },
  { id: 'capa_3', code: 'CAPA-26-03', ncId: 'nc_4', source: 'Phản ánh', problemDescription: 'Đón nhầm học sinh', rootCause: 'Chưa có cơ chế check thẻ cứng cáp', correctiveAction: 'Phạt cảnh cáo bảo vệ vi phạm', preventiveAction: 'Triển khai FaceID đón trẻ', owner: 'TP Hành chính', department: 'Hành chính', startDate: '2026-06-23', deadline: '2026-07-30', status: 'IN_PROGRESS', timeline: mockTimeline('Đang lắp camera', 'IT') },
  { id: 'capa_4', code: 'CAPA-26-04', ncId: 'nc_7', source: 'Rủi ro r_8', problemDescription: 'Lỗi lộ điểm', rootCause: 'Bug phần mềm update', correctiveAction: 'Hotfix code thu hồi quyền', preventiveAction: 'Viết test case kiểm tra RBAC trước khi deploy', owner: 'GĐ IT', department: 'IT', startDate: '2026-06-18', deadline: '2026-06-19', status: 'OVERDUE', timeline: mockTimeline('Chưa có code test', 'QC') },
  { id: 'capa_5', code: 'CAPA-26-05', ncId: 'nc_8', source: 'Họp BGH', problemDescription: 'Thiếu form nghỉ phép', rootCause: 'Chưa ai được assign', correctiveAction: 'Tạo form Workflow', preventiveAction: 'Rà soát toàn bộ quy trình giấy', owner: 'IT', department: 'IT', startDate: '2026-06-20', deadline: '2026-06-25', status: 'IN_PROGRESS', timeline: mockTimeline('Tạo form xong 80%', 'IT') }
];

export const MOCK_REVIEWS: ManagementReview[] = [
  {
    id: 'mr_1', code: 'MR-26-Q1', name: 'Họp xem xét Lãnh đạo Quý 1', date: '2026-04-05', chairperson: 'Hiệu trưởng', attendees: ['GĐ Điều hành', 'TP Hành chính', 'KSNB'], content: 'Đánh giá hoạt động Q1', inputs: { highRisks: true, overdueCapas: false, auditResults: true, complaints: true, incidents: true, processEfficiency: true }, conclusion: 'Hệ thống vận hành ổn định, cần cải thiện tốc độ xử lý khiếu nại.', directives: 'Yêu cầu CSKH lập SLA mới.', owner: 'GĐ Điều hành', deadline: '2026-04-15', status: 'COMPLETED', timeline: mockTimeline('Đóng phiên', 'Thư ký', 60)
  },
  {
    id: 'mr_2', code: 'MR-26-Q2', name: 'Họp xem xét Lãnh đạo Quý 2', date: '2026-07-05', chairperson: 'Hiệu trưởng', attendees: ['GĐ Điều hành', 'Các TP'], content: 'Rà soát sự cố An toàn & Bảo mật dữ liệu', inputs: { highRisks: true, overdueCapas: true, auditResults: true, complaints: true, incidents: true, processEfficiency: false }, conclusion: '', directives: '', owner: 'GĐ Điều hành', deadline: '2026-07-10', status: 'SCHEDULED', timeline: mockTimeline('Lên lịch', 'KSNB', 1)
  }
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'inc_1', code: 'INC-2601', source: 'Facebook', reporter: 'Mẹ bé Bi', content: 'Đăng bài phàn nàn đồ ăn nguội', impact: 'MEDIUM', department: 'Bếp / CSKH', owner: 'Trưởng CSKH', status: 'RESOLVED', createRiskOrCapa: true, relatedRiskId: 'r_5', timeline: mockTimeline('Gọi điện xin lỗi', 'CSKH') },
  { id: 'inc_2', code: 'INC-2602', source: 'Giám thị', reporter: 'Thầy Cường', content: 'Học sinh té ngã giờ thể dục', impact: 'HIGH', department: 'Y tế / Thể chất', owner: 'TP Học vụ', status: 'INVESTIGATING', createRiskOrCapa: true, timeline: mockTimeline('Đang xem camera', 'Giám thị') }
];
