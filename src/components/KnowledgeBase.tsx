import React, { useState, useMemo } from 'react';
import {
  BookOpen, Search, Tag, ChevronRight, Clock, User,
  Star, Eye, Filter, FolderOpen, Home, ArrowLeft, FileText, Hash
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryId = 'sop' | 'huong-dan' | 'quy-trinh' | 'faq' | 'chinh-sach';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface Article {
  id: string;
  categoryId: CategoryId;
  title: string;
  summary: string;
  content: string[];
  tags: string[];
  author: string;
  department: string;
  date: string;
  views: number;
  starred: boolean;
  readingTime: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'sop', label: 'SOP', icon: <FileText className="w-3.5 h-3.5" />, count: 5, color: 'indigo' },
  { id: 'huong-dan', label: 'Hướng dẫn', icon: <BookOpen className="w-3.5 h-3.5" />, count: 4, color: 'emerald' },
  { id: 'quy-trinh', label: 'Quy trình', icon: <FolderOpen className="w-3.5 h-3.5" />, count: 6, color: 'violet' },
  { id: 'faq', label: 'FAQ', icon: <Hash className="w-3.5 h-3.5" />, count: 8, color: 'amber' },
  { id: 'chinh-sach', label: 'Chính sách', icon: <Star className="w-3.5 h-3.5" />, count: 3, color: 'rose' },
];

const ALL_ARTICLES: Article[] = [
  // SOP
  {
    id: 'sop-001',
    categoryId: 'sop',
    title: 'SOP-001: Quy trình tiếp nhận học sinh mới đầu năm học',
    summary: 'Hướng dẫn toàn bộ quy trình tiếp nhận, phân lớp và xử lý hồ sơ học sinh nhập học mới.',
    content: [
      'Quy trình tiếp nhận học sinh mới được thực hiện từ tuần đầu tiên của tháng 8 hàng năm. Ban Tuyển sinh phối hợp cùng Phòng Đào tạo để chuẩn bị danh sách phân lớp sơ bộ trước ngày 15/8.',
      'Bước 1: Thu thập và kiểm tra hồ sơ nhập học. Phụ huynh nộp đầy đủ các giấy tờ bao gồm: học bạ THCS có xác nhận, giấy khai sinh bản sao công chứng, ảnh thẻ 3x4 (4 ảnh) và phiếu đăng ký nhập học theo mẫu. Cán bộ tuyển sinh kiểm tra tính hợp lệ trong vòng 24 giờ.',
      'Bước 2: Phân lớp và thông báo kết quả. Sau khi hồ sơ được duyệt, Phòng Đào tạo tiến hành phân lớp dựa trên nguyện vọng, điểm thi và năng lực. Kết quả phân lớp được thông báo qua email và hệ thống School OS chậm nhất ngày 25/8.',
      'Bước 3: Họp phụ huynh đầu năm và ký cam kết. Lịch họp phụ huynh được tổ chức theo khối trong tuần đầu tháng 9. Biên bản họp và cam kết nội quy phải được lưu vào hệ thống trong vòng 3 ngày làm việc sau khi họp.',
      'Lưu ý quan trọng: Mọi thắc mắc về phân lớp phải được phản hồi trong vòng 48 giờ làm việc. Trường hợp đặc biệt (học sinh chuyển trường, gia đình khó khăn) cần trình BGH phê duyệt riêng trước khi xử lý.',
    ],
    tags: ['tuyển sinh', 'nhập học', 'hồ sơ', 'phân lớp'],
    author: 'Phòng Tuyển sinh',
    department: 'Phòng Đào tạo',
    date: '2026-05-10',
    views: 342,
    starred: true,
    readingTime: 5,
  },
  {
    id: 'sop-002',
    categoryId: 'sop',
    title: 'SOP-002: Quy trình nghỉ phép và xin phép vắng của giáo viên',
    summary: 'Quy định về thủ tục xin nghỉ phép, vắng mặt và bàn giao công việc của cán bộ giáo viên.',
    content: [
      'Mọi trường hợp nghỉ phép của giáo viên đều phải được thông báo và phê duyệt trước ít nhất 3 ngày làm việc (trừ trường hợp khẩn cấp về sức khỏe). Đơn xin phép được nộp qua hệ thống School OS hoặc bản giấy nộp cho Tổ trưởng chuyên môn.',
      'Thủ tục xin phép ngắn hạn (dưới 3 ngày): Giáo viên điền phiếu xin phép trực tuyến trên portal, Tổ trưởng phê duyệt trong 24 giờ, Phó Hiệu trưởng phụ trách đào tạo ký xác nhận. Giáo viên phải bố trí người dạy thay hoặc giao bài tự học cho học sinh.',
      'Thủ tục xin phép dài hạn (từ 3 ngày trở lên): Ngoài quy trình trên, cần bổ sung kế hoạch bàn giao công việc chi tiết, danh sách các lớp dạy và giáo viên dạy thay. Hiệu trưởng phê duyệt trực tiếp với nghỉ từ 5 ngày trở lên.',
      'Nghỉ phép đột xuất (ốm đau, tai nạn): Thông báo qua điện thoại cho Tổ trưởng trước 6:30 sáng. Nộp giấy xác nhận của cơ sở y tế sau khi đi làm lại trong vòng 2 ngày. Quá 2 ngày không có giấy tờ sẽ bị xem là nghỉ không phép.',
      'Chính sách phép năm: Mỗi giáo viên được 12 ngày phép/năm. Phép không sử dụng hết không được chuyển sang năm sau. Nghỉ vượt quá số ngày phép sẽ trừ vào lương theo quy chế tài chính hiện hành.',
    ],
    tags: ['nghỉ phép', 'nhân sự', 'giáo viên', 'quy trình'],
    author: 'Phòng Hành chính',
    department: 'Phòng Nhân sự',
    date: '2026-04-20',
    views: 218,
    starred: false,
    readingTime: 4,
  },
  {
    id: 'sop-003',
    categoryId: 'sop',
    title: 'SOP-003: Quy trình mua sắm và thanh toán tài chính',
    summary: 'Hướng dẫn quy trình đề xuất mua sắm, phê duyệt ngân sách và thanh toán cho nhà cung cấp.',
    content: [
      'Mọi nhu cầu mua sắm trang thiết bị, vật tư phải được lập phiếu đề xuất trước khi triển khai. Phiếu đề xuất ghi rõ: tên hàng hóa/dịch vụ, số lượng, đơn giá dự kiến, mục đích sử dụng và bộ phận đề nghị. Phiếu được nộp trên hệ thống School OS mục "Quản lý mua sắm".',
      'Phân cấp phê duyệt: Dưới 5 triệu đồng — Trưởng bộ phận phê duyệt. Từ 5–20 triệu đồng — Phó Hiệu trưởng phụ trách hành chính. Từ 20–100 triệu đồng — Hiệu trưởng. Trên 100 triệu đồng — Hội đồng quản trị phê duyệt, kèm báo giá từ ít nhất 3 nhà cung cấp.',
      'Thời gian xử lý hồ sơ mua sắm: Phê duyệt nội bộ tối đa 5 ngày làm việc. Phòng Kế toán xuất đề nghị thanh toán trong 3 ngày sau khi có hàng/dịch vụ và chứng từ đầy đủ. Thanh toán chuyển khoản thực hiện vào thứ 2 và thứ 5 hàng tuần.',
      'Hồ sơ thanh toán gồm: Hóa đơn VAT hợp lệ, biên bản bàn giao hàng hóa/nghiệm thu dịch vụ, phiếu đề xuất được phê duyệt. Thiếu bất kỳ chứng từ nào sẽ tạm hoãn thanh toán cho đến khi bổ sung đầy đủ.',
      'Nghiêm cấm ký hợp đồng hoặc đặt cọc khi chưa có phê duyệt. Cá nhân vi phạm sẽ chịu trách nhiệm cá nhân về toàn bộ khoản chi phát sinh ngoài quy trình.',
    ],
    tags: ['tài chính', 'mua sắm', 'thanh toán', 'ngân sách'],
    author: 'Phòng Kế toán',
    department: 'Phòng Tài chính',
    date: '2026-03-15',
    views: 187,
    starred: true,
    readingTime: 5,
  },
  {
    id: 'sop-004',
    categoryId: 'sop',
    title: 'SOP-004: Xử lý sự cố kỹ thuật hệ thống CNTT',
    summary: 'Quy trình báo cáo, xử lý và leo thang sự cố kỹ thuật đối với hạ tầng CNTT của trường.',
    content: [
      'Khi phát hiện sự cố kỹ thuật (mạng, phần mềm, thiết bị), người dùng cần lập tức báo cáo qua hệ thống Helpdesk tại địa chỉ it-support@truong.edu.vn hoặc gọi hotline nội bộ số máy lẻ 100. Không tự ý sửa chữa, cài đặt lại hay xử lý thiết bị khi chưa có sự đồng ý của CNTT.',
      'Phân loại sự cố: P1 (Khẩn cấp) — ảnh hưởng toàn trường (mất mạng, server down), xử lý trong 2 giờ. P2 (Cao) — ảnh hưởng nhiều phòng ban, xử lý trong 4 giờ làm việc. P3 (Trung bình) — lỗi cá nhân, xử lý trong 1 ngày làm việc. P4 (Thấp) — yêu cầu nâng cấp, xử lý theo lịch.',
      'Quy trình xử lý: Tiếp nhận → Xác nhận và phân loại ưu tiên → Kỹ thuật viên được phân công → Xử lý → Kiểm tra kết quả → Đóng ticket. Mỗi bước đều được ghi log trên hệ thống Helpdesk để theo dõi SLA.',
      'Leo thang sự cố: Nếu quá thời gian xử lý theo cam kết, ticket tự động leo thang lên Trưởng phòng CNTT. Sự cố P1 kéo dài quá 4 giờ cần thông báo ngay cho BGH. Báo cáo sự cố hàng tuần được gửi cho Phó Hiệu trưởng vào thứ 6.',
    ],
    tags: ['CNTT', 'sự cố', 'helpdesk', 'kỹ thuật'],
    author: 'Phòng CNTT',
    department: 'Phòng Công nghệ',
    date: '2026-02-28',
    views: 156,
    starred: false,
    readingTime: 4,
  },
  {
    id: 'sop-005',
    categoryId: 'sop',
    title: 'SOP-005: Quy trình tổ chức thi học kỳ và phúc khảo',
    summary: 'Hướng dẫn tổ chức thi, coi thi, chấm thi và xử lý phúc khảo điểm thi học kỳ.',
    content: [
      'Lịch thi học kỳ được Phòng Đào tạo công bố trước ít nhất 3 tuần. Danh sách phòng thi, số báo danh được đăng trên hệ thống và bảng tin trường trước ngày thi 5 ngày làm việc.',
      'Phân công coi thi: Mỗi phòng thi 2 giám thị, không phân công giám thị coi thi lớp mình giảng dạy. Giám thị phụ trách môn nào phải bàn giao đề thi cho Phòng Đào tạo trước 3 ngày và nhận lại đề đã niêm phong trước giờ thi 30 phút.',
      'Quy trình chấm thi: Bài thi được rọc phách trước khi chấm. Mỗi bài thi có 2 giáo viên chấm độc lập. Điểm chênh lệch dưới 0.5 điểm: lấy điểm trung bình. Chênh lệch từ 0.5 điểm trở lên: chấm lần 3 với giáo viên thứ 3.',
      'Phúc khảo: Học sinh/phụ huynh có quyền nộp đơn phúc khảo trong vòng 7 ngày sau khi công bố điểm. Lệ phí phúc khảo: 20.000 đồng/bài. Kết quả phúc khảo là quyết định cuối cùng. Hoàn lệ phí nếu điểm có thay đổi.',
    ],
    tags: ['thi cử', 'học kỳ', 'chấm thi', 'phúc khảo'],
    author: 'Phòng Đào tạo',
    department: 'Phòng Đào tạo',
    date: '2026-01-10',
    views: 299,
    starred: true,
    readingTime: 5,
  },

  // Hướng dẫn
  {
    id: 'hd-001',
    categoryId: 'huong-dan',
    title: 'Hướng dẫn sử dụng hệ thống School OS dành cho giáo viên',
    summary: 'Cẩm nang sử dụng đầy đủ các tính năng của School OS: quản lý lớp, điểm, thời khóa biểu.',
    content: [
      'School OS là hệ thống quản lý trường học tích hợp, được triển khai từ năm học 2025-2026. Hệ thống bao gồm các module: Quản lý lớp học, Quản lý điểm số, Thời khóa biểu, Liên lạc phụ huynh và Báo cáo đào tạo. Giáo viên đăng nhập bằng email trường có đuôi @truong.edu.vn.',
      'Quản lý điểm số: Vào menu "Điểm số" → Chọn lớp và môn học → Nhập điểm theo từng cột (miệng, 15 phút, 1 tiết, học kỳ). Hệ thống tự động tính điểm trung bình theo hệ số. Điểm được lưu tự động, cần "Gửi duyệt" để gửi cho tổ trưởng xác nhận.',
      'Thời khóa biểu: Giáo viên xem lịch dạy cá nhân tại mục "Lịch dạy". Khi có thay đổi thời khóa biểu, hệ thống tự gửi thông báo qua email và mobile. Báo cáo vắng mặt học sinh được nhập trong vòng 15 phút đầu tiết học.',
      'Liên lạc phụ huynh: Sử dụng tính năng "Nhắn tin" để gửi thông báo cá nhân. Tính năng "Thông báo lớp" để gửi đến toàn bộ phụ huynh một lớp. Lịch sử tin nhắn được lưu 2 năm. Không sử dụng số điện thoại cá nhân để liên lạc công việc trường.',
    ],
    tags: ['school os', 'hướng dẫn', 'phần mềm', 'giáo viên'],
    author: 'Phòng CNTT',
    department: 'Phòng Công nghệ',
    date: '2026-05-01',
    views: 521,
    starred: true,
    readingTime: 6,
  },
  {
    id: 'hd-002',
    categoryId: 'huong-dan',
    title: 'Hướng dẫn soạn giáo án theo chuẩn mới 2026',
    summary: 'Mẫu và hướng dẫn chi tiết soạn giáo án theo Chương trình GDPT 2018 cập nhật 2026.',
    content: [
      'Giáo án theo chuẩn 2026 phải đáp ứng các yêu cầu của Chương trình GDPT 2018, tập trung vào phát triển năng lực và phẩm chất học sinh thay vì truyền đạt kiến thức thuần túy. Mỗi bài học cần xác định rõ mục tiêu theo 3 chiều: Kiến thức, Kỹ năng và Thái độ/Phẩm chất.',
      'Cấu trúc giáo án chuẩn gồm: (1) Mục tiêu bài học - phân tích theo năng lực cốt lõi. (2) Thiết bị và học liệu - liệt kê đầy đủ. (3) Tiến trình dạy học - chia thành các hoạt động (Khởi động/Hình thành kiến thức/Luyện tập/Vận dụng). (4) Phụ lục - phiếu học tập, rubric đánh giá.',
      'Yêu cầu hoạt động khởi động: Tối thiểu 5 phút, sử dụng tình huống thực tế hoặc câu hỏi kích thích tư duy. Không dùng phương pháp "ôn bài cũ" thuần túy. Hoạt động khởi động phải tạo được hứng thú và liên kết với bài mới.',
      'Rubric đánh giá là bắt buộc từ năm học 2026-2027. Giáo viên phải xây dựng rubric cho ít nhất 60% số bài học trong học kỳ. Rubric cần có ít nhất 3 mức độ đánh giá: Đạt, Khá, Xuất sắc với tiêu chí cụ thể cho từng mức.',
    ],
    tags: ['giáo án', 'chuẩn mới', 'GDPT 2018', 'soạn giảng'],
    author: 'Phòng Đào tạo',
    department: 'Phòng Đào tạo',
    date: '2026-04-05',
    views: 387,
    starred: true,
    readingTime: 5,
  },
  {
    id: 'hd-003',
    categoryId: 'huong-dan',
    title: 'Hướng dẫn đặt phòng họp và thiết bị AV',
    summary: 'Cách đặt lịch phòng họp, yêu cầu hỗ trợ thiết bị âm thanh-hình ảnh cho cuộc họp và sự kiện.',
    content: [
      'Trường có 4 phòng họp chính: Phòng A201 (30 người), B105 (20 người), C301 (50 người - hội trường nhỏ) và Phòng BGH (10 người, ưu tiên BGH). Đặt phòng qua hệ thống School OS mục "Đặt phòng họp" tối thiểu 2 giờ trước giờ sử dụng.',
      'Thiết bị AV chuẩn: Mỗi phòng họp được trang bị màn hình 75", webcam, loa và mic không dây. Để sử dụng máy chiếu hoặc thiết bị bổ sung, điền yêu cầu trong form đặt phòng mục "Yêu cầu thiết bị". Phòng CNTT hỗ trợ setup trước 30 phút.',
      'Quy tắc sử dụng phòng họp: Kết thúc họp phải dọn dẹp sạch sẽ, tắt thiết bị và điều hòa. Không để thức ăn qua đêm trong phòng. Báo cáo ngay nếu phát hiện hỏng hóc thiết bị. Đặt phòng mà không sử dụng 3 lần liên tiếp sẽ bị hạn chế quyền đặt lịch.',
    ],
    tags: ['phòng họp', 'đặt lịch', 'thiết bị', 'AV'],
    author: 'Phòng Hành chính',
    department: 'Phòng Hành chính',
    date: '2026-03-22',
    views: 145,
    starred: false,
    readingTime: 3,
  },
  {
    id: 'hd-004',
    categoryId: 'huong-dan',
    title: 'Hướng dẫn nộp báo cáo tháng cho BGH',
    summary: 'Mẫu và thời hạn nộp báo cáo định kỳ hàng tháng của các tổ chuyên môn và phòng ban.',
    content: [
      'Báo cáo tháng là công cụ quan trọng để BGH nắm bắt tiến độ công việc toàn trường. Tất cả tổ chuyên môn và phòng ban phải nộp báo cáo tháng trước ngày 25 mỗi tháng. Báo cáo nộp muộn sẽ được ghi nhận trong hồ sơ thi đua của đơn vị.',
      'Cấu trúc báo cáo tháng: (1) Tóm tắt các hoạt động đã thực hiện trong tháng. (2) Kết quả đạt được so với kế hoạch (%). (3) Các vấn đề tồn đọng và khó khăn. (4) Đề xuất giải pháp và kiến nghị. (5) Kế hoạch tháng tiếp theo. Độ dài tối đa 2 trang A4.',
      'Nộp qua hệ thống: Đăng nhập School OS → Mục "Báo cáo" → "Nộp báo cáo tháng" → Chọn tháng → Upload file Word/PDF → Điền tóm tắt ngắn (dưới 200 từ) → Gửi. Hệ thống tự gửi email xác nhận sau khi nộp thành công.',
      'Báo cáo quý và năm có mẫu riêng với yêu cầu chi tiết hơn. Phòng Đào tạo sẽ tổng hợp và gửi mẫu báo cáo quý trước ngày 15 của tháng cuối quý. BGH họp review báo cáo vào tuần đầu tiên của tháng kế tiếp.',
    ],
    tags: ['báo cáo', 'BGH', 'định kỳ', 'hàng tháng'],
    author: 'Văn phòng BGH',
    department: 'Ban Giám hiệu',
    date: '2026-02-10',
    views: 234,
    starred: false,
    readingTime: 4,
  },

  // Quy trình
  {
    id: 'qt-001',
    categoryId: 'quy-trinh',
    title: 'Quy trình xử lý kỷ luật học sinh vi phạm nội quy',
    summary: 'Quy trình 4 bước xử lý học sinh vi phạm từ cảnh báo đến hội đồng kỷ luật.',
    content: [
      'Việc xử lý kỷ luật học sinh phải đảm bảo tính giáo dục, nhân văn và đúng quy định pháp luật. Giáo viên và cán bộ nhà trường không được xử phạt theo hình thức thể xác hoặc xúc phạm danh dự học sinh. Mọi vi phạm phải được ghi nhận vào sổ theo dõi hành vi học sinh.',
      'Bước 1 - Nhắc nhở và cảnh báo: Giáo viên chủ nhiệm gặp riêng học sinh vi phạm, giải thích nội quy, yêu cầu cam kết sửa chữa. Ghi vào sổ liên lạc và thông báo phụ huynh nếu vi phạm lần đầu nghiêm trọng.',
      'Bước 2 - Xử lý cấp tổ/lớp: Vi phạm lần 2 hoặc nghiêm trọng hơn: Tổ trưởng và GVCN họp với học sinh và phụ huynh. Biên bản họp được lưu hồ sơ. Học sinh phải viết bản kiểm điểm có chữ ký phụ huynh.',
      'Bước 3 - Xử lý cấp trường: Vi phạm tiếp tục hoặc vi phạm đặc biệt nghiêm trọng: Phó Hiệu trưởng phụ trách học sinh điều hành hội đồng xử lý. Các hình thức: khiển trách, cảnh cáo, đình chỉ học tập có thời hạn (tối đa 1 tuần).',
      'Bước 4 - Hội đồng kỷ luật: Vi phạm đặc biệt nghiêm trọng (bạo lực, ma túy, gian lận thi cử): Hiệu trưởng triệu tập Hội đồng kỷ luật trong vòng 5 ngày làm việc. Hội đồng có quyền đề nghị buộc thôi học có thời hạn (tối đa 1 năm). Quyết định gửi Sở GD&ĐT.',
    ],
    tags: ['kỷ luật', 'học sinh', 'nội quy', 'xử lý'],
    author: 'Phòng Công tác HS',
    department: 'Phòng Công tác học sinh',
    date: '2026-05-20',
    views: 198,
    starred: false,
    readingTime: 5,
  },
  {
    id: 'qt-002',
    categoryId: 'quy-trinh',
    title: 'Quy trình tuyển dụng và onboarding giáo viên mới',
    summary: 'Từ đăng tuyển đến kết thúc thời gian thử việc: quy trình tuyển dụng giáo viên chuẩn của trường.',
    content: [
      'Nhu cầu tuyển dụng giáo viên phải được Tổ trưởng đề xuất và BGH phê duyệt trước khi đăng tuyển. Thông báo tuyển dụng đăng trên website trường, các trang tuyển dụng giáo dục và mạng xã hội trường. Thời hạn nhận hồ sơ tối thiểu 2 tuần.',
      'Quy trình sơ tuyển: Phòng Nhân sự sàng lọc hồ sơ theo tiêu chí cơ bản (bằng cấp, chứng chỉ nghiệp vụ sư phạm, kinh nghiệm). Ứng viên đạt được mời dự buổi phỏng vấn sơ bộ 30 phút với Trưởng phòng Nhân sự.',
      'Phỏng vấn chuyên môn và dạy thử: Ứng viên vượt sơ tuyển phải dạy thử 1 tiết trước Hội đồng tuyển dụng gồm Hiệu trưởng, Phó Hiệu trưởng và Tổ trưởng chuyên môn. Tiêu chí đánh giá: Kiến thức chuyên môn (40%), Phương pháp giảng dạy (40%), Tác phong và giao tiếp (20%).',
      'Thời gian thử việc: 2 tháng với giáo viên có kinh nghiệm, 3 tháng với giáo viên mới ra trường. Trong thời gian thử việc, giáo viên được phân công mentor là tổ trưởng hoặc giáo viên kỳ cựu. Đánh giá cuối thử việc do Tổ trưởng và Phó Hiệu trưởng thực hiện.',
      'Onboarding: Tuần đầu tiên: làm quen hệ thống, gặp gỡ các phòng ban. Tháng đầu: dự giờ ít nhất 3 tiết của giáo viên kinh nghiệm. Tháng 2-3: giảng dạy chính thức có giám sát. Cuối thử việc: đánh giá tổng thể và quyết định tuyển dụng chính thức.',
    ],
    tags: ['tuyển dụng', 'onboarding', 'nhân sự', 'giáo viên mới'],
    author: 'Phòng Nhân sự',
    department: 'Phòng Nhân sự',
    date: '2026-04-12',
    views: 167,
    starred: true,
    readingTime: 6,
  },
  {
    id: 'qt-003',
    categoryId: 'quy-trinh',
    title: 'Quy trình lập và phê duyệt kế hoạch năm học',
    summary: 'Lịch trình, biểu mẫu và quy trình phê duyệt kế hoạch năm học của từng tổ và phòng ban.',
    content: [
      'Kế hoạch năm học là tài liệu định hướng toàn bộ hoạt động của đơn vị trong một năm học. Kế hoạch phải được xây dựng trên cơ sở chiến lược phát triển nhà trường, hướng dẫn của Sở GD&ĐT và tình hình thực tế đơn vị.',
      'Lịch xây dựng kế hoạch: Tháng 8 — BGH ban hành định hướng và chỉ tiêu năm học. Từ 1-15/8 — Các tổ/phòng xây dựng dự thảo kế hoạch đơn vị. Từ 16-25/8 — Họp review với Phó Hiệu trưởng phụ trách. Cuối tháng 8 — Phê duyệt và ban hành kế hoạch chính thức.',
      'Cấu trúc kế hoạch đơn vị: Đánh giá năm học trước (10%) → Mục tiêu và chỉ tiêu năm nay (20%) → Các hoạt động trọng tâm theo tháng (50%) → Nguồn lực và ngân sách dự kiến (10%) → Tiêu chí đánh giá hoàn thành (10%).',
      'Điều chỉnh kế hoạch: Có thể điều chỉnh kế hoạch khi có thay đổi lớn từ BGH hoặc Sở. Đề xuất điều chỉnh gửi Phó Hiệu trưởng phụ trách trước ngày 10 hàng tháng. Điều chỉnh ảnh hưởng đến ngân sách cần Hiệu trưởng phê duyệt.',
    ],
    tags: ['kế hoạch', 'năm học', 'phê duyệt', 'chiến lược'],
    author: 'Văn phòng BGH',
    department: 'Ban Giám hiệu',
    date: '2026-07-30',
    views: 289,
    starred: true,
    readingTime: 4,
  },

  // FAQ
  {
    id: 'faq-001',
    categoryId: 'faq',
    title: 'FAQ: Cách in phiếu điểm học kỳ cho học sinh',
    summary: 'Hướng dẫn nhanh cách xuất và in phiếu điểm học kỳ từ hệ thống School OS.',
    content: [
      'Để in phiếu điểm học kỳ: Đăng nhập School OS → Mục "Quản lý điểm" → "Xuất phiếu điểm" → Chọn lớp và học kỳ → Nhấn "Xuất PDF". File PDF sẽ được tải về máy tính của bạn.',
      'In hàng loạt: Chọn "Xuất tất cả" để tải file zip chứa phiếu điểm toàn lớp. Giải nén và in từng file hoặc gộp PDF. Khuyến nghị in 2 bản: 1 bản cho học sinh, 1 bản lưu hồ sơ trường.',
      'Lưu ý: Phiếu điểm chỉ hiển thị sau khi tất cả điểm trong học kỳ đã được Tổ trưởng duyệt. Nếu phiếu điểm chưa hiển thị, kiểm tra trạng thái duyệt điểm trong mục "Trạng thái điểm" hoặc liên hệ Phòng Đào tạo.',
    ],
    tags: ['phiếu điểm', 'in ấn', 'school os', 'học kỳ'],
    author: 'Phòng CNTT',
    department: 'Phòng Công nghệ',
    date: '2026-05-15',
    views: 412,
    starred: false,
    readingTime: 2,
  },
  {
    id: 'faq-002',
    categoryId: 'faq',
    title: 'FAQ: Cách đăng ký tham gia tập huấn chuyên môn',
    summary: 'Quy trình đăng ký các khóa tập huấn, bồi dưỡng chuyên môn trong và ngoài trường.',
    content: [
      'Tập huấn nội bộ: Thông báo tập huấn được gửi qua email và đăng trên bảng tin School OS. Để đăng ký, vào mục "Đào tạo & Bồi dưỡng" → "Đăng ký tập huấn" → Chọn khóa học → Nhấn "Đăng ký". Xác nhận đăng ký sẽ gửi qua email trong 24 giờ.',
      'Tập huấn bên ngoài (do Sở/Bộ tổ chức): Nhận thông báo từ Phòng Đào tạo → Trao đổi với Tổ trưởng về lịch dạy thay → Nộp đơn đề nghị cử đi tập huấn qua hệ thống → Phó Hiệu trưởng phê duyệt trong 2 ngày làm việc.',
      'Sau tập huấn: Bắt buộc nộp báo cáo tóm tắt nội dung và bản sao chứng chỉ/giấy xác nhận (nếu có) trong vòng 5 ngày làm việc sau khi kết thúc tập huấn. Báo cáo nộp vào mục "Báo cáo tập huấn" trên School OS. Đây là điều kiện để tính điểm thi đua.',
    ],
    tags: ['tập huấn', 'bồi dưỡng', 'đăng ký', 'chuyên môn'],
    author: 'Phòng Đào tạo',
    department: 'Phòng Đào tạo',
    date: '2026-03-08',
    views: 178,
    starred: false,
    readingTime: 3,
  },
  {
    id: 'faq-003',
    categoryId: 'faq',
    title: 'FAQ: Cách đổi mật khẩu và bảo mật tài khoản School OS',
    summary: 'Hướng dẫn đổi mật khẩu, bật xác thực 2 bước và xử lý khi quên mật khẩu.',
    content: [
      'Đổi mật khẩu: Đăng nhập → Góc phải trên → Avatar → "Cài đặt tài khoản" → "Bảo mật" → "Đổi mật khẩu". Mật khẩu mới phải: ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt. Đổi mật khẩu định kỳ 3 tháng/lần.',
      'Xác thực 2 bước (2FA): Vào "Cài đặt bảo mật" → Bật "Xác thực 2 bước" → Quét mã QR bằng ứng dụng Google Authenticator → Nhập mã xác nhận 6 số. Từ 01/09/2026, 2FA là bắt buộc với tất cả tài khoản giáo viên.',
      'Quên mật khẩu: Nhấn "Quên mật khẩu" ở trang đăng nhập → Nhập email trường → Nhận link reset qua email (hiệu lực 15 phút). Nếu không nhận được email sau 5 phút, kiểm tra thư mục Spam hoặc liên hệ CNTT qua hotline nội bộ 100.',
    ],
    tags: ['mật khẩu', 'bảo mật', 'tài khoản', '2FA'],
    author: 'Phòng CNTT',
    department: 'Phòng Công nghệ',
    date: '2026-04-25',
    views: 356,
    starred: false,
    readingTime: 3,
  },

  // Chính sách
  {
    id: 'cs-001',
    categoryId: 'chinh-sach',
    title: 'Chính sách khen thưởng và thi đua hàng năm',
    summary: 'Tiêu chí, hình thức khen thưởng và quy trình xét thi đua cho giáo viên và học sinh.',
    content: [
      'Hệ thống thi đua khen thưởng của trường được xây dựng nhằm ghi nhận và khích lệ những đóng góp xuất sắc của giáo viên, nhân viên và học sinh. Việc xét thi đua được thực hiện 2 lần/năm: cuối học kỳ 1 (tháng 1) và cuối năm học (tháng 6).',
      'Tiêu chí xét thi đua giáo viên: Hoàn thành kế hoạch dạy học (25%), Chất lượng giảng dạy qua kết quả học sinh (30%), Tham gia hoạt động ngoại khóa và tập huấn (20%), Tinh thần hợp tác và tác phong (25%). Điểm thi đua từ 85 trở lên được xét danh hiệu Chiến sĩ thi đua.',
      'Hình thức khen thưởng: Giấy khen cấp trường (điểm 85-90), Danh hiệu Chiến sĩ thi đua (90-95), Đề nghị khen thưởng cấp Sở (95 trở lên). Kèm theo là phần thưởng bằng tiền mặt tương ứng từ quỹ thi đua.',
      'Thi đua học sinh: Xét học sinh Giỏi (ĐTB ≥ 8.0, hạnh kiểm Tốt), học sinh Tiên tiến (ĐTB ≥ 6.5, hạnh kiểm Khá trở lên). Học sinh đoạt giải các kỳ thi cấp tỉnh trở lên được khen thưởng đặc biệt và thông báo toàn trường.',
    ],
    tags: ['thi đua', 'khen thưởng', 'tiêu chí', 'danh hiệu'],
    author: 'Văn phòng BGH',
    department: 'Ban Giám hiệu',
    date: '2026-01-05',
    views: 445,
    starred: true,
    readingTime: 4,
  },
  {
    id: 'cs-002',
    categoryId: 'chinh-sach',
    title: 'Chính sách bảo vệ dữ liệu cá nhân học sinh và phụ huynh',
    summary: 'Quy định về thu thập, lưu trữ và chia sẻ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.',
    content: [
      'Trường cam kết bảo vệ dữ liệu cá nhân của học sinh và phụ huynh theo đúng quy định của Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Mọi thông tin cá nhân chỉ được thu thập khi có sự đồng ý rõ ràng và được sử dụng đúng mục đích đã công bố.',
      'Dữ liệu được thu thập: Thông tin nhận dạng (họ tên, ngày sinh, CCCD/hộ chiếu), thông tin liên lạc (địa chỉ, SĐT, email), thông tin học tập (điểm số, hành kiểm, lịch sử học tập). Dữ liệu y tế học sinh chỉ lưu trữ tối thiểu và bảo mật theo cấp độ cao nhất.',
      'Quyền của chủ thể dữ liệu: Quyền truy cập và xem dữ liệu cá nhân của mình. Quyền yêu cầu chỉnh sửa thông tin sai. Quyền yêu cầu xóa dữ liệu sau khi kết thúc quan hệ với trường (sau 5 năm). Quyền phản đối việc xử lý dữ liệu cho mục đích marketing.',
      'Chia sẻ dữ liệu: Trường không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại. Chỉ chia sẻ với cơ quan nhà nước khi có yêu cầu pháp lý hoặc với đối tác giáo dục có ký kết thỏa thuận bảo mật. Mọi vi phạm báo cáo ngay cho DPO (Data Protection Officer) qua email dpo@truong.edu.vn.',
    ],
    tags: ['bảo vệ dữ liệu', 'PDPA', 'quyền riêng tư', 'học sinh'],
    author: 'Phòng Hành chính',
    department: 'Phòng Pháp chế',
    date: '2026-02-20',
    views: 203,
    starred: false,
    readingTime: 5,
  },
  {
    id: 'cs-003',
    categoryId: 'chinh-sach',
    title: 'Chính sách sử dụng AI trong giảng dạy và học tập',
    summary: 'Hướng dẫn và giới hạn sử dụng các công cụ AI (ChatGPT, Gemini…) trong môi trường học đường.',
    content: [
      'Nhà trường khuyến khích ứng dụng AI như một công cụ hỗ trợ học tập và giảng dạy hiệu quả, đồng thời đặt ra các giới hạn rõ ràng để đảm bảo tính trung thực học thuật và phát triển tư duy học sinh.',
      'Giáo viên được phép sử dụng AI để: Soạn thảo tài liệu tham khảo và ý tưởng bài giảng (phải kiểm tra và chỉnh sửa trước khi sử dụng). Tạo bài tập phân hóa cho học sinh. Phân tích dữ liệu học tập và đề xuất can thiệp cá nhân hóa. Không được dùng AI để thay thế hoàn toàn việc soạn giáo án hay chấm bài mà không có sự kiểm duyệt.',
      'Học sinh được phép sử dụng AI để: Tra cứu và tổng hợp thông tin nghiên cứu. Kiểm tra ngữ pháp và chỉnh sửa văn phong. Học ngôn ngữ và luyện tập ngoại ngữ. Nghiêm cấm: Sử dụng AI để viết bài luận, làm bài tập về nhà nộp dưới tên mình mà không khai báo. Vi phạm này bị xem là gian lận học thuật.',
      'Khai báo sử dụng AI: Giáo viên và học sinh cần ghi chú rõ trong tài liệu khi có sử dụng AI đáng kể. Nhà trường sẽ triển khai công cụ phát hiện AI để kiểm tra tính trung thực học thuật từ học kỳ 2 năm 2026-2027.',
    ],
    tags: ['AI', 'ChatGPT', 'học thuật', 'chính sách'],
    author: 'Phòng Đào tạo',
    department: 'Phòng Đào tạo',
    date: '2026-05-30',
    views: 678,
    starred: true,
    readingTime: 5,
  },
];

const ALL_TAGS = Array.from(new Set(ALL_ARTICLES.flatMap(a => a.tags)));

const CATEGORY_COLOR_MAP: Record<CategoryId, string> = {
  sop: 'indigo',
  'huong-dan': 'emerald',
  'quy-trinh': 'violet',
  faq: 'amber',
  'chinh-sach': 'rose',
};

const colorVariants: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', light: 'bg-indigo-50 dark:bg-indigo-950/30' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', light: 'bg-emerald-50 dark:bg-emerald-950/30' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800', light: 'bg-violet-50 dark:bg-violet-950/30' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', light: 'bg-amber-50 dark:bg-amber-950/30' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', light: 'bg-rose-50 dark:bg-rose-950/30' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KnowledgeBase() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [starredFilter, setStarredFilter] = useState(false);

  const filteredArticles = useMemo(() => {
    return ALL_ARTICLES.filter(a => {
      const matchCat = !selectedCategory || a.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
      const matchTag = !selectedTag || a.tags.includes(selectedTag);
      const matchStar = !starredFilter || a.starred;
      return matchCat && matchSearch && matchTag && matchStar;
    });
  }, [selectedCategory, searchQuery, selectedTag, starredFilter]);

  const getCategoryColor = (catId: CategoryId) => CATEGORY_COLOR_MAP[catId];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const totalViews = ALL_ARTICLES.reduce((s, a) => s + a.views, 0);

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-64 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1.5 w-fit">
                <BookOpen className="w-3.5 h-3.5" /> MODULE 11 · Knowledge Base
              </span>
              <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Kho Tri Thức Nội Bộ</h2>
              <p className="text-xs text-slate-400 max-w-2xl font-light leading-relaxed">
                Trung tâm lưu trữ SOP, hướng dẫn nghiệp vụ, quy trình vận hành và chính sách nội bộ dành cho toàn thể cán bộ giáo viên.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Tổng tài liệu', value: ALL_ARTICLES.length },
                { label: 'SOP', value: 5 },
                { label: 'FAQ', value: 8 },
                { label: 'Xem tháng này', value: totalViews.toLocaleString() },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center min-w-[80px]">
                  <div className="text-lg font-black font-mono text-white">{s.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT SIDEBAR ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedArticle(null); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStarredFilter(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${starredFilter ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <Star className="w-3 h-3" /> Nổi bật
            </button>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedArticle(null); setSelectedTag(null); setStarredFilter(false); setSearchQuery(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 transition-all"
            >
              <Filter className="w-3 h-3" /> Tất cả
            </button>
          </div>

          {/* Category Tree */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Danh mục</p>
            </div>
            <div className="p-2">
              <button
                onClick={() => { setSelectedCategory(null); setSelectedArticle(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${!selectedCategory ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Tất cả tài liệu</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{ALL_ARTICLES.length}</span>
              </button>
              {CATEGORIES.map(cat => {
                const color = colorVariants[cat.color];
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedArticle(null); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mt-0.5 ${isActive ? `${color.light} ${color.text} font-semibold` : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <span className={isActive ? color.text : 'text-slate-400'}>{cat.icon}</span>
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isActive ? `${color.light} ${color.text}` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{cat.count}</span>
                    {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Cloud */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Thẻ phổ biến
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(selectedTag === tag ? null : tag); setSelectedArticle(null); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${selectedTag === tag ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="lg:col-span-9">
          {selectedArticle ? (
            /* ── Article Viewer ── */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {/* Breadcrumb */}
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <button onClick={() => setSelectedArticle(null)} className="hover:text-indigo-600 flex items-center gap-1 font-semibold">
                  <ArrowLeft className="w-3 h-3" /> Quay lại
                </button>
                <ChevronRight className="w-3 h-3" />
                <span>{CATEGORIES.find(c => c.id === selectedArticle.categoryId)?.label}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">{selectedArticle.title}</span>
              </div>

              <div className="p-6 md:p-8">
                {/* Article header */}
                <div className="mb-6">
                  {(() => {
                    const color = colorVariants[getCategoryColor(selectedArticle.categoryId)];
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border ${color.light} ${color.text} ${color.border} mb-3`}>
                        {CATEGORIES.find(c => c.id === selectedArticle.categoryId)?.label}
                      </span>
                    );
                  })()}
                  <h1 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-white leading-tight mb-4">
                    {selectedArticle.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedArticle.author}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(selectedArticle.date)}</span>
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {selectedArticle.views} lượt xem</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {selectedArticle.readingTime} phút đọc</span>
                    {selectedArticle.starred && (
                      <span className="flex items-center gap-1 text-amber-600 font-semibold"><Star className="w-3.5 h-3.5 fill-amber-400" /> Nổi bật</span>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">{selectedArticle.summary}</p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {selectedArticle.content.map((para, i) => (
                    <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{para}</p>
                  ))}
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Thẻ</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Article List ── */
            <div>
              {/* List header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                    {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.label : 'Tất cả tài liệu'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{filteredArticles.length} tài liệu{searchQuery ? ` cho "${searchQuery}"` : ''}</p>
                </div>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Không tìm thấy tài liệu phù hợp</p>
                  <p className="text-slate-400 text-sm mt-1">Thử thay đổi từ khóa hoặc danh mục tìm kiếm</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map(article => {
                    const color = colorVariants[getCategoryColor(article.categoryId)];
                    return (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono border ${color.light} ${color.text} ${color.border}`}>
                                {CATEGORIES.find(c => c.id === article.categoryId)?.label}
                              </span>
                              {article.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{article.summary}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {article.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[10px] font-mono">#{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right space-y-1.5">
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end">
                              <Eye className="w-3 h-3" /> {article.views}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end">
                              <Clock className="w-3 h-3" /> {article.readingTime}p
                            </div>
                            <div className="text-[10px] text-slate-400">{formatDate(article.date)}</div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 ml-auto transition-colors" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
