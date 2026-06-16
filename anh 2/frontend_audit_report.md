# Báo cáo Audit Frontend: Các Action & Button lỗi hoặc không hoạt động

Báo cáo này liệt kê toàn bộ các nút, liên kết, thẻ và menu hành động trong giao diện người dùng hiện tại đang bị lỗi, thiếu logic, hoặc chỉ có UI tĩnh không phản hồi khi bấm.

---

## 2. Bảng thống kê các nút, liên kết và action được rà soát (BƯỚC 2)

| Component / Cụm chức năng | Text hiển thị | File nguồn | Line |
| :--- | :--- | :--- | :--- |
| **AdmissionsDashboard** | Lead nóng cần xử lý (Xem tất cả) | `AdmissionsDashboard.tsx` | 242 |
| **AdmissionsDashboard** | Lead cần gọi lại (Xem tất cả) | `AdmissionsDashboard.tsx` | 272 |
| **AdmissionsDashboard** | Lịch test sắp tới (Xem tất cả) | `AdmissionsDashboard.tsx` | 293 |
| **AdmissionsDashboard** | Hồ sơ thiếu giấy tờ (Xem tất cả) | `AdmissionsDashboard.tsx` | 312 |
| **AdmissionsDashboard** | Thanh toán chờ xác nhận (Xem tất cả) | `AdmissionsDashboard.tsx` | 328 |
| **AdmissionsDashboard** | Top nguồn lead (Xem báo cáo) | `AdmissionsDashboard.tsx` | 344 |
| **AdmissionsLeadsTable** | Bộ lọc nâng cao | `AdmissionsLeadsTable.tsx` | 542 |
| **AdmissionsLeadsTable** | Xem lưới (Icon Grid) | `AdmissionsLeadsTable.tsx` | 545 |
| **AdmissionsLeadsTable** | Xem danh sách (Icon List) | `AdmissionsLeadsTable.tsx` | 548 |
| **AdmissionsLeadsTable** | Tuỳ chỉnh cột (Icon Settings) | `AdmissionsLeadsTable.tsx` | 551 |
| **AdmissionsLeadsTable** | Xem chi tiết (Icon Eye) | `AdmissionsLeadsTable.tsx` | 632 |
| **AdmissionsLeadsTable** | Chỉnh sửa (Icon Edit) | `AdmissionsLeadsTable.tsx` | 635 |
| **AdmissionsLeadsTable** | Thêm thao tác (Icon More) | `AdmissionsLeadsTable.tsx` | 638 |
| **AdmissionsPipelineKanban** | Chuyển giai đoạn | `AdmissionsPipelineKanban.tsx` | 241 |
| **AdmissionsPipelineKanban** | Bộ lọc | `AdmissionsPipelineKanban.tsx` | 281 |
| **AdmissionsPipelineKanban** | Tuỳ chỉnh | `AdmissionsPipelineKanban.tsx` | 284 |
| **AdmissionsPipelineKanban** | Thêm lead (Icon Plus) | `AdmissionsPipelineKanban.tsx` | 339 |
| **AdmissionsPipelineKanban** | Lead khác... (Icon Plus) | `AdmissionsPipelineKanban.tsx` | 352 |
| **AdmissionsLeadDetail** | Leads (Icon Breadcrumb Arrow) | `AdmissionsLeadDetail.tsx` | 79 |
| **AdmissionsLeadDetail** | Quay lại (Icon Arrow) | `AdmissionsLeadDetail.tsx` | 86 |
| **AdmissionsLeadDetail** | Chỉnh sửa (Icon Edit) | `AdmissionsLeadDetail.tsx` | 89 |
| **AdmissionsLeadDetail** | Tuỳ chọn khác (Icon More) | `AdmissionsLeadDetail.tsx` | 92 |
| **AdmissionsLeadDetail** | Edit (Icon Edit nhỏ ở tên) | `AdmissionsLeadDetail.tsx` | 112 |
| **AdmissionsLeadDetail** | Xem tất cả (Ghi chú gần đây) | `AdmissionsLeadDetail.tsx` | 380 |
| **AdmissionsLeadDetail** | Xem tất cả (Công việc liên quan) | `AdmissionsLeadDetail.tsx` | 401 |
| **AdmissionsLeadDetail** | Status Badge (Nhiệm vụ liên quan) | `AdmissionsLeadDetail.tsx` | 411 |
| **AdmissionsAppointments** | Bộ lọc | `AdmissionsAppointments.tsx` | 97 |
| **AdmissionsAppointments** | Xuất Excel | `AdmissionsAppointments.tsx` | 100 |
| **AdmissionsAppointments** | Quick Actions (Đặt lịch, Đăng ký,...) | `AdmissionsAppointments.tsx` | 111 |
| **AdmissionsAppointments** | Xem chi tiết (Icon Eye) | `AdmissionsAppointments.tsx` | 191 |
| **AdmissionsAppointments** | Chỉnh sửa (Icon Edit) | `AdmissionsAppointments.tsx` | 192 |
| **AdmissionsAppointments** | Thêm thao tác (Icon More) | `AdmissionsAppointments.tsx` | 193 |
| **AdmissionsAppointments** | Phân trang (ChevronLeft/Right) | `AdmissionsAppointments.tsx` | 204, 206 |
| **AdmissionsAppointments** | Xem chi tiết (KPI Summary) | `AdmissionsAppointments.tsx` | 217 |
| **AdmissionsAppointments** | Xem tất cả (Kết quả test gần nhất) | `AdmissionsAppointments.tsx` | 239 |
| **AdmissionsDocuments** | Xuất danh sách | `AdmissionsDocuments.tsx` | 170 |
| **AdmissionsDocuments** | Gửi nhắc nộp HS | `AdmissionsDocuments.tsx` | 173 |
| **AdmissionsDocuments** | Nhắc nộp hồ sơ (Bảng chi tiết) | `AdmissionsDocuments.tsx` | 282 |
| **AdmissionsDocuments** | Tải tất cả (Bảng chi tiết) | `AdmissionsDocuments.tsx` | 285 |
| **AdmissionsDocuments** | Cập nhật (Bảng chi tiết) | `AdmissionsDocuments.tsx` | 288 |
| **AdmissionsDocuments** | Xem file (Icon Eye) | `AdmissionsDocuments.tsx` | 334 |
| **AdmissionsDocuments** | Tải về (Icon Download) | `AdmissionsDocuments.tsx` | 339 |
| **AdmissionsPayments** | Tải QR | `AdmissionsPayments.tsx` | 102 |
| **AdmissionsPayments** | Xuất sao kê | `AdmissionsPayments.tsx` | 138 |
| **AdmissionsPayments** | Tạo phiếu thu | `AdmissionsPayments.tsx` | 141 |
| **AdmissionsPayments** | Đối soát ngay | `AdmissionsPayments.tsx` | 175 |
| **AdmissionsPayments** | Nhắc thanh toán | `AdmissionsPayments.tsx` | 178 |
| **AdmissionsPayments** | Xác nhận (Giao dịch chờ xác nhận) | `AdmissionsPayments.tsx` | 280 |
| **AdmissionsPayments** | Receipt (Icon hoá đơn) | `AdmissionsPayments.tsx` | 285 |
| **AdmissionsReports** | Làm mới | `AdmissionsReports.tsx` | 84 |
| **AdmissionsReports** | Xuất báo cáo | `AdmissionsReports.tsx` | 87 |
| **AdmissionsSettings** | Xem trước pipeline | `AdmissionsSettings.tsx` | 502 |
| **AdmissionsSettings** | Lưu thay đổi | `AdmissionsSettings.tsx` | 505 |
| **AdmissionsSettings** | Xoá giai đoạn | `AdmissionsSettings.tsx` | 570 |
| **AdmissionsSettings** | Tắt/bật hành động tự động | `AdmissionsSettings.tsx` | 621 |
| **AdmissionsSettings** | Thêm hành động tự động | `AdmissionsSettings.tsx` | 628 |
| **AdmissionsSettings** | Tắt/bật trạng thái giai đoạn | `AdmissionsSettings.tsx` | 659 |
| **DashboardClient (BGH)** | Xem tất cả (Phê duyệt khẩn cấp) | `dashboard-client.tsx` | 281 |
| **DashboardClient (BGH)** | Xem tất cả (Công việc ưu tiên) | `dashboard-client.tsx` | 304 |
| **DashboardClient (BGH)** | Xem tất cả công việc | `dashboard-client.tsx` | 322 |
| **DashboardClient (BGH)** | Xem tất cả (Sự kiện) | `dashboard-client.tsx` | 389 |
| **DashboardClient (BGH)** | Xem tất cả (Rủi ro) | `dashboard-client.tsx` | 433 |

---

## 3. Kết quả đánh giá chi tiết (BƯỚC 3 -> BƯỚC 9)

### 3.1. Các nút "Xem tất cả" (BƯỚC 4)
- **Tổng quan tuyển sinh (AdmissionsDashboard):** Tất cả 6 nút "Xem tất cả / Xem báo cáo" tại các widget:
  - Lead nóng cần xử lý
  - Lead cần gọi lại
  - Lịch test sắp tới
  - Hồ sơ thiếu giấy tờ
  - Thanh toán chờ xác nhận
  - Top nguồn lead
  đều là các nút **chỉ có UI tĩnh**, không truyền prop `onAction` xuống `SectionCard` và không liên kết với logic chuyển tab hoặc điều hướng nào.
- **Chi tiết Lead (AdmissionsLeadDetail):**
  - "Xem tất cả" ở Ghi chú gần đây & Công việc liên quan: Không có event onClick, click không phản hồi.
- **Lịch hẹn & Test (AdmissionsAppointments):**
  - "Xem chi tiết" (KPI) & "Xem tất cả" (Kết quả test): Chỉ có UI tĩnh.

### 3.2. Sidebar & Navigation (BƯỚC 5)
- **Tài khoản Tuyển sinh (TUYEN_SINH_PR):** 
  - Sub-navigation của Admissions hoạt động client-side tốt bằng cách quản lý state `internalModule`. Tuy nhiên, các tab này không đồng bộ ngược lại với URL query param khi người dùng click vào, dẫn tới việc tải lại trang sẽ bị mất trạng thái tab hiện tại.
- **Tài khoản Ban Giám hiệu (BGH / ADMIN) trong DashboardClient:**
  - Các nút "Xem tất cả" tại Action Center & Widget (Lịch, Rủi ro) sử dụng thẻ `<Link href="tasks">` hoặc `<Link href="approvals">`.
  - **🚨 Dead Link / 404:** Đây là liên kết tương đối (relative path). Khi đang ở route `/vi/dashboard`, click các link này sẽ đưa trình duyệt đến `/vi/dashboard/tasks`, `/vi/dashboard/approvals`, `/vi/dashboard/events` và `/vi/dashboard/risk` - toàn bộ các đường dẫn này đều **không tồn tại** (trả về lỗi 404). Chúng cần phải được định nghĩa tuyệt đối kèm locale (ví dụ: `/${locale}/tasks`).

### 3.3. Các nút fake & tĩnh (BƯỚC 7)
- Nhiều nút chức năng chính hiển thị biểu tượng con trỏ (cursor: pointer) nhưng không có logic handler:
  - Nút **"Bộ lọc nâng cao"**, **"Xem lưới"**, **"Xem danh sách"**, **"Tùy chỉnh cột"** trong danh sách Leads.
  - Các nút hành động trên dòng của bảng danh sách Leads (**Xem chi tiết**, **Chỉnh sửa**, **Thêm thao tác**).
  - Nút **"Tạo phiếu thu"**, **"Xuất sao kê"**, **"Nhắc thanh toán"**, **"Đối soát ngay"** trong module Thanh toán.
  - Nút **"Nhắc nộp hồ sơ"**, **"Tải tất cả"** trong module Hồ sơ & Tài liệu.

---

## 10. Bảng Báo cáo Trạng thái Chức năng (BƯỚC 10)

| STT | Chức năng | Component / Vị trí | Trạng thái | Chi tiết lỗi |
| :--- | :--- | :--- | :---: | :--- |
| 1 | Chuyển tab xem danh sách lead nóng | Admissions Dashboard | 🟠 Chỉ có UI | Nút "Xem tất cả" của widget Lead nóng cần xử lý không hoạt động |
| 2 | Chuyển tab xem danh sách cần gọi lại | Admissions Dashboard | 🟠 Chỉ có UI | Nút "Xem tất cả" của widget Lead cần gọi lại không hoạt động |
| 3 | Chuyển tab xem lịch test | Admissions Dashboard | 🟠 Chỉ có UI | Nút "Xem tất cả" của widget Lịch test sắp tới không hoạt động |
| 4 | Chuyển tab xem hồ sơ thiếu | Admissions Dashboard | 🟠 Chỉ có UI | Nút "Xem tất cả" của widget Hồ sơ thiếu giấy tờ không hoạt động |
| 5 | Chuyển tab xem thanh toán chờ xác nhận | Admissions Dashboard | 🟠 Chỉ có UI | Nút "Xem tất cả" của widget Thanh toán chờ xác nhận không hoạt động |
| 6 | Chuyển tab xem báo cáo nguồn lead | Admissions Dashboard | 🟠 Chỉ có UI | Nút "Xem báo cáo" của widget Top nguồn lead không hoạt động |
| 7 | Xem chi tiết lead từ bảng | AdmissionsLeadsTable | 🟠 Chỉ có UI | Bấm biểu tượng con mắt ở mỗi dòng lead không hoạt động |
| 8 | Chỉnh sửa lead từ bảng | AdmissionsLeadsTable | 🟠 Chỉ có UI | Bấm biểu tượng bút chì ở mỗi dòng lead không hoạt động |
| 9 | Thêm thao tác lead | AdmissionsLeadsTable | 🟠 Chỉ có UI | Bấm biểu tượng 3 chấm ở mỗi dòng lead không hoạt động |
| 10 | Bộ lọc & Tùy chỉnh danh sách | AdmissionsLeadsTable | 🟠 Chỉ có UI | Các nút bộ lọc, tùy chỉnh cột, chuyển chế độ xem chỉ là tĩnh |
| 11 | Chuyển giai đoạn Kanban | AdmissionsPipelineKanban | 🟠 Chỉ có UI | Nút "Chuyển giai đoạn" trong bảng chi tiết thẻ Kanban không hoạt động |
| 12 | Thêm nhanh lead vào bước | AdmissionsPipelineKanban | 🟠 Chỉ có UI | Nút "+ Thêm lead" ở đầu mỗi cột Kanban không hoạt động |
| 13 | Xem các lead ẩn trong cột | AdmissionsPipelineKanban | 🟠 Chỉ có UI | Nút "+ X lead khác..." ở cuối mỗi cột Kanban không hoạt động |
| 14 | Điều hướng quay lại từ Chi tiết | AdmissionsLeadDetail | 🟠 Chỉ có UI | Các nút "< Leads" và "Quay lại" không hoạt động |
| 15 | Xem toàn bộ ghi chú | AdmissionsLeadDetail | 🟠 Chỉ có UI | Nút "Xem tất cả" ở widget Ghi chú gần đây không hoạt động |
| 16 | Xem toàn bộ công việc | AdmissionsLeadDetail | 🟠 Chỉ có UI | Nút "Xem tất cả" ở widget Công việc liên quan không hoạt động |
| 17 | Xem chi tiết kết quả test | AdmissionsAppointments | 🟠 Chỉ có UI | Nút "Xem chi tiết" ở widget Tổng quan kết quả test không hoạt động |
| 18 | Xem tất cả kết quả test gần đây | AdmissionsAppointments | 🟠 Chỉ có UI | Nút "Xem tất cả" ở widget Kết quả test gần nhất không hoạt động |
| 19 | Thao tác dòng lịch hẹn | AdmissionsAppointments | 🟠 Chỉ có UI | Các icon Xem/Sửa/Thao tác trên mỗi dòng lịch hẹn không hoạt động |
| 20 | Phân trang lịch hẹn | AdmissionsAppointments | 🟠 Chỉ có UI | Bấm các nút mũi tên phân trang không làm thay đổi dữ liệu |
| 21 | Xuất danh sách & Gửi nhắc HS | AdmissionsDocuments | 🟠 Chỉ có UI | Các nút xuất Excel, gửi nhắc ở header không hoạt động |
| 22 | Tải file hồ sơ | AdmissionsDocuments | 🟠 Chỉ có UI | Các nút "Tải tất cả", "Xem file", "Tải về" của hồ sơ không hoạt động |
| 23 | Đối soát & Nhắc thanh toán | AdmissionsPayments | 🟠 Chỉ có UI | Các nút "Đối soát ngay", "Nhắc thanh toán", "Xuất sao kê" không hoạt động |
| 24 | Xác nhận giao dịch | AdmissionsPayments | 🟠 Chỉ có UI | Nút "Xác nhận" giao dịch đang chờ không hoạt động |
| 25 | Cấu hình & Lưu cài đặt | AdmissionsSettings | 🟠 Chỉ có UI | Các nút "Xem trước", "Lưu thay đổi", "Thêm hành động" không hoạt động |
| 26 | Liên kết Phê duyệt (BGH) | dashboard-client.tsx | 🚨 Dead Link | Dẫn đến trang `/dashboard/approvals` lỗi 404 |
| 27 | Liên kết Công việc (BGH) | dashboard-client.tsx | 🚨 Dead Link | Dẫn đến trang `/dashboard/tasks` lỗi 404 |
| 28 | Liên kết Lịch & Sự kiện (BGH) | dashboard-client.tsx | 🚨 Dead Link | Dẫn đến trang `/dashboard/events` lỗi 404 |
| 29 | Liên kết Quản trị Rủi ro (BGH) | dashboard-client.tsx | 🚨 Dead Link | Dẫn đến trang `/dashboard/risk` lỗi 404 |

---

## 11. Đề xuất phương án xử lý chi tiết (BƯỚC 11)

### 11.1. Khắc phục lỗi "Xem tất cả" tại Dashboard Tuyển sinh
Truyền hàm callback `onNavigate` từ `AdmissionsEnterpriseDashboard` xuống `AdmissionsDashboard` để cập nhật state `internalModule` tương ứng:
- **Lead nóng cần xử lý** & **Lead cần gọi lại**: Điều hướng đến tab `'leads'`.
  *UX cải tiến:* Có thể kết hợp lọc trạng thái tự động bằng cách truyền param, ví dụ: `onNavigate('leads', { filter: 'NEW_LEAD' })`.
- **Lịch test sắp tới**: Điều hướng đến tab `'appointments'`.
- **Hồ sơ thiếu giấy tờ**: Điều hướng đến tab `'documents'`.
- **Thanh toán chờ xác nhận**: Điều hướng đến tab `'payments'`.
- **Top nguồn lead**: Điều hướng đến tab `'reports'`.

### 11.2. Khắc phục lỗi Dead Link 404 tại Dashboard điều hành (BGH)
Thay đổi đường dẫn tương đối trong component `dashboard-client.tsx` sang đường dẫn tuyệt đối bao gồm locale bằng cách sử dụng `useParams()` từ `next/navigation`:
```tsx
const params = useParams();
const locale = params?.locale || 'vi';

// Thay đổi:
<Link href="tasks"> -> <Link href={`/${locale}/tasks`}>
<Link href="approvals"> -> <Link href={`/${locale}/approvals`}>
<Link href="events"> -> <Link href={`/${locale}/events`}>
<Link href="risk"> -> <Link href={`/${locale}/risk`}>
```

### 11.3. Khắc phục các nút UI tĩnh trong các Module tuyển sinh
- **Hồ sơ (Documents):** Liên kết nút "Xem file" / "Tải về" với URL tệp thực tế trong mock data, hoặc mở một modal/iframe preview tài liệu.
- **Thanh toán (Payments):**
  - Nút "Xác nhận" nên kích hoạt một mutation/state update chuyển trạng thái giao dịch từ "Chờ xác nhận" sang "Đã thanh toán", cập nhật lại tổng số tiền đã thu và hiển thị toast thông báo thành công.
  - Nút "Tải QR" nên kích hoạt download ảnh VietQR được sinh ra.
- **Chi tiết Lead (LeadDetail):**
  - Gắn sự kiện quay lại cho nút "< Leads" và "Quay lại" bằng cách gọi hàm callback cập nhật state module cha trở lại `'leads'`.
