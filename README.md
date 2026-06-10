<div align="center">
<img width="1200" height="475" alt="MIS SMART PORTAL Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🏢 MIS SMART PORTAL - Hệ Thống Quản Lý Công Việc Trường Học Thông Minh

**MIS Smart Portal** là một ứng dụng web cao cấp, tích hợp đầy đủ tính năng dành cho quản lý hoạt động trường học, tổ chuyên môn, học vụ, nhân sự và tích hợp trí tuệ nhân tạo (AI) hỗ trợ lập kế hoạch và tóm tắt công việc hàng ngày. Hệ thống hỗ trợ đồng bộ dữ liệu thời gian thực qua Firebase, phân quyền truy cập động (RBAC) và tích hợp mô hình Đa trí tuệ (Multiple Intelligences).

---

## 🌟 Tính Năng Nổi Bật

### 1. 📅 Quản Lý Công Việc & Chỉ Đạo (Task & Directives Management)
- **Giao diện trực quan:** Hỗ trợ 3 chế độ xem linh hoạt: **Bảng Kanban**, **Lịch biểu (Calendar)** và **Danh sách (List)**.
- **Bảng chỉ đạo từ Hội đồng:** Cập nhật các chỉ thị, nghị quyết khẩn cấp từ Ban Giám hiệu/CEO thời gian thực.
- **Phân loại bộ phận (Workspaces):** Quản lý công việc riêng biệt theo từng tổ chuyên môn (Toán-Tin, Ngữ Văn, Hành chính, Ban Giám hiệu...).

### 2. 🧠 Trí Tuệ Nhân Tạo & Đa Trí Tuệ (AI & Multiple Intelligences)
- **Tóm tắt công việc bằng Gemini AI:** Tích hợp mô hình ngôn ngữ lớn của Google Gemini để tự động phân tích và tóm tắt các nhiệm vụ chưa hoàn thành trong ngày của từng giáo viên.
- **Hồ sơ Đa Trí Tuệ (MI Profile):** Đánh giá năng lực của nhân sự dựa trên 8 loại hình trí thông minh (Logic, Ngôn ngữ, Không gian, Âm nhạc, Vận động, Tương tác, Nội tâm, Tự nhiên) để phân công công việc tối ưu nhất.
- **Quản lý OKRs cá nhân:** Thiết lập và theo dõi tiến độ OKR gắn liền với thế mạnh trí thông minh của từng cán bộ.

### 3. 🎓 Học Vụ & LMS (Academic & LMS Center)
- **Mis LMS:** Quản lý tài liệu giảng dạy, chấm bài, thống kê điểm số và theo dõi mức độ tương tác của học sinh.
- **Hoạt động học vụ:** Hỗ trợ lên lịch báo giảng, kế hoạch dự giờ, và chuẩn bị giáo án tích hợp công nghệ.

### 4. 💼 Quản Trị Nhân Sự (HRM) & Phát Triển Chuyên Môn (CPD)
- **Đánh giá KPI:** Theo dõi tiến độ KPI học kỳ của giáo viên.
- **Đào tạo liên tục (CPD):** Ghi nhận và theo dõi số giờ đào tạo chuyên môn, hội thảo sư phạm số của từng nhân sự.
- **Onboarding:** Quy trình nhận việc và phân bổ tổ chuyên môn nhanh gọn cho nhân sự mới.

### 5. 🍕 Vận Hành & Đề Xuất (Logistics & Requests Approval)
- **Kiểm định Hậu cần:** Quản lý đặt phòng chức năng, kiểm định an toàn vệ sinh bếp ăn học đường đột xuất.
- **Duyệt đề xuất tự động:** Quy trình phê duyệt trực tuyến các đơn xin nghỉ phép, đề xuất kinh phí, mua sắm thiết bị dạy học.

### 6. 🔒 Phân Quyền Bảo Mật Chặt Chẽ (RBAC)
- Phân quyền động theo 3 cấp độ: **Admin (Ban Giám hiệu/Quản trị)**, **Manager (Tổ trưởng chuyên môn)**, và **Staff (Giáo viên/Nhân viên)**.
- Cho phép Admin ghi đè quyền cụ thể trực tiếp trên giao diện cấu hình bảo mật.

---

## 🛠️ Công Nghệ Sử Dụng

### Core & Logic
- **React 19** & **TypeScript**
- **Vite 6** (Công cụ đóng gói và phát triển siêu tốc)
- **Express** (NodeJS Server đóng vai trò API Proxy cho Gemini)
- **Tailwind CSS 4.x** (Thiết kế giao diện hiện đại, tối ưu hiệu năng)
- **Motion (Framer Motion)** (Hiệu ứng chuyển cảnh, micro-animations mượt mà)
- **Recharts** (Vẽ biểu đồ trực quan hóa dữ liệu thống kê)
- **Lucide React** (Bộ icon hiện đại)

### Database & Auth
- **Firebase Firestore** (Lưu trữ và đồng bộ hóa dữ liệu thời gian thực)
- **Firebase Anonymous Auth** (Xác thực ẩn danh để kết nối an toàn)

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js** (Phiên bản 18 trở lên)
- **NPM** (Đi kèm với Node.js)
- **API Key Google Gemini** (Lấy từ Google AI Studio)
- **Firebase Project Credentials** (Để lưu trữ dữ liệu động)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Tải Mã Nguồn & Cài Đặt Thư Viện
```bash
# Cài đặt các thư viện phụ thuộc
npm install
```

### 2. Cấu Hình Biến Môi Trường
Tạo file `.env` tại thư mục gốc của dự án (hoặc đổi tên file `.env.example` thành `.env`) và bổ sung các thông tin sau:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Khởi Chạy Ứng Dụng
```bash
# Chạy ở chế độ nhà phát triển (Local Dev Server & API Server)
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:5173` (hoặc cổng được hiển thị trong terminal).

### 4. Biên Dịch Sản Phẩm (Build Production)
```bash
# Biên dịch cả Client code và Server code
npm run build

# Khởi chạy dự án sau khi build
npm run start
```

---

## 📁 Cấu Trúc Thư Mục Chính
```text
├── src/
│   ├── assets/             # Tài nguyên tĩnh (hình ảnh, logo)
│   ├── components/         # Các thành phần giao diện (UI Components)
│   │   ├── TaskCard.tsx
│   │   ├── WorkspaceStats.tsx
│   │   ├── IntelligenceAndOkrHub.tsx
│   │   ├── ...
│   ├── context/            # Quản lý ngôn ngữ (LanguageContext)
│   ├── utils/              # Thư viện tiện ích (Xuất Excel, Dịch thuật, Tính MI)
│   ├── App.tsx             # Trang giao diện chính
│   ├── firebase.ts         # Cấu hình kết nối Firebase
│   ├── types.ts            # Định nghĩa kiểu dữ liệu TypeScript
│   └── main.tsx            # Điểm khởi chạy React client
├── server.ts               # NodeJS Express Server (Proxy gọi Gemini API)
├── vite.config.ts          # Cấu hình Vite bundler
├── package.json            # Quản lý phiên bản dependencies
└── tsconfig.json           # Cấu hình TypeScript compiler
```

---

## 🤝 Hướng Dẫn Đồng Bộ Git (Git Sync)
Để đẩy các thay đổi cục bộ lên repository chính thức:
```bash
# Kiểm tra trạng thái thay đổi
git status

# Thêm tất cả thay đổi
git add -A

# Tạo bản cam kết
git commit -m "Mô tả nội dung thay đổi"

# Đẩy lên nhánh main
git push origin main
```
