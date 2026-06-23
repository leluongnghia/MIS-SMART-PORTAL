'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Plus, BookOpen, 
  Settings, CheckCircle2, Clock, AlertTriangle, 
  MoreVertical, BookMarked, Tags, Layers,
  ChevronRight, Building2, UserCircle, Calendar, Link as LinkIcon, X
} from 'lucide-react';
import { DocumentItem } from '../types';
import CreateDocumentForm from './CreateDocumentForm';

// MOCK DATA for 3 Document Packages
const mockDocuments: DocumentItem[] = [
  // Package 1: HR & Admin
  {
    id: 'doc-1', docCode: 'HR-SOP-01', title: 'Quy trình xin nghỉ phép và phê duyệt',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '2.1', status: 'ACTIVE',
    effectiveDate: '2024-01-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['nghỉ phép', 'HR', 'SOP'],
    relatedModules: ['WORKFLOW_APPROVALS', 'HRM'], createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z', createdBy: 'admin', timeline: [],
    purpose: 'Chuẩn hóa quy trình xin nghỉ phép, đảm bảo quyền lợi và tiến độ công việc.',
  },
  {
    id: 'doc-2', docCode: 'HR-FORM-01', title: 'Mẫu đơn xin nghỉ phép',
    docType: 'FORM', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '2.0', status: 'ACTIVE',
    effectiveDate: '2024-01-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['nghỉ phép', 'biểu mẫu'],
    relatedModules: ['WORKFLOW_APPROVALS'], createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-3', docCode: 'HR-SOP-02', title: 'Quy trình bàn giao và nghỉ việc',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '1.5', status: 'NEEDS_REVIEW',
    effectiveDate: '2023-06-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['nghỉ việc', 'bàn giao'],
    relatedModules: ['HRM', 'LOGISTICS'], createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-4', docCode: 'HR-FORM-02', title: 'Biên bản bàn giao công việc',
    docType: 'FORM', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng HCNS',
    ownerId: 'Nguyễn Thị A', version: '1.2', status: 'ACTIVE',
    effectiveDate: '2023-06-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['nghỉ việc', 'biểu mẫu'],
    relatedModules: ['HRM'], createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-5', docCode: 'HR-SOP-03', title: 'Quy trình đào tạo hội nhập',
    docType: 'SOP', category: 'Hành chính - Nhân sự', departmentOwner: 'Phòng Đào tạo',
    ownerId: 'Trần Văn B', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2024-03-15', priority: 'Bình thường',
    targetAudience: ['HCNS', 'Giáo viên', 'Nhân viên'], tags: ['đào tạo', 'hội nhập'],
    relatedModules: ['HRM'], createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z', createdBy: 'admin', timeline: [],
  },

  // Package 2: Internal Control
  {
    id: 'doc-6', docCode: 'IC-SOP-01', title: 'Quy trình kiểm soát nội bộ định kỳ',
    docType: 'SOP', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '3.0', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'HCNS'], tags: ['kiểm soát', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-7', docCode: 'IC-FORM-01', title: 'Phiếu ghi nhận điểm không phù hợp (NC)',
    docType: 'FORM', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '1.1', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['NC', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-8', docCode: 'IC-FORM-02', title: 'Phiếu yêu cầu hành động khắc phục (CAPA)',
    docType: 'FORM', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2024-02-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS'], tags: ['CAPA', 'khắc phục'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-9', docCode: 'IC-CHK-01', title: 'Checklist đánh giá nội bộ',
    docType: 'CHECKLIST', category: 'Kiểm soát nội bộ', departmentOwner: 'Ban Kiểm soát',
    ownerId: 'Lê Thị C', version: '2.0', status: 'DRAFT',
    effectiveDate: '', priority: 'Bình thường',
    targetAudience: ['BGH', 'HCNS'], tags: ['checklist', 'audit'],
    relatedModules: ['RISK_CENTER'], createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z', createdBy: 'admin', timeline: [],
  },

  // Package 3: Operations & Facilities
  {
    id: 'doc-10', docCode: 'FM-SOP-01', title: 'Quy trình quản lý và bảo trì tài sản',
    docType: 'SOP', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Quan trọng',
    targetAudience: ['BGH', 'HCNS', 'Nhân viên'], tags: ['tài sản', 'bảo trì'],
    relatedModules: ['LOGISTICS'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-11', docCode: 'FM-FORM-01', title: 'Phiếu yêu cầu sửa chữa thiết bị',
    docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['sửa chữa', 'thiết bị'],
    relatedModules: ['LOGISTICS', 'WORKFLOW_APPROVALS'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-12', docCode: 'FM-FORM-02', title: 'Biên bản bàn giao tài sản',
    docType: 'FORM', category: 'Tài sản/Cơ sở vật chất', departmentOwner: 'Phòng Quản trị CSVC',
    ownerId: 'Phạm Văn D', version: '1.2', status: 'ACTIVE',
    effectiveDate: '2023-09-01', priority: 'Bình thường',
    targetAudience: ['HCNS', 'Giáo viên', 'Nhân viên'], tags: ['tài sản', 'bàn giao'],
    relatedModules: ['LOGISTICS', 'HRM'], createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },

  // Event & Parent Services
  {
    id: 'doc-13', docCode: 'EV-SOP-01', title: 'Quy trình tiếp nhận và xử lý phản ánh',
    docType: 'SOP', category: 'CSKH Phụ huynh', departmentOwner: 'Phòng Dịch vụ Học đường',
    ownerId: 'Hoàng Thị E', version: '1.1', status: 'ACTIVE',
    effectiveDate: '2024-01-15', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'HCNS', 'Giáo viên', 'Nhân viên'], tags: ['phản ánh', 'CSKH', 'ticket'],
    relatedModules: ['EVENTS', 'RISK_CENTER'], createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-14', docCode: 'EV-SOP-02', title: 'Quy trình xử lý khủng hoảng truyền thông',
    docType: 'SOP', category: 'Truyền thông/Sự kiện', departmentOwner: 'Phòng Truyền thông',
    ownerId: 'Đinh Văn F', version: '2.0', status: 'PENDING_APPROVAL',
    effectiveDate: '', priority: 'Bắt buộc',
    targetAudience: ['BGH', 'Truyền thông'], tags: ['khủng hoảng', 'truyền thông'],
    relatedModules: ['EVENTS', 'RISK_CENTER', 'BOARD_DIRECTIVES'], createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z', createdBy: 'admin', timeline: [],
  },
  {
    id: 'doc-15', docCode: 'EV-FORM-01', title: 'Mẫu Kế hoạch tổ chức sự kiện',
    docType: 'FORM', category: 'Truyền thông/Sự kiện', departmentOwner: 'Phòng Truyền thông',
    ownerId: 'Đinh Văn F', version: '1.0', status: 'ACTIVE',
    effectiveDate: '2023-10-01', priority: 'Bình thường',
    targetAudience: ['Giáo viên', 'Nhân viên'], tags: ['sự kiện', 'kế hoạch'],
    relatedModules: ['EVENTS', 'WORKFLOW_APPROVALS'], createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z', createdBy: 'admin', timeline: [],
  }
];


interface DocumentDetailDrawerProps {
  document: DocumentItem | null;
  onClose: () => void;
}

function DocumentDetailDrawer({ document, onClose }: DocumentDetailDrawerProps) {
  if (!document) return null;

  // Custom step generator for SOPs if steps are not defined
  const getSopSteps = (doc: DocumentItem) => {
    if (doc.steps && doc.steps.length > 0) return doc.steps;
    
    if (doc.docCode.includes('HR-SOP-01')) {
      return [
        { stepNumber: 1, title: 'Đăng ký nghỉ phép', description: 'Cán bộ viết đơn và upload minh chứng trên hệ thống', role: 'Cán bộ/Giáo viên', sla: '15 phút' },
        { stepNumber: 2, title: 'Phê duyệt giảng dạy thay thế', description: 'Tổ trưởng chuyên môn xem xét và phân công người dạy thay', role: 'Tổ trưởng', sla: '4 giờ' },
        { stepNumber: 3, title: 'Phê duyệt cấp BGH', description: 'BGH xem xét phê duyệt chính thức', role: 'Ban Giám Hiệu', sla: '12 giờ' },
        { stepNumber: 4, title: 'Ghi nhận ngày nghỉ', description: 'Phòng HCNS đồng bộ dữ liệu chấm công', role: 'Phòng HCNS', sla: '2 giờ' }
      ];
    }
    if (doc.docCode.includes('HR-SOP-02')) {
      return [
        { stepNumber: 1, title: 'Gửi yêu cầu nghỉ việc', description: 'Nhân sự nộp đơn xin nghỉ trước thời hạn quy định (30-45 ngày)', role: 'Nhân sự nghỉ việc', sla: '1 ngày' },
        { stepNumber: 2, title: 'Xác nhận bàn giao tài sản', description: 'Trả lại toàn bộ laptop, chìa khóa phòng, thẻ nhân viên', role: 'Phòng HCNS & CSVC', sla: '3 ngày' },
        { stepNumber: 3, title: 'Bàn giao công việc chuyên môn', description: 'Chuyển giao tài liệu, giáo án và đầu việc đang dang dở', role: 'Người tiếp nhận', sla: '5 ngày' },
        { stepNumber: 4, title: 'Ký quyết định chấm dứt HĐLD', description: 'BGH ký quyết định và HCNS chi trả chế độ', role: 'BGH & Kế toán', sla: '2 ngày' }
      ];
    }
    if (doc.docCode.includes('IC-SOP-01')) {
      return [
        { stepNumber: 1, title: 'Lập chương trình kiểm soát', description: 'Xác định phạm vi, phòng ban và thời gian kiểm tra', role: 'Trưởng ban kiểm soát', sla: '2 ngày' },
        { stepNumber: 2, title: 'Thực hiện kiểm tra tại chỗ', description: 'Phỏng vấn nhân sự, đối chiếu chứng từ thực tế', role: 'Kiểm soát viên', sla: '3 ngày' },
        { stepNumber: 3, title: 'Ghi nhận điểm không phù hợp (NC)', description: 'Lập biên bản NC và yêu cầu hành động khắc phục CAPA', role: 'Ban kiểm soát', sla: '1 ngày' },
        { stepNumber: 4, title: 'Theo dõi hành động khắc phục', description: 'Kiểm tra lại việc khắc phục lỗi của các phòng ban', role: 'Kiểm soát viên', sla: '7 ngày' }
      ];
    }
    if (doc.docCode.includes('FM-SOP-01')) {
      return [
        { stepNumber: 1, title: 'Báo hỏng / Yêu cầu bảo trì', description: 'Cán bộ giáo viên gửi yêu cầu sửa chữa thiết bị phòng học', role: 'Giáo viên/Nhân viên', sla: '30 phút' },
        { stepNumber: 2, title: 'Khảo sát hiện trạng', description: 'Kỹ thuật viên phòng CSVC kiểm tra mức độ hỏng hóc', role: 'Kỹ thuật viên', sla: '4 giờ' },
        { stepNumber: 3, title: 'Phê duyệt chi phí (nếu có)', description: 'Trưởng phòng CSVC duyệt kế hoạch sửa chữa/thay mới', role: 'Trưởng phòng CSVC', sla: '1 ngày' },
        { stepNumber: 4, title: 'Nghiệm thu sau bảo trì', description: 'Giáo viên xác nhận thiết bị hoạt động bình thường', role: 'Giáo viên báo hỏng', sla: '2 giờ' }
      ];
    }
    if (doc.docCode.includes('EV-SOP-01')) {
      return [
        { stepNumber: 1, title: 'Tiếp nhận phản ánh', description: 'Ghi nhận ý kiến từ app phụ huynh, email hoặc hotline', role: 'Lễ tân/CSKH', sla: '10 phút' },
        { stepNumber: 2, title: 'Xác minh thông tin vụ việc', description: 'Liên hệ các bên liên quan để làm rõ nội dung phản ánh', role: 'Phòng Dịch vụ học đường', sla: '4 giờ' },
        { stepNumber: 3, title: 'Đề xuất phương án xử lý', description: 'Báo cáo BGH và thống nhất cách giải quyết với phụ huynh', role: 'BGH & CSKH', sla: '1 ngày' },
        { stepNumber: 4, title: 'Phản hồi kết quả', description: 'Gửi thư chính thức hoặc gọi điện phản hồi cho phụ huynh', role: 'Phòng Dịch vụ học đường', sla: '2 giờ' }
      ];
    }
    if (doc.docCode.includes('EV-SOP-02')) {
      return [
        { stepNumber: 1, title: 'Phát hiện khủng hoảng', description: 'Theo dõi mạng xã hội, báo chí và phát hiện tin tức tiêu cực', role: 'Bộ phận PR/Truyền thông', sla: '15 phút' },
        { stepNumber: 2, title: 'Triệu tập ban xử lý khẩn cấp', description: 'Họp BGH, Ban Truyền thông và Ban pháp chế', role: 'Hiệu trưởng/BGH', sla: '1 giờ' },
        { stepNumber: 3, title: 'Soạn thảo thông cáo báo chí', description: 'Chuẩn bị thông điệp nhất quán và kịch bản ứng phó', role: 'Ban Truyền thông', sla: '3 giờ' },
        { stepNumber: 4, title: 'Phát ngôn chính thức', description: 'Đại diện nhà trường trả lời báo chí và gửi email thông báo phụ huynh', role: 'Người phát ngôn', sla: '2 giờ' }
      ];
    }
    
    return [
      { stepNumber: 1, title: 'Yêu cầu & Khởi tạo', description: 'Khởi tạo quy trình nghiệp vụ trên phần mềm', role: 'Nhân sự thực hiện', sla: '1 giờ' },
      { stepNumber: 2, title: 'Xem xét & Phê duyệt', description: 'Quản lý trực tiếp kiểm tra và phê duyệt yêu cầu', role: 'Quản lý bộ phận', sla: '1 ngày' },
      { stepNumber: 3, title: 'Ghi nhận & Hoàn tất', description: 'HCNS/Kế toán đối soát dữ liệu và lưu trữ kết quả', role: 'Bộ phận chuyên trách', sla: '4 giờ' }
    ];
  };

  const getDocumentContent = (doc: DocumentItem) => {
    if (doc.content) return doc.content;

    if (doc.docType === 'FORM') {
      if (doc.docCode.includes('HR-FORM-01')) {
        return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nĐƠN XIN NGHỈ PHÉP\n\nKính gửi: Ban Giám hiệu Trường MIS\n          Trưởng bộ phận Hành chính - Nhân sự\n\nTên tôi là: ........................................................\nMã nhân viên: ...................................................\nChức vụ/Bộ phận: .............................................\nXin được nghỉ phép từ ngày: .../.../2026 đến ngày: .../.../2026\nTổng số ngày nghỉ: ........... ngày.\nLý do xin nghỉ: ...................................................\n.......................................................................\nCam kết bàn giao công việc cho ông/bà: ...................\nÝ kiến Tổ trưởng:             Người làm đơn (ký, ghi rõ họ tên)`;
      }
      if (doc.docCode.includes('HR-FORM-02')) {
        return `BIÊN BẢN BÀN GIAO CÔNG VIỆC VÀ TÀI SẢN\n\nHôm nay, ngày .../.../2026, chúng tôi gồm có:\n1. Người bàn giao (Bên A): ................................. Chức vụ: .............\n2. Người nhận bàn giao (Bên B): ......................... Chức vụ: .............\n\nHai bên tiến hành bàn giao các nội dung sau:\nI. CÔNG VIỆC CHUYÊN MÔN:\n1. ........................................................................................\n2. ........................................................................................\n\nII. TÀI SẢN & THIẾT BỊ BÀN GIAO:\n1. Laptop thương hiệu: ............. S/N: ............. Tình trạng: ...........\n2. Chìa khóa phòng làm việc số: ........ Thẻ nhân viên số: ..............\n3. Hồ sơ, sổ sách nghiệp vụ gồm: ............................................\n\nBiên bản được lập thành 03 bản có giá trị pháp lý như nhau.`;
      }
      if (doc.docCode.includes('IC-FORM-01')) {
        return `PHIẾU GHI NHẬN ĐIỂM KHÔNG PHÙ HỢP (NC)\nMã số phiếu: NC-2026-.............\n\n1. Bộ phận được đánh giá: ....................................................\n2. Đánh giá viên: ...................................................................\n3. Ngày đánh giá: .../.../2026\n\n4. MÔ TẢ ĐIỂM KHÔNG PHÙ HỢP (NC):\n............................................................................................\n............................................................................................\nPhân loại lỗi NC: [ ] Nặng (Major)     [ ] Nhẹ (Minor)     [ ] Khuyến nghị\nĐối chiếu điều khoản quy trình số: ...........................................\n\n6. Ý KIẾN CỦA BỘ PHẬN ĐƯỢC ĐÁNH GIÁ:\n............................................................................................\n\nXác nhận của Đánh giá viên          Đại diện Bộ phận được đánh giá`;
      }
    }
    
    if (doc.docType === 'CHECKLIST') {
      return `DANH SÁCH KIỂM TRA (CHECKLIST) ĐÁNH GIÁ NỘI BỘ\nPhạm vi: Phòng Hành chính - Nhân sự\n\n[ ] 1. Hồ sơ tuyển dụng mới có đầy đủ Sơ yếu lý lịch, Bằng cấp công chứng?\n[ ] 2. Hợp đồng lao động của toàn bộ nhân viên còn hiệu lực?\n[ ] 3. Bảng chấm công hàng tháng có đầy đủ chữ ký phê duyệt của BGH?\n[ ] 4. Kế hoạch đào tạo nội bộ năm học có được triển khai đúng tiến độ?\n[ ] 5. Hồ sơ đánh giá thử việc của nhân sự mới có biên bản kèm theo?\n[ ] 6. Các quyết định bổ nhiệm, điều chuyển nhân sự được lưu trữ khoa học?\n[ ] 7. Đã hoàn thành khai báo bảo hiểm xã hội tăng giảm trong tháng?`;
    }

    return `Tài liệu hướng dẫn nghiệp vụ chi tiết:\n- Tên tài liệu: ${doc.title}\n- Mã tài liệu: ${doc.docCode}\n- Phiên bản hiện hành: v${doc.version}\n- Phòng ban chủ quản: ${doc.departmentOwner}\n\nVui lòng liên hệ phòng ban sở hữu hoặc người phụ trách (${doc.ownerId}) để nhận bản in chính thức hoặc file thiết kế gốc nếu cần chỉnh sửa.`;
  };

  const steps = getSopSteps(document);
  const contentText = getDocumentContent(document);

  return (
    <div className="fixed inset-0 z-50 flex justify-end text-slate-800 dark:text-slate-200">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                {document.docCode}
              </span>
              <span className="text-xs text-slate-500 font-semibold font-mono">v{document.version}</span>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
              {document.title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Metadata Section */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Nhóm nghiệp vụ</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{document.category}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Phòng ban sở hữu</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{document.departmentOwner}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Người phụ trách</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{document.ownerId}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Trạng thái</span>
              <span className="mt-0.5 block">
                {document.status === 'ACTIVE' && <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-md">HIỆU LỰC</span>}
                {document.status === 'DRAFT' && <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md">NHÁP</span>}
                {document.status === 'PENDING_APPROVAL' && <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 rounded-md">CHỜ DUYỆT</span>}
                {document.status === 'NEEDS_REVIEW' && <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 rounded-md">CẦN RÀ SOÁT</span>}
                {document.status === 'EXPIRED' && <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 rounded-md">HẾT HẠN</span>}
                {document.status === 'ARCHIVED' && <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 rounded-md">LƯU TRỮ</span>}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Mức độ quan trọng</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{document.priority}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Ngày hiệu lực</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {document.effectiveDate ? new Date(document.effectiveDate).toLocaleDateString('vi-VN') : '---'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-slate-400 block mb-1">Đối tượng sử dụng</span>
              <div className="flex flex-wrap gap-1.5">
                {document.targetAudience.map(aud => (
                  <span key={aud} className="px-2 py-0.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 font-medium">
                    {aud}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SOP Specific: Purpose & Scope */}
          {document.docType === 'SOP' && (
            <div className="space-y-4">
              {document.purpose && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mục đích</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-indigo-50/30 dark:bg-indigo-950/20 border-l-2 border-indigo-500 p-3 rounded-r-lg">
                    {document.purpose}
                  </p>
                </div>
              )}

              {document.scope && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phạm vi áp dụng</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 border-l-2 border-slate-400 p-3 rounded-r-lg">
                    {document.scope}
                  </p>
                </div>
              )}

              {/* Steps timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Các bước thực hiện quy trình</h4>
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 ml-3 space-y-5 py-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-[9px] text-indigo-500">
                        {step.stepNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{step.title}</h5>
                          {step.sla && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium">SLA: {step.sla}</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.description}</p>
                        <div className="text-[10px] text-indigo-500 mt-1 font-semibold">Vai trò chịu trách nhiệm: {step.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Content Box */}
          {document.docType !== 'SOP' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nội dung văn bản / Biểu mẫu</h4>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {contentText}
              </div>
            </div>
          )}

          {/* Related Modules & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Module liên kết hệ thống</span>
              <div className="flex flex-wrap gap-1">
                {document.relatedModules.length > 0 ? document.relatedModules.map(mod => (
                  <span key={mod} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">
                    <LinkIcon className="w-3 h-3" /> {mod}
                  </span>
                )) : <span className="text-xs text-slate-400 font-medium">---</span>}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Thẻ / Phân loại</span>
              <div className="flex flex-wrap gap-1">
                {document.tags.length > 0 ? document.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                    #{t}
                  </span>
                )) : <span className="text-xs text-slate-400 font-medium">---</span>}
              </div>
            </div>
          </div>

          {/* Mock Document History / Timeline */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lịch sử tài liệu</h4>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Khởi tạo tài liệu bởi Admin</span>
                <span className="font-mono">01/01/2024 08:30</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Được phê duyệt bởi Ban Giám hiệu</span>
                <span className="font-mono">01/01/2024 14:15</span>
              </div>
              {document.status === 'ACTIVE' && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ban hành chính thức (Phiên bản v{document.version})</span>
                  <span className="font-mono">{document.effectiveDate ? new Date(document.effectiveDate).toLocaleDateString('vi-VN') : '01/01/2024'}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}

export default function KnowledgeManagement() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ALL' | 'SOP' | 'FORM' | 'REVIEW' | 'ARCHIVED'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      sop: documents.filter(d => d.docType === 'SOP').length,
      form: documents.filter(d => d.docType === 'FORM' || d.docType === 'CHECKLIST').length,
      active: documents.filter(d => d.status === 'ACTIVE').length,
      needsReview: documents.filter(d => d.status === 'NEEDS_REVIEW').length,
      draft: documents.filter(d => d.status === 'DRAFT' || d.status === 'PENDING_APPROVAL').length,
    };
  }, [documents]);

  // Filtered Data
  const filteredDocs = useMemo(() => {
    let result = documents;
    
    // Tab Filter
    if (activeTab === 'SOP') result = result.filter(d => d.docType === 'SOP');
    if (activeTab === 'FORM') result = result.filter(d => d.docType === 'FORM' || d.docType === 'CHECKLIST');
    if (activeTab === 'REVIEW') result = result.filter(d => d.status === 'NEEDS_REVIEW');
    if (activeTab === 'ARCHIVED') result = result.filter(d => d.status === 'ARCHIVED' || d.status === 'EXPIRED');

    // Category Filter
    if (filterCategory !== 'ALL') {
      result = result.filter(d => d.category === filterCategory);
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.docCode.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [documents, activeTab, filterCategory, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-md">HIỆU LỰC</span>;
      case 'DRAFT': return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md">NHÁP</span>;
      case 'PENDING_APPROVAL': return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 rounded-md">CHỜ DUYỆT</span>;
      case 'NEEDS_REVIEW': return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 rounded-md">CẦN RÀ SOÁT</span>;
      case 'EXPIRED': return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 rounded-md">HẾT HẠN</span>;
      case 'ARCHIVED': return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 rounded-md">LƯU TRỮ</span>;
      default: return null;
    }
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case 'SOP': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'FORM': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'CHECKLIST': return <CheckCircle2 className="w-4 h-4 text-sky-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const categories = Array.from(new Set(documents.map(d => d.category)));

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 w-full overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Kho Quy trình & Tri thức
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quản lý tập trung Văn bản, Biểu mẫu, SOP và Tài liệu tham khảo</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu, mã..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo tài liệu</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 px-6 pt-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-6 min-w-max">
          {[
            { id: 'OVERVIEW', label: 'Tổng quan', icon: Layers },
            { id: 'ALL', label: 'Tất cả tài liệu', icon: BookMarked },
            { id: 'SOP', label: 'Quy trình / SOP', icon: BookOpen },
            { id: 'FORM', label: 'Biểu mẫu & Checklist', icon: FileText },
            { id: 'REVIEW', label: 'Cần rà soát', icon: AlertTriangle },
            { id: 'ARCHIVED', label: 'Lưu trữ', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'REVIEW' && stats.needsReview > 0 && (
                <span className="ml-1 bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.needsReview}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-lg">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Tổng tài liệu</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.total}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md font-medium">+2 tháng này</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Quy trình (SOP)</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.sop}</span>
                  <span className="text-xs text-slate-500 font-medium">Đang hiệu lực</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Biểu mẫu</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.form}</span>
                  <span className="text-xs text-slate-500 font-medium">Form & Checklist</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Cần rà soát</h3>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.needsReview}</span>
                  <button onClick={() => setActiveTab('REVIEW')} className="text-xs text-rose-600 hover:text-rose-700 font-medium underline">Xem danh sách</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Mới cập nhật gần đây</h3>
                <div className="space-y-3">
                  {documents.slice(0, 5).map(doc => (
                    <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getDocTypeIcon(doc.docType)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{doc.docCode}</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doc.title}</span>
                            {getStatusBadge(doc.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {doc.category}</span>
                            <span className="flex items-center gap-1"><UserCircle className="w-3 h-3" /> {doc.ownerId}</span>
                            <span>v{doc.version}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Theo Nhóm nghiệp vụ</h3>
                <div className="space-y-4">
                  {categories.map(cat => {
                    const count = documents.filter(d => d.category === cat).length;
                    const percent = Math.round((count / stats.total) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                          <span className="text-slate-500">{count} tài liệu</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST TABS (ALL, SOP, FORM, REVIEW, ARCHIVED) */}
        {activeTab !== 'OVERVIEW' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-7xl mx-auto flex flex-col min-h-[500px]">
            {/* List Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Nhóm:</span>
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="text-sm text-slate-500 ml-auto">
                Hiển thị {filteredDocs.length} tài liệu
              </div>
            </div>

            {/* List Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Mã TL</th>
                    <th className="px-4 py-3">Tên tài liệu & Loại</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3">Phiên bản</th>
                    <th className="px-4 py-3">Ngày ban hành</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                    <tr key={doc.id} onClick={() => setSelectedDoc(doc)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        {doc.docCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getDocTypeIcon(doc.docType)}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {doc.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">#{t}</span>
                          ))}
                          {doc.relatedModules.length > 0 && (
                            <span className="text-[10px] text-indigo-500 flex items-center gap-0.5" title={doc.relatedModules.join(', ')}>
                              <LinkIcon className="w-3 h-3" /> {doc.relatedModules.length} module
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 dark:text-slate-300">{doc.departmentOwner}</div>
                        <div className="text-[10px] text-slate-500">{doc.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold font-mono">v{doc.version}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-medium">Không tìm thấy tài liệu nào</p>
                        <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE DOCUMENT DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-200">
            <CreateDocumentForm 
              onClose={() => setIsDrawerOpen(false)}
              onSubmitSuccess={(data) => {
                const newDoc: DocumentItem = {
                  ...data,
                  id: `doc-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: 'current_user',
                  timeline: []
                } as DocumentItem;
                setDocuments([newDoc, ...documents]);
                setIsDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* DOCUMENT DETAIL DRAWER */}
      {selectedDoc && (
        <DocumentDetailDrawer 
          document={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}
