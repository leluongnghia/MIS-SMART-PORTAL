# MIS Smart Portal – Kế hoạch Kiểm toán & Tái thiết kế Giao diện Cấp Doanh nghiệp (2026)

> **Phạm vi**: UI · UX · Bố cục · Kiến trúc thông tin · Dashboard · Điều hướng · Component · Design System
> **Ràng buộc**: Không thay đổi backend. Không thay đổi API. Không thay đổi phân quyền. Không thay đổi nghiệp vụ.
> **Công nghệ**: React 19 · Next.js App Router · TypeScript · Tailwind CSS v4 · Lucide React · Recharts · motion

---

## 📊 Đánh giá Hiện trạng

### Tổng quan Kiến trúc

```
mis cms/
├── src/
│   ├── App.tsx               ← 4.432 dòng — ĐƠN KHỐI (NỢ KỸ THUẬT NGHIÊM TRỌNG)
│   ├── components/           ← 36 file khổng lồ, trung bình 50KB mỗi file
│   │   ├── ExecutiveDashboard.tsx   (50KB, 992 dòng)
│   │   ├── HrmCenter.tsx           (110KB, LỚN NHẤT)
│   │   ├── MisLmsCenter.tsx        (173KB, LỚN NHẤT)
│   │   ├── ParentStudentPortal.tsx  (121KB)
│   │   ├── StudentSuccessHub.tsx    (124KB)
│   │   └── ui/               ← Chỉ có 9 component nguyên thủy
│   ├── context/              ← Chỉ có LanguageContext (thiếu quản lý trạng thái)
│   └── types.ts              ← 298 dòng, cấu trúc tốt
```

### Danh sách Màn hình / Module

| # | Tab ID | Tên màn hình | Quyền truy cập |
|---|--------|-------------|----------------|
| 1 | `DASHBOARD` | Bảng điều khiển Điều hành | ADMIN, MANAGER |
| 2 | `BOARD_DIRECTIVES` | Chỉ đạo BGH | ADMIN, MANAGER |
| 3 | `ANALYTICS` | Báo cáo & Phân tích | ADMIN |
| 4 | `RISK_CENTER` | Quản trị Rủi ro | ADMIN |
| 5 | `STRATEGY_OKRS` | Định hướng & OKRs | ADMIN |
| 6 | `DOCUMENT` | Quản lý Văn bản | HANH_CHINH |
| 7 | `TASKS` | Nhiệm vụ & Dự án | Tất cả |
| 8 | `WORKFLOW_APPROVALS` | Quy trình & Phê duyệt | MANAGER trở lên |
| 9 | `MEETING` | Quản lý Cuộc họp | MANAGER trở lên |
| 10 | `KNOWLEDGE` | Kho Tri Thức | Tất cả |
| 11 | `CRM_ADMISSIONS` | Tuyển sinh & CRM | TUYEN_SINH_PR |
| 12 | `STUDENT_SUCCESS` | Hồ sơ Học sinh 360° | CTHS_TAM_LY |
| 13 | `PARENT_PORTAL` | Cổng PHHS / Học sinh | Ẩn (chưa mở) |
| 14 | `HRM` | Quản trị HRM | Tất cả |
| 15 | `LMS` | Hệ thống LMS | STAFF, QUOC_TE |
| 16 | `EVENTS` | Quản lý Sự kiện | TUYEN_SINH_PR |
| 17 | `ACADEMIC_OPS` | Thời khóa biểu & Giáo án | Tất cả |
| 18 | `LOGISTICS` | Thư viện & Thiết bị | HANH_CHINH, DICH_VU |
| 19 | `REQUESTS` | Yêu cầu & Dịch vụ | STAFF, HANH_CHINH |
| 20 | `GOOGLE_SHEETS` | Đồng bộ Sheets | ADMIN |

---

## 🔴 Vấn đề Nghiêm trọng Phát hiện (có dẫn chứng file cụ thể)

### VẤN ĐỀ-001: Kiểu chống mẫu "God Component"
**File**: [`src/App.tsx`](file:///Users/nghialeluong/Desktop/mis%20cms/src/App.tsx) — **4.432 dòng, 231KB**
**Dòng**: L1–L4432
- Chứa tất cả: xác thực, định tuyến, sidebar, header, hơn 20 `useState`, toàn bộ handler nghiệp vụ, và render JSX
- **Tác động**: 🔴 NGHIÊM TRỌNG – Không thể bảo trì, phá vỡ hiệu suất render React, không thể SSR
- **Giải pháp**: Tách thành: `AppShell.tsx`, `AppHeader.tsx`, `AppSidebar.tsx`, `useAppState.ts`, `useTaskHandlers.ts`

### VẤN ĐỀ-002: Không có Hệ thống Component Dùng chung
**File**: [`src/components/ui/`](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/) — Chỉ có 9 component
- Thiếu: `Modal`, `Drawer`, `Toast`, `Skeleton`, `EmptyState`, `Tooltip`, `Avatar`, `Pagination`, `DatePicker`, `CommandPalette`
- **Tác động**: 🔴 Mỗi component khổng lồ tự tái tạo modal/drawer riêng
- **Giải pháp**: Xây dựng thư viện UI dùng chung trong `src/components/ui/`

### VẤN ĐỀ-003: Các File Component Đơn khối
**Các file**:
- `MisLmsCenter.tsx` — **173KB, ~3.900 dòng**
- `ParentStudentPortal.tsx` — **121KB**
- `StudentSuccessHub.tsx` — **124KB**
- `HrmCenter.tsx` — **110KB**
- **Tác động**: 🔴 Bundle phình to, React re-render toàn bộ cây khi có thay đổi trạng thái nhỏ

### VẤN ĐỀ-004: Dashboard Không Phân theo Vai trò
**File**: [`src/components/ExecutiveDashboard.tsx`](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ExecutiveDashboard.tsx) — Dòng 47–58
- Một Dashboard duy nhất cho tất cả vai trò (ADMIN/MANAGER/STAFF đều thấy cùng giao diện)
- Prop `currentUser` có nhưng không dùng để phân biệt
- **Tác động**: 🟠 CAO – Sai phân cấp thông tin theo từng persona

### VẤN ĐỀ-005: Header Quá Tải
**File**: `src/App.tsx` — **Dòng 1.656–2.014**
- Header có: Logo + Tiêu đề + Tìm kiếm + Chuyển cơ sở + Ngôn ngữ + Chế độ tối + Chuông thông báo + Học kỳ + SSO Demo + Đám mây + Người dùng
- **11 mục trong một hàng duy nhất** trên màn hình 1440px
- Nút "Giả lập Demo (SSO) 🧪" màu vàng nổi bật — hiển thị với tất cả người dùng
- **Tác động**: 🟠 CAO – Gây tải nhận thức cao, không có phân cấp thị giác

### VẤN ĐỀ-006: Sidebar Không Nhất quán
**File**: `src/App.tsx` — **Dòng 2.047–2.486**
- Nhóm được sắp xếp bằng CSS hack `style={{ order: N }}` (phản mẫu thiết kế)
- Ẩn menu bằng `className="${!canDisplayTab ? 'hidden' : ''}"` — item vẫn trong DOM nhưng ẩn đi
- Nhóm 1 = "Chiến lược", Nhóm 2 = "Vận hành" nhưng thứ tự CSS thực tế lộn xộn
- Không có tìm kiếm trong sidebar
- Không hiển thị số lượng chưa đọc khi nhóm thu gọn
- **Tác động**: 🟠 CAO – Gây nhầm lẫn điều hướng, DOM phình to do item ẩn

### VẤN ĐỀ-007: Banner Chào mừng Lãng phí Vùng Chính
**File**: `src/App.tsx` — **Dòng 2.492–2.556**
- Banner "Chào mừng, [Tên]" toàn chiều rộng hiển thị TRÊN mọi tab module kể cả Dashboard
- Chiếm khoảng 100px chiều cao mỗi trang
- Nút RBAC và Cài đặt đặt inline trong banner chào mừng
- **Tác động**: 🟠 CAO – Người dùng phải cuộn qua mỗi lần vào trang

### VẤN ĐỀ-008: Thiếu Empty State
**Các file**: Toàn bộ các component chính
- Không có hình minh họa hay thông báo trạng thái rỗng chuẩn
- Bảng hiển thị hàng trống hoặc không có gì khi không có dữ liệu
- **Tác động**: 🟡 TRUNG BÌNH – UX kém trên cài đặt mới hoặc kết quả lọc rỗng

### VẤN ĐỀ-009: Chỉ Dùng Spinner khi Tải
**Các file**: Toàn bộ thao tác bất đồng bộ
- Không có skeleton loading ở bất kỳ đâu
- **Tác động**: 🟡 TRUNG BÌNH – Nội dung nhảy cóc khi tải xong

### VẤN ĐỀ-010: Phản hồi Lỗi Quyền hạn bằng `alert()`
**File**: `src/App.tsx` — Dòng 1.168, 1.203, 1.213, 1.255, 1.291, 1.315, 1.389
- 7+ lần gọi `alert()` gốc cho thông báo lỗi quyền hạn
- Chặn luồng UI, không thể tùy chỉnh giao diện
- **Tác động**: 🟠 CAO – Phá vỡ hoàn toàn UX khi có lỗi

### VẤN ĐỀ-011: Dark Mode Chưa Hoàn thiện
**File**: [`src/index.css`](file:///Users/nghialeluong/Desktop/mis%20cms/src/index.css) — Dòng 218–297
- Dark mode dùng CSS override toàn cục với `!important` trên các class Tailwind
- Ví dụ: `.dark .bg-white { background-color: #1B2640 !important }` — ghi đè TẤT CẢ bg-white
- Sẽ phá vỡ bất kỳ card/modal màu trắng nào trong chế độ tối
- **Tác động**: 🟡 TRUNG BÌNH – Dễ vỡ, khó bảo trì

### VẤN ĐỀ-012: Thiếu Thang đo Typography
**File**: `src/index.css` — Không có thang đo typography
- Kích thước chữ hỗn loạn: `text-[9px]`, `text-[10px]`, `text-[10.5px]`, `text-xs`, `text-sm` — không có hệ thống
- CSS mobile ép TẤT CẢ `.text-xs` thành `13px !important` — phá vỡ layout desktop
- **Tác động**: 🟡 TRUNG BÌNH – Không nhất quán thị giác trên các màn hình

### VẤN ĐỀ-013: Command Palette Chưa Hoàn chỉnh
**File**: `src/App.tsx` — Dòng 306–320, 1.589–1.613
- Ctrl+K mở modal ✅
- Nhưng tìm kiếm chỉ bao phủ: phần, nhiệm vụ, người dùng, không gian làm việc
- Thiếu: văn bản, cuộc họp, bài tri thức, sự kiện
- Không có phần "Gần đây" hoặc "Yêu thích"
- **Tác động**: 🟡 TRUNG BÌNH

### VẤN ĐỀ-014: Không có Action Center
**File**: `src/components/ExecutiveDashboard.tsx` — Dòng 83–143
- Dữ liệu action item tồn tại nhưng không có drawer/panel Action Center riêng
- Chờ duyệt hiển thị trong card dashboard nhưng không có hàng chờ tập trung
- **Tác động**: 🟠 CAO

### VẤN ĐỀ-015: Không có Ngăn kéo Thông báo
- Nút chuông chỉ yêu cầu quyền thông báo trình duyệt
- Không có feed thông báo trong ứng dụng
- **Tác động**: 🟠 CAO

### VẤN ĐỀ-016: Không có Nút Hành động Nhanh (FAB)
- Tạo nhiệm vụ chỉ có thể qua toolbar của bảng nhiệm vụ
- Không có nút `+` FAB toàn cục
- **Tác động**: 🟡 TRUNG BÌNH

### VẤN ĐỀ-017: Số ma thuật Tailwind
**Các file**: `App.tsx`, tất cả component
- `w-5.5`, `text-[9.5px]`, `text-[10.5px]`, `shadow-3xs`, `shadow-xs` — không chuẩn
- Design token không được định nghĩa trong CSS custom properties
- **Tác động**: 🟡 TRUNG BÌNH

### VẤN ĐỀ-018: Thiếu Accessibility (ARIA) trên Các Phần tử Tương tác
**File**: `src/App.tsx` — Dòng 2.048–2.468 (nút sidebar)
- Nút sidebar có `title` nhưng thiếu `aria-current`, `aria-expanded`, `role="navigation"`
- Thiếu focus trap trong các modal
- **Tác động**: 🟠 CAO – Vi phạm WCAG 2.2 AA

### VẤN ĐỀ-019: CSS Order Hack trong Sidebar
**File**: `src/App.tsx` — Dòng 2.047, 2.128, 2.178, 2.259, 2.362
- `style={{ order: 1/2/3/4/5 }}` để sắp xếp lại nhóm sidebar
- Thứ tự DOM khác thứ tự hiển thị — trình đọc màn hình bị nhầm
- **Tác động**: 🟡 TRUNG BÌNH

### VẤN ĐỀ-020: Logic Lọc Campus Cứng nhắc
**File**: `src/App.tsx` — Dòng 1.451–1.470
- Phân công campus cho nhiệm vụ: `idx % 2 === 0 ? 'CAMPUS_HN' : 'CAMPUS_HCM'` — giả ngẫu nhiên
- **Tác động**: 🟡 TRUNG BÌNH — Ổn cho demo, không phù hợp production

---

## Yêu cầu Xem xét của Người dùng

> [!IMPORTANT]
> Toàn bộ kế hoạch tái cấu trúc chỉ liên quan đến frontend. Tất cả API Firestore, nghiệp vụ, RBAC, và mô hình dữ liệu hiện tại **hoàn toàn không thay đổi**.

> [!WARNING]
> **Rủi ro Tách App.tsx**: Tách file 4.432 dòng là thay đổi rủi ro cao nhất. Phải làm từng bước nhỏ, kiểm tra từng bước trước khi làm bước tiếp. Nếu muốn rủi ro thấp hơn, có thể chỉ cải thiện giao diện mà không cần tái cấu trúc.

> [!IMPORTANT]
> **Câu hỏi về Cách thực hiện**: Kế hoạch có 3 tầng:
> - **Tầng 1 (Thắng lợi Nhanh, 2–3 ngày)**: CSS/visual, dọn header, sửa sidebar, empty state, skeleton — không tái cấu trúc file
> - **Tầng 2 (Tái cấu trúc UX, 1–2 tuần)**: Dashboard phân vai trò, Action Center, Ngăn kéo Thông báo, Command Palette — tái cấu trúc vừa phải
> - **Tầng 3 (Kiến trúc, 2–4 tuần)**: Tách App.tsx, Design System, thư viện component — tái cấu trúc lớn
>
> Bạn muốn thực hiện tầng nào? (Cả 3? Chỉ Tầng 1? Tầng 1+2?)

---

## Câu hỏi Mở

1. **Persona Dashboard**: Hiện tại ADMIN = "Bảng điều khiển điều hành". Hiệu trưởng (MANAGER + workspaceId=BGH) có nên thấy cùng dashboard điều hành như ADMIN không?
2. **Hệ thống Thông báo**: Notification Center có nên hiển thị dữ liệu Firestore thời gian thực, hay chỉ dữ liệu local/mock cho giai đoạn này?
3. **Dashboard Phân vai trò**: Tạo một `Dashboard.tsx` chung với section điều kiện theo vai trò, hay tạo file riêng `DashboardAdmin.tsx`, `DashboardManager.tsx`?
4. **Nút Demo SSO**: Nút vàng "Giả lập Demo (SSO) 🧪" có nên ẩn khỏi header và chuyển vào tham số URL dành cho dev không?
5. **Tìm kiếm Sidebar**: Sidebar search có nên là ô nhập liệu hiển thị luôn, hay chỉ qua Ctrl+K?

---

## Các Thay đổi Đề xuất

### Giai đoạn 1: Thắng lợi Nhanh (Tầng 1) — Rủi ro thấp nhất

---

#### SỬA ĐỔI [index.css](file:///Users/nghialeluong/Desktop/mis%20cms/src/index.css)
**Thay đổi**:
- Thêm CSS custom properties cho hệ thống design token đầy đủ (spacing, radius, typography, màu sắc)
- Sửa CSS mobile text-xs override (chỉ áp dụng cho component cụ thể, không áp toàn cục)
- Thêm keyframe animation Skeleton
- Sửa dark mode dùng CSS vars thay vì `!important` Tailwind override

```diff
@theme {
+  /* Thang Khoảng cách */
+  --spacing-1: 4px;  --spacing-2: 8px;  --spacing-3: 12px;
+  --spacing-4: 16px; --spacing-6: 24px; --spacing-8: 32px;
+
+  /* Thang Bo góc */
+  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;
+  --radius-xl: 16px; --radius-pill: 999px;
+
+  /* Typography */
+  --text-display: 32px; --text-h1: 24px; --text-h2: 20px;
+  --text-body: 14px;    --text-caption: 12px;
}
```

---

#### SỬA ĐỔI [src/App.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/App.tsx) — Phần Header (Dòng 1.656–2.014)
**Thay đổi**:
- Xóa `Giả lập Demo (SSO) 🧪` khỏi header — chuyển vào menu avatar
- Xóa nút chuyển ngôn ngữ khỏi thanh header — chuyển vào menu avatar
- Xóa chỉ báo "Đã kết nối đám mây" (thông tin thừa)
- Xóa "Học kỳ I - 2026/27" khỏi header (chuyển vào footer sidebar hoặc user menu)
- **Header sau khi sửa**: Logo | Tìm kiếm | [Chuyển cơ sở] | [Chế độ tối] | [Chuông] | [Avatar]
- Chuyển nút RBAC và Cài đặt HỆ THỐNG ra khỏi Banner chào mừng vào dropdown Avatar

**Kết quả Header**: 6 mục (trước đó là 11)

---

#### SỬA ĐỔI [src/App.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/App.tsx) — Banner Chào mừng (Dòng 2.492–2.556)
**Thay đổi**:
- Xóa Banner Chào mừng luôn hiển thị khỏi đầu mọi trang
- Thay bằng thanh context gọn nhẹ chỉ trong tab DASHBOARD (hoặc xóa hoàn toàn)
- Chuyển thông tin người dùng vào phần avatar trên header

---

#### SỬA ĐỔI [src/App.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/App.tsx) — Sidebar (Dòng 2.028–2.487)
**Thay đổi**:
- Xóa CSS hack `style={{ order: N }}` — sửa thứ tự DOM khớp với thứ tự hiển thị
- Đổi `className="${!canDisplayTab ? 'hidden' : ''}"` thành render có điều kiện `{canDisplayTab && <button...>}`
- Thêm `role="navigation"` và `aria-label` vào `<aside>`
- Thêm `aria-current="page"` vào mục điều hướng đang hoạt động
- Thêm `aria-expanded` vào nút nhóm accordion
- Thêm ô tìm kiếm trong sidebar
- Hiển thị số lượng chưa đọc trên tiêu đề nhóm khi thu gọn

---

#### MỚI [src/components/ui/EmptyState.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/EmptyState.tsx)
```tsx
// Component EmptyState dùng chung với hình minh họa, tiêu đề, thông điệp, nút CTA
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;         // VD: "Chưa có nhiệm vụ nào"
  message?: string;      // VD: "Nhấn + để tạo nhiệm vụ đầu tiên"
  action?: { label: string; onClick: () => void };
}
```

---

#### MỚI [src/components/ui/Skeleton.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/Skeleton.tsx)
```tsx
// Component Skeleton loading thay thế toàn bộ spinner
// Các biến thể: text, card, table-row, avatar, kpi-card
```

---

#### SỬA ĐỔI [src/App.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/App.tsx) — Gọi Alert
**Thay đổi**: Thay toàn bộ 7 lần gọi `alert()` bằng hệ thống toast thông báo
- Dòng 1.168: `alert('Tài khoản... không được cấp quyền...')` → `toast.error()`
- Dòng 1.203, 1.213, 1.255, 1.291, 1.315, 1.389 — cùng mẫu

---

### Giai đoạn 2: Tái cấu trúc UX (Tầng 2)

---

#### MỚI [src/components/AppHeader.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/AppHeader.tsx)
Tách phần `<nav>` từ App.tsx (dòng 1.655–2.014) thành component riêng.
**Props**: `currentUser`, `darkMode`, `onToggleDark`, `onOpenCommandPalette`, `onOpenNotifications`, `selectedCampus`, `onChangeCampus`

---

#### MỚI [src/components/AppSidebar.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/AppSidebar.tsx)
Tách phần `<aside>` từ App.tsx (dòng 2.028–2.487) thành component riêng.
**Props**: `currentUser`, `activeTab`, `onTabChange`, `workspaces`, `tasks` (để hiển thị số lượng)

Thiết kế mới cấu trúc nhóm Sidebar:
```
📌 Tổng quan
─────────────────────────────────────
🎓 HỌC ĐƯỜNG
  └─ Nhiệm vụ & Dự án
  └─ Thời khóa biểu & Giáo án
  └─ Hệ thống LMS
  └─ Kho Tri Thức
  └─ Tuyển sinh & CRM
  └─ Hồ sơ Học sinh 360°
  └─ Quản lý Sự kiện
─────────────────────────────────────
👥 NHÂN SỰ
  └─ Quản trị HRM
  └─ Thư viện & Thiết bị
  └─ Yêu cầu & Dịch vụ
─────────────────────────────────────
⚙️ VẬN HÀNH
  └─ Quy trình & Phê duyệt
  └─ Quản lý Văn bản
  └─ Quản lý Cuộc họp
  └─ Đồng bộ Google Sheets
─────────────────────────────────────
📈 ĐIỀU HÀNH
  └─ Chỉ đạo BGH
  └─ Định hướng & OKRs
  └─ Quản trị Rủi ro
  └─ Báo cáo & Phân tích
```

---

#### SỬA ĐỔI [src/components/ExecutiveDashboard.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ExecutiveDashboard.tsx)
**Dashboard Phân theo Vai trò**:

```tsx
// Thay vì một layout duy nhất, render section dashboard theo vai trò:
const dashboardView = useMemo(() => {
  if (currentUser.role === 'ADMIN' || currentUser.workspaceId === 'BGH') {
    return 'DIEU_HANH';  // KPI đầy đủ, Risk Center, Hiệu suất phòng ban, Action Center
  }
  if (currentUser.role === 'MANAGER') {
    return 'TRUONG_PHONG'; // KPI phòng ban, nhiệm vụ nhóm, chờ duyệt
  }
  return 'GIAO_VIEN';    // Nhiệm vụ hôm nay, deadline sắp tới, KPI cá nhân
}, [currentUser]);
```

**Khu vực Dashboard theo Vai trò**:

| Khu vực | Chủ tịch / ADMIN | Hiệu trưởng (MANAGER BGH) | Trưởng phòng | Giáo viên |
|---------|-----------------|--------------------------|-------------|----------|
| Hàng KPI Chính | ✅ 6 KPI (Trễ hạn, Duyệt, KPI, Tuyển sinh, Rủi ro, Chỉ đạo) | ✅ 5 KPI | ✅ 3 KPI (Phòng ban) | ✅ Nhiệm vụ của tôi (3) |
| Action Center | ✅ Đầy đủ | ✅ Đầy đủ | ✅ Phạm vi phòng ban | ✅ Duyệt của tôi |
| Hiệu suất Phòng ban | ✅ Tất cả phòng ban | ✅ Tất cả phòng ban | ❌ | ❌ |
| Cảnh báo Rủi ro | ✅ | ✅ | ⚠️ Chỉ phòng ban | ❌ |
| Feed Hoạt động | ✅ | ✅ | ✅ Phòng ban | ✅ Của tôi |
| Biểu đồ | ✅ Đầy đủ | ✅ Đầy đủ | ✅ Biểu đồ phòng ban | ✅ Tiến độ của tôi |

**Kiểm tra 5 Giây** — Sau khi thay đổi, mở Dashboard thấy ngay:
- ✅ Số việc quá hạn (huy hiệu đỏ, KPI card trái trên)
- ✅ Số việc cần duyệt (huy hiệu vàng, nổi bật)
- ✅ KPI toàn trường (phần trăm, mũi tên xu hướng)
- ✅ Tiến độ tuyển sinh (thanh tiến trình với %)
- ✅ Phòng ban nguy hiểm (danh sách đỏ/vàng)
- ✅ Rủi ro hôm nay (cảnh báo Risk Center inline)

---

#### MỚI [src/components/NotificationDrawer.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/NotificationDrawer.tsx)
Ngăn kéo bên phải (rộng 320px, toàn chiều cao).
**Các tab**: Tất cả | Chỉ đạo | Duyệt | Deadline | Cảnh báo
**Tính năng**: Đánh dấu đã đọc, đánh dấu tất cả đã đọc, tìm kiếm, lọc theo danh mục
**Nguồn dữ liệu**: Lấy từ state `tasks`, `directives`, `announcements` hiện có — không cần API mới

---

#### MỚI [src/components/ActionCenterDrawer.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ActionCenterDrawer.tsx)
Panel hành động nhanh hiển thị các mục cần xử lý ngay.
**Các mục**: Chờ duyệt → click điều hướng đến chi tiết nhiệm vụ, Chỉ thị cấp bách, Nhiệm vụ đến hạn hôm nay
**Nguồn dữ liệu**: Giống `actionItems` trong `ExecutiveDashboard.tsx` dòng 83–143

---

#### MỚI [src/components/ui/CommandPalette.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/CommandPalette.tsx)
Tách code command palette hiện có từ `App.tsx` (dòng 1.589–1.613) thành component riêng.
**Bổ sung**: Phần Gần đây, điều hướng bàn phím (phím ↑↓), kết quả theo nhóm, tìm kiếm văn bản/cuộc họp/sự kiện

---

#### MỚI [src/components/FloatingActionButton.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/FloatingActionButton.tsx)
Nút `+` FAB cố định (góc dưới phải).
**Menu**: Nhiệm vụ mới, Tạo cuộc họp, Thêm văn bản, Giao chỉ đạo, Thêm học sinh
**Hiển thị**: Ẩn trên mobile khi bàn phím mở

---

### Giai đoạn 3: Kiến trúc & Design System (Tầng 3)

---

#### MỚI [src/hooks/useAppState.ts](file:///Users/nghialeluong/Desktop/mis%20cms/src/hooks/useAppState.ts)
Tách toàn bộ state từ `App.tsx` (dòng 323–699) vào custom hook.
Giữ nguyên: Tất cả state, giá trị derived, đồng bộ localStorage
Trả về: Tất cả state + setter dạng object có kiểu

---

#### MỚI [src/hooks/useTaskHandlers.ts](file:///Users/nghialeluong/Desktop/mis%20cms/src/hooks/useTaskHandlers.ts)
Tách các handler nhiệm vụ từ `App.tsx` (dòng 1.165–1.424) vào hook.
Xử lý: createTask, updateStatus, rejectTask, deleteTask, updateTask, addComment

---

#### MỚI [src/hooks/useDirectiveHandlers.ts](file:///Users/nghialeluong/Desktop/mis%20cms/src/hooks/useDirectiveHandlers.ts)
Tách các handler chỉ đạo từ `App.tsx` (dòng 1.035–1.087) vào hook.

---

#### MỚI [src/components/ui/Toast.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/Toast.tsx)
Thay thế toàn bộ lần gọi `alert()`. Dùng `motion` (đã có trong deps) cho animation trượt vào.
**Các biến thể**: thành công, lỗi, cảnh báo, thông tin
**Tính năng**: Tự đóng sau 5 giây, đóng thủ công, xếp chồng nhiều toast

---

#### MỚI [src/components/ui/Avatar.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/Avatar.tsx)
Gộp toàn bộ img avatar (có hơn 30 chỗ dùng trong các component).
Bọc logic `getSafeAvatar()`, có fallback chữ cái đầu tên, các kích thước (sm/md/lg/xl).

---

#### MỚI [src/components/ui/StatusBadge.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/StatusBadge.tsx)
Gộp huy hiệu trạng thái nhiệm vụ trong TaskCard, ExecutiveDashboard, HrmCenter...
`'CHUA_BAT_DA' | 'DANG_TIEN_HANH' | 'CHO_DUYET' | 'HOAN_THANH'` → ánh xạ màu nhất quán

---

#### MỚI [src/components/ui/KpiCard.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/ui/KpiCard.tsx)
Tách mẫu KPI metric card (dùng hơn 20 lần trong ExecutiveDashboard, WorkspaceStats).
**Props**: `value`, `label`, `trend`, `trendValue`, `color`, `icon`, `onClick`

---

#### SỬA ĐỔI [src/components/HrmCenter.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/HrmCenter.tsx)
Tách monolith 110KB thành:
- `HrmCenter.tsx` (shell, tabs)
- `HrmEmployeeList.tsx` (bảng nhân viên)
- `HrmEmployeeDetail.tsx` (modal hồ sơ)
- `HrmAttendance.tsx` (tab chấm công)
- `HrmPayroll.tsx` (tab lương)

---

#### SỬA ĐỔI [src/components/MisLmsCenter.tsx](file:///Users/nghialeluong/Desktop/mis%20cms/src/components/MisLmsCenter.tsx)
Tách monolith 173KB thành:
- `MisLmsCenter.tsx` (shell)
- `LmsCourseList.tsx`
- `LmsCourseDetail.tsx`
- `LmsStudentProgress.tsx`
- `LmsAssignments.tsx`

---

## Kế hoạch Kiểm tra

### Kiểm tra Tự động
```bash
npm run test         # Vitest unit test
npm run lint         # Kiểm tra kiểu TypeScript
npm run build        # Build production (kiểm tra không có lỗi bundle)
```

### Danh sách Kiểm tra Thủ công
- [ ] Cổng đăng nhập vẫn hoạt động với tất cả vai trò
- [ ] Tất cả 20 tab module vẫn render nội dung đúng
- [ ] Đồng bộ Firestore vẫn hoạt động (tasks, workspaces, directives, rbac)
- [ ] Command palette (Ctrl+K) mở và tìm kiếm được
- [ ] Nút chuyển chế độ tối/sáng hoạt động
- [ ] Bộ lọc campus lọc dữ liệu đúng
- [ ] Responsive mobile (kiểm tra ở 375px, 768px, 1280px)
- [ ] RBAC vẫn chặn các thao tác không được phép
- [ ] Dashboard phân vai trò hiển thị dữ liệu đúng theo từng role

---

## Xếp hạng Ưu tiên — 20 Thay đổi Tác động Lớn nhất

| # | Thay đổi | File | Tác động | Nỗ lực | Rủi ro |
|---|---------|------|---------|--------|--------|
| 1 | **Thay tất cả `alert()` bằng Toast** | App.tsx dòng 1.168+ | 🔴 UX Nghiêm trọng | Thấp | Thấp |
| 2 | **Xóa Banner Chào mừng** | App.tsx dòng 2.492 | 🔴 Lấy lại không gian | Thấp | Thấp |
| 3 | **Đơn giản hóa Header** (11→6 mục) | App.tsx dòng 1.656 | 🔴 Giảm tải nhận thức | Thấp | Thấp |
| 4 | **Sidebar: hidden→render có điều kiện** | App.tsx dòng 2.047+ | 🟠 A11y + DOM | Thấp | Thấp |
| 5 | **Sidebar: sửa CSS order hack** | App.tsx dòng 2.047+ | 🟠 A11y | Thấp | Thấp |
| 6 | **Thêm component EmptyState** | components/ui/ | 🟠 UX | Thấp | Thấp |
| 7 | **Thêm Skeleton loading** | components/ui/ | 🟠 UX | Thấp | Thấp |
| 8 | **Dashboard phân section theo vai trò** | ExecutiveDashboard.tsx | 🔴 Tính năng cốt lõi | Trung bình | Trung bình |
| 9 | **Ngăn kéo Action Center** | File mới | 🔴 Tính năng cốt lõi | Trung bình | Thấp |
| 10 | **Ngăn kéo Notification Center** | File mới | 🔴 Tính năng cốt lõi | Trung bình | Thấp |
| 11 | **Thuộc tính ARIA trong Sidebar** | App.tsx dòng 2.029 | 🟠 A11y WCAG 2.2 | Thấp | Thấp |
| 12 | **Nút Hành động Nhanh FAB** | File mới | 🟡 Năng suất | Thấp | Thấp |
| 13 | **CSS vars Design Token** | index.css | 🟠 Nhất quán | Thấp | Thấp |
| 14 | **Tách component AppHeader** | File mới | 🟡 Bảo trì | Trung bình | Trung bình |
| 15 | **Tách component AppSidebar** | File mới | 🟡 Bảo trì | Trung bình | Trung bình |
| 16 | **Component Avatar dùng chung** | ui/Avatar.tsx | 🟡 Nhất quán | Thấp | Thấp |
| 17 | **Component KpiCard dùng chung** | ui/KpiCard.tsx | 🟡 Nhất quán | Thấp | Thấp |
| 18 | **Component StatusBadge dùng chung** | ui/StatusBadge.tsx | 🟡 Nhất quán | Thấp | Thấp |
| 19 | **Tách hook useTaskHandlers** | hooks/ | 🟡 Bảo trì | Trung bình | Trung bình |
| 20 | **Tách HrmCenter.tsx** | HrmCenter.tsx | 🟡 Hiệu suất | Cao | Trung bình |

---

## Lộ trình Thực hiện

### Giai đoạn 1 – Thắng lợi Nhanh (Tuần 1)
- Dọn Header (11→6 mục)
- Xóa Banner Chào mừng
- Thay alert() bằng Toast
- Component Empty State
- Skeleton loading
- Sidebar a11y (ARIA, render có điều kiện)
- CSS vars design token

### Giai đoạn 2 – Tái cấu trúc UX (Tuần 2–3)
- Dashboard phân vai trò
- Ngăn kéo Action Center
- Ngăn kéo Notification Center
- Cải thiện Command Palette
- Nút Hành động Nhanh FAB
- Thiết kế lại sidebar (nhóm mới)

### Giai đoạn 3 – Design System (Tuần 3–4)
- Component Avatar, KpiCard, StatusBadge, Toast dùng chung
- Tách AppHeader, AppSidebar
- Tách hook (useAppState, useTaskHandlers)

### Giai đoạn 4 – Kiến trúc (Tháng 2)
- Tách HrmCenter, MisLmsCenter, StudentSuccessHub
- Phân rã App.tsx
- Thư viện component đầy đủ

### Giai đoạn 5 – Hiệu suất (Tháng 3)
- Audit React.memo / useMemo
- Code splitting (lazy loading từng module)
- Phân tích & giảm bundle size

---

## Báo cáo Vấn đề Đầy đủ — 105+ Mục

| # | Vấn đề | File | Dòng | Mức độ | Đề xuất | ETA |
|---|--------|------|------|--------|---------|-----|
| 1 | God Component – App.tsx 4.432 dòng | App.tsx | 1–4432 | 🔴 Nghiêm trọng | Tách AppShell + hook | 2 tuần |
| 2 | alert() thay vì toast | App.tsx | 1168,1203,1213,1255,1291,1315,1389 | 🔴 Nghiêm trọng | Tạo Toast component | 1 ngày |
| 3 | Banner Chào mừng lãng phí không gian | App.tsx | 2492–2556 | 🔴 Cao | Xóa, gộp vào header avatar | 2 giờ |
| 4 | Header 11 mục – quá tải | App.tsx | 1656–2014 | 🔴 Cao | Giảm xuống 6 mục | 3 giờ |
| 5 | Dashboard không phân vai trò | ExecutiveDashboard.tsx | 47–58 | 🔴 Cao | Section theo vai trò | 3 ngày |
| 6 | `hidden` dùng ẩn item sidebar | App.tsx | 2064,2079,... | 🟠 Cao | Render có điều kiện | 2 giờ |
| 7 | CSS order hack trong sidebar | App.tsx | 2047,2128,... | 🟠 Cao | Sửa thứ tự DOM | 1 giờ |
| 8 | Không có Action Center | ExecutiveDashboard.tsx | 83–143 | 🟠 Cao | Tạo ActionCenterDrawer | 1 ngày |
| 9 | Không có Notification Drawer | App.tsx | 1844 | 🟠 Cao | Tạo NotificationDrawer | 1 ngày |
| 10 | Thiếu ARIA trên sidebar buttons | App.tsx | 2062–2468 | 🟠 Cao | Thêm aria-current, aria-expanded | 2 giờ |
| 11 | Không có EmptyState component | Tất cả | — | 🟠 Cao | Tạo ui/EmptyState.tsx | 2 giờ |
| 12 | Spinner thay vì Skeleton | Tất cả async | — | 🟠 Cao | Tạo ui/Skeleton.tsx | 3 giờ |
| 13 | Dark mode dùng !important CSS | index.css | 218–297 | 🟠 Cao | Dùng CSS vars thay thế | 4 giờ |
| 14 | Nút Demo SSO trong header | App.tsx | 1890–1971 | 🟠 Cao | Di chuyển vào user menu | 1 giờ |
| 15 | MisLmsCenter.tsx 173KB đơn khối | MisLmsCenter.tsx | 1–3900 | 🔴 Nghiêm trọng | Tách thành 5 file | 1 tuần |
| 16 | HrmCenter.tsx 110KB đơn khối | HrmCenter.tsx | 1–2500 | 🔴 Nghiêm trọng | Tách thành 5 file | 1 tuần |
| 17 | StudentSuccessHub.tsx 124KB | StudentSuccessHub.tsx | 1–2800 | 🟠 Cao | Tách thành 4 file | 3 ngày |
| 18 | Không có Floating Quick Action | — | — | 🟡 Trung bình | Tạo FloatingActionButton.tsx | 4 giờ |
| 19 | Command Palette thiếu recent/favorite | App.tsx | 1589–1613 | 🟡 Trung bình | Tách + nâng cấp CommandPalette | 4 giờ |
| 20 | Sidebar không có tìm kiếm | App.tsx | 2043 | 🟡 Trung bình | Thêm ô tìm kiếm | 2 giờ |
| 21 | Không có thang đo Typography | index.css | — | 🟡 Trung bình | Thêm type scale CSS vars | 2 giờ |
| 22 | Kích thước chữ tùy tiện (10.5px...) | App.tsx, tất cả | — | 🟡 Trung bình | Chuẩn hóa với type scale | 1 ngày |
| 23 | Avatar không có shared component | Tất cả | — | 🟡 Trung bình | Tạo ui/Avatar.tsx | 2 giờ |
| 24 | KpiCard không có shared component | Dashboard, Stats | — | 🟡 Trung bình | Tạo ui/KpiCard.tsx | 2 giờ |
| 25 | StatusBadge không có shared component | TaskCard, HRM,... | — | 🟡 Trung bình | Tạo ui/StatusBadge.tsx | 2 giờ |
| 26 | Không có hệ thống Toast/Snackbar | — | — | 🟠 Cao | Tạo ui/Toast.tsx + Provider | 3 giờ |
| 27 | Không có Drawer component | — | — | 🟠 Cao | Tạo ui/Drawer.tsx | 3 giờ |
| 28 | Không có Tooltip component | — | — | 🟡 Trung bình | Tạo ui/Tooltip.tsx | 2 giờ |
| 29 | Không có Pagination component | — | — | 🟡 Trung bình | Tạo ui/Pagination.tsx | 2 giờ |
| 30 | Context quá đơn giản (chỉ Language) | context/ | — | 🟡 Trung bình | Thêm ToastContext, UIContext | 3 giờ |
| 31 | useEffect phụ thuộc tasks+users gây vòng lặp | App.tsx | 532–538 | 🟠 Cao | Sửa dependency array | 1 giờ |
| 32 | Firestore listeners cleanup chưa đúng | App.tsx | 726–894 | 🟡 Trung bình | Xem lại cleanup functions | 2 giờ |
| 33 | Không có React.memo trên component nặng | Tất cả | — | 🟡 Trung bình | Bọc leaf component với memo | 2 giờ |
| 34 | Chart dashboard dùng admissionsRate: 85 cứng | ExecutiveDashboard.tsx | 78 | 🟡 Trung bình | Lấy từ dữ liệu CRM thực | 4 giờ |
| 35 | Campus round-robin giả ngẫu nhiên | App.tsx | 1452 | 🟡 Trung bình | Sửa logic phân công campus | 2 giờ |
| 36 | Completion rate sidebar quá nhỏ | App.tsx | 2471–2486 | 🟡 Thấp | Thiết kế lại footer sidebar | 1 giờ |
| 37 | Không có dashboard riêng cho Giáo viên | ExecutiveDashboard.tsx | — | 🔴 Cao | Thêm view STAFF dashboard | 2 ngày |
| 38 | Không có dashboard riêng cho Kế toán | ExecutiveDashboard.tsx | — | 🟠 Cao | Thêm view Finance dashboard | 1 ngày |
| 39 | Không có dashboard riêng cho Tuyển sinh | ExecutiveDashboard.tsx | — | 🟠 Cao | Thêm view Admissions dashboard | 1 ngày |
| 40 | Không có dashboard riêng cho Trưởng phòng | ExecutiveDashboard.tsx | — | 🔴 Cao | Thêm view Manager dashboard | 2 ngày |
| 41 | Bảng nhiệm vụ trong TaskCard thiếu sort | TaskCard.tsx | — | 🟡 Trung bình | Thêm sort theo cột | 3 giờ |
| 42 | Bảng nhiệm vụ thiếu bulk actions | TaskCard.tsx | — | 🟡 Trung bình | Thêm checkbox + bulk toolbar | 4 giờ |
| 43 | Bảng nhiệm vụ thiếu nút xuất | TaskCard.tsx | — | 🟡 Trung bình | Xuất CSV/PDF | 3 giờ |
| 44 | Bảng thiếu resize cột | TaskCard.tsx | — | 🟡 Thấp | @tanstack/react-table đã có sẵn | 2 giờ |
| 45 | Form không có auto-save | TaskModal.tsx | — | 🟡 Trung bình | Thêm nháp localStorage | 3 giờ |
| 46 | Form không hiển thị Zod validation | TaskModal.tsx | — | 🟡 Trung bình | Zod đã trong deps, kết nối lại | 2 giờ |
| 47 | Modal không có focus trap | Tất cả modal | — | 🟠 Cao | Thêm focus-trap | 2 giờ |
| 48 | Modal không dùng element `<dialog>` native | Tất cả modal | — | 🟡 Trung bình | Migrate sang `<dialog>` | 3 giờ |
| 49 | Dropdown thiếu điều hướng bàn phím | Tất cả dropdown | — | 🟠 Cao | Thêm điều hướng phím Arrow | 3 giờ |
| 50 | Thiếu trạng thái focus visible | Tất cả | index.css | 🟠 Cao | Thêm style :focus-visible | 1 giờ |
| 51 | Độ tương phản màu thấp – slate-400 trên nền trắng | index.css | L15 | 🟠 Cao | Tăng tương phản theo WCAG 2.2 | 1 giờ |
| 52 | Không có link "Bỏ qua nội dung" | App.tsx | — | 🟡 Trung bình | Thêm `<a href="#main">Bỏ qua</a>` | 30 phút |
| 53 | Nút icon-only thiếu aria-label | App.tsx | 1834,1824 | 🟠 Cao | Thêm aria-label cho tất cả nút icon | 1 giờ |
| 54 | Thẻ img thiếu thuộc tính alt | App.tsx | 1671+ | 🟠 Cao | Kiểm tra tất cả thẻ `<img>` | 2 giờ |
| 55 | Chữ 9px không đọc được (WCAG) | Nhiều file | — | 🟠 Cao | Tối thiểu 12px cho mọi text | 1 ngày |
| 56 | Mobile: vùng chạm nhỏ hơn 44px | index.css | L186 | 🟡 Trung bình | CSS đã có nhưng chưa bao phủ hết | 2 giờ |
| 57 | Mobile sidebar không tự đóng khi click link | App.tsx | 2062+ | 🟡 Trung bình | Thêm setIsSidebarOpen(false) | 30 phút |
| 58 | Logo header fallback chưa đẹp | App.tsx | 1675 | 🟡 Trung bình | Dùng SVG fallback tốt hơn | 1 giờ |
| 59 | Chưa có layout tablet (768–1024px) | CSS | — | 🟡 Trung bình | Audit breakpoint md: | 3 giờ |
| 60 | Print styles chưa đầy đủ | index.css | L302–L360 | 🟡 Trung bình | Kiểm tra tất cả module | 2 giờ |
| 61 | Sidebar không thu gọn thành icon-only | App.tsx | 2029 | 🟡 Trung bình | Thêm collapsed mode (64px) | 4 giờ |
| 62 | Sidebar không hiển thị số lượng | App.tsx | 2043+ | 🟡 Trung bình | Hiện task count trên tiêu đề nhóm | 2 giờ |
| 63 | Footer sidebar "completion meter" quá nhỏ | App.tsx | 2471 | 🟡 Thấp | Thiết kế lại footer sidebar | 1 giờ |
| 64 | KPI admissions trong Dashboard hardcoded | ExecutiveDashboard.tsx | 78 | 🟡 Trung bình | Kết nối dữ liệu CRM | 2 giờ |
| 65 | Cảnh báo rủi ro tuần hardcoded | ExecutiveDashboard.tsx | 205–208 | 🟡 Trung bình | Động hóa hoặc xóa | 1 giờ |
| 66 | Tiêu đề chart "Hiện tại (Actual)" hardcoded | ExecutiveDashboard.tsx | 234 | 🟡 Thấp | i18n | 30 phút |
| 67 | Hiệu suất phòng ban không link sang module | ExecutiveDashboard.tsx | 242–288 | 🟡 Trung bình | Click phòng ban → điều hướng TASKS lọc | 2 giờ |
| 68 | Risk Center không realtime | RiskManagementCenter.tsx | — | 🟡 Trung bình | Kết nối dữ liệu tasks trực tiếp | 3 giờ |
| 69 | Không có Activity Feed | Dashboard | — | 🟡 Trung bình | Hiển thị timeline cập nhật nhiệm vụ gần đây | 3 giờ |
| 70 | Không có Quick Search mobile trong header | App.tsx | 1701 | 🟡 Trung bình | Search hiện bị ẩn trên mobile | 2 giờ |
| 71 | Command palette không phân nhóm | App.tsx | 1589 | 🟡 Trung bình | Nhóm kết quả theo loại có tiêu đề | 2 giờ |
| 72 | Command palette thiếu điều hướng bàn phím | App.tsx | 306 | 🟠 Cao | Thêm điều hướng ArrowUp/Down | 3 giờ |
| 73 | Không có undo cho hành động xóa | App.tsx | 1286 | 🟡 Trung bình | Xóa mềm với toast undo | 4 giờ |
| 74 | Tasks không có kéo-thả sắp xếp | TaskCard.tsx | — | 🟡 Trung bình | dnd-kit đã có trong deps | 3 giờ |
| 75 | Kanban không có WIP limits | TaskCard.tsx | — | 🟡 Thấp | Tính năng Kanban nâng cao | 3 giờ |
| 76 | TaskCalendar thiếu chuyển đổi tháng/tuần | TaskCalendar.tsx | — | 🟡 Trung bình | Thêm view switcher | 3 giờ |
| 77 | Gantt view còn placeholder | ProjectGanttView.tsx | — | 🟡 Trung bình | Implement thanh Gantt thực | 4 giờ |
| 78 | HrmCenter table thiếu virtual scroll | HrmCenter.tsx | — | 🟡 Trung bình | @tanstack/react-table virtualizer | 4 giờ |
| 79 | HrmCenter thiếu xuất bảng lương | HrmCenter.tsx | — | 🟡 Trung bình | Xuất CSV/Excel | 3 giờ |
| 80 | LMS thiếu biểu đồ theo dõi tiến độ | MisLmsCenter.tsx | — | 🟡 Trung bình | Recharts đã có, kết nối dữ liệu | 3 giờ |
| 81 | Knowledge base thiếu tìm kiếm full-text | KnowledgeBase.tsx | — | 🟡 Trung bình | Tìm kiếm client-side Fuse.js | 4 giờ |
| 82 | Document center thiếu preview | DocumentCenter.tsx | — | 🟡 Trung bình | Drawer xem trước PDF/ảnh | 4 giờ |
| 83 | Meeting notes chưa có rich text | MeetingCenter.tsx | — | 🟡 Trung bình | Textarea đơn giản quá cơ bản | 3 giờ |
| 84 | Events thiếu view lịch | EventManagement.tsx | — | 🟡 Trung bình | Chỉ có list view | 3 giờ |
| 85 | CRM thiếu lead scoring | SchoolCrmHub.tsx | — | 🟡 Thấp | Đề xuất thuật toán lead scoring | 4 giờ |
| 86 | Student 360 thiếu hành trình học | StudentSuccessHub.tsx | — | 🟡 Trung bình | Component timeline | 3 giờ |
| 87 | Parent portal không link từ sidebar | App.tsx | 2305 | 🟠 Cao | canDisplayTab('PARENT_PORTAL') = false | Xem lại |
| 88 | Logistics thiếu quét mã vạch | SchoolLogistics.tsx | — | 🟡 Thấp | Tính năng tương lai | 1 tuần |
| 89 | Requests thiếu theo dõi SLA | SchoolRequests.tsx | — | 🟡 Trung bình | Hiển thị số ngày đã trôi qua | 3 giờ |
| 90 | Google Sheets sync UI quá phức tạp | GoogleSheetsCenter.tsx | — | 🟡 Trung bình | Đơn giản hóa luồng UX | 4 giờ |
| 91 | WorkflowBuilder thiếu BPMN trực quan | WorkflowBuilder.tsx | — | 🟡 Thấp | Workflow dạng text là đủ | — |
| 92 | OKR Hub thiếu cây visualization | IntelligenceAndOkrHub.tsx | — | 🟡 Trung bình | Cây OKR trực quan | 4 giờ |
| 93 | StrategyOkrHub và IntelligenceAndOkrHub trùng lặp | Cả 2 file | — | 🟡 Trung bình | Gộp thành một module | 3 giờ |
| 94 | ReportingAnalyticsBuilder 7KB quá nhỏ | ReportingAnalyticsBuilder.tsx | — | 🟡 Trung bình | Cần xây dựng thêm | Liên tục |
| 95 | Thiếu ErrorBoundary bọc từng module | App.tsx | — | 🟠 Cao | AppErrorBoundary.tsx có nhưng chưa bọc module | 2 giờ |
| 96 | App.tsx cũ và Next.js App Router song song | src/app/ + src/App.tsx | — | 🟠 Cao | Làm rõ hệ thống định tuyến chính | Xem lại |
| 97 | Next.js App Router routes còn rất thiếu | src/app/[locale]/(admin)/ | — | 🟡 Trung bình | Chỉ có admissions, dashboard, leads, payments, reports | Xem lại |
| 98 | Thiếu error.tsx và not-found.tsx | src/app/ | — | 🟡 Trung bình | Thêm trang error boundary | 2 giờ |
| 99 | Thiếu loading.tsx | src/app/ | — | 🟡 Trung bình | Thêm skeleton loading pages | 2 giờ |
| 100 | mockData.ts 95KB trong client bundle | src/mockData.ts | — | 🔴 Cao | Chuyển sang API route / seeding server-side | 3 giờ |
| 101 | Không có service worker / PWA | — | — | 🟡 Thấp | Tính năng tương lai | 1 tuần |
| 102 | Không có quản lý state (Zustand/Jotai) | — | — | 🟡 Trung bình | 20+ useState trong App.tsx cần store tập trung | 1 tuần |
| 103 | Không có React Query / SWR | — | — | 🟡 Trung bình | Firestore onSnapshot thủ công ở khắp nơi | 2 tuần |
| 104 | Storybook có nhưng chưa có stories | devDependencies | — | 🟡 Thấp | Viết stories cho ui/* components | Liên tục |
| 105 | Thiếu kiểm tra a11y tự động | playwright | — | 🟡 Trung bình | Thêm axe-core vào Playwright tests | 3 giờ |

---

## Kế hoạch Commit

```bash
# Tầng 1: Thắng lợi Nhanh
git commit -m "fix: thay thế toàn bộ alert() bằng toast thông báo"
git commit -m "feat: thêm component Toast, EmptyState, Skeleton dùng chung"
git commit -m "refactor: đơn giản hóa header từ 11 xuống 6 mục"
git commit -m "refactor: xóa banner chào mừng khỏi vùng nội dung chính"
git commit -m "fix: sidebar dùng render có điều kiện thay vì class hidden"
git commit -m "fix: xóa CSS order hack khỏi các nhóm sidebar"
git commit -m "a11y: thêm thuộc tính ARIA vào điều hướng sidebar"
git commit -m "style: thêm CSS custom properties design token"

# Tầng 2: Tái cấu trúc UX
git commit -m "feat: dashboard phân vai trò (view ADMIN, MANAGER, STAFF)"
git commit -m "feat: thêm component ngăn kéo Action Center"
git commit -m "feat: thêm Notification Center drawer"
git commit -m "feat: nâng cấp Command Palette với gần đây/yêu thích/điều hướng bàn phím"
git commit -m "feat: thêm Floating Quick Action Button"
git commit -m "refactor: thiết kế lại nhóm điều hướng sidebar"

# Tầng 3: Kiến trúc
git commit -m "refactor: tách AppHeader từ App.tsx"
git commit -m "refactor: tách AppSidebar từ App.tsx"
git commit -m "refactor: tách hook useTaskHandlers"
git commit -m "refactor: tách hook useAppState"
git commit -m "refactor: tách HrmCenter.tsx thành 5 component"
git commit -m "refactor: tách MisLmsCenter.tsx thành 5 component"
```
