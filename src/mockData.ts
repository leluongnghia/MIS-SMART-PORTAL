import { Task, Workspace, UserProfile, InventoryItem, BorrowLog, TimetableSlot } from './types';

export const WORKSPACES: Workspace[] = [
  {
    id: 'ALL',
    name: 'Tất cả Bộ phận',
    description: 'Tổng quan công việc toàn trường',
    color: 'from-slate-700 to-slate-900',
    iconName: 'School'
  },
  {
    id: 'BGH',
    name: 'Ban Giám hiệu & Hội đồng Trường',
    description: 'Chỉ đạo điều hành vĩ mô, phê chuẩn chiến lược và chính sách học thuật',
    color: 'from-amber-600 to-amber-800',
    iconName: 'ShieldCheck'
  },
  {
    id: 'TUYEN_SINH_PR',
    name: 'Phòng Tuyển sinh & Truyền thông',
    description: 'Tư vấn tuyển sinh, chăm sóc phụ huynh, truyền thông thương hiệu và đối ngoại',
    color: 'from-orange-500 to-amber-600',
    iconName: 'Megaphone'
  },
  {
    id: 'QUOC_TE',
    name: 'Ban Chương trình Quốc tế',
    description: 'Bản quyền giáo trình quốc tế, quản lý giáo viên nước ngoài và điều phối giao lưu song ngữ',
    color: 'from-indigo-600 to-violet-700',
    iconName: 'Globe'
  },
  {
    id: 'KHAO_THI',
    name: 'Phòng Khảo thí & ĐBCL',
    description: 'Rà soát kiểm tra đánh giá, cơ sở dữ liệu học vụ, khảo sát và kiểm định định kỳ',
    color: 'from-cyan-600 to-blue-700',
    iconName: 'Award'
  },
  {
    id: 'CTHS_TAM_LY',
    name: 'Tổ Công tác Học sinh & Tham vấn',
    description: 'Nề nếp bán trú, hoạt động ngoại khóa CLB, kỷ luật tích cực và tâm lý học đường',
    color: 'from-emerald-500 to-green-600',
    iconName: 'Heart'
  },
  {
    id: 'DICH_VU_HOC_DUONG',
    name: 'Phòng Dịch vụ & Vận hành Học đường',
    description: 'Dịch vụ xe đưa đón học sinh, bếp ăn bán trú, y tế và an ninh',
    color: 'from-sky-500 to-indigo-600',
    iconName: 'Bus'
  },
  {
    id: 'TOAN_TIN',
    name: 'Tổ Chuyên môn Toán - Tin học',
    description: 'Giảng dạy Toán học, Tin học theo Chương trình GDPT 2018',
    color: 'from-blue-600 to-indigo-700',
    iconName: 'Calculator'
  },
  {
    id: 'VAN',
    name: 'Tổ Chuyên môn Ngữ văn',
    description: 'Giảng dạy Ngữ văn, văn học và truyền thông văn hóa nghệ thuật',
    color: 'from-emerald-600 to-teal-700',
    iconName: 'BookOpen'
  },
  {
    id: 'NGOAI_NGU',
    name: 'Tổ Chuyên môn Ngoại ngữ',
    description: 'Giảng dạy Tiếng Anh, Tiếng Pháp, Tiếng Đức và giao tiếp hội nhập quốc tế',
    color: 'from-purple-600 to-indigo-700',
    iconName: 'Languages'
  },
  {
    id: 'KHTN',
    name: 'Tổ Chuyên môn Khoa học Tự nhiên',
    description: 'Giảng dạy môn Khoa học tự nhiên liên cấp (Vật lí, Hóa học, Sinh học)',
    color: 'from-teal-600 to-cyan-700',
    iconName: 'Compass'
  },
  {
    id: 'LS_DL',
    name: 'Tổ Chuyên môn Lịch sử - Địa lí',
    description: 'Giảng dạy môn Lịch sử, Địa lí và Giáo dục địa phương',
    color: 'from-amber-600 to-yellow-700',
    iconName: 'Compass'
  },
  {
    id: 'GDCD_KTPL',
    name: 'Tổ GDCD & Giáo dục Kinh tế - Pháp luật',
    description: 'Giảng dạy Giáo dục công dân, Giáo dục Kinh tế & Pháp luật',
    color: 'from-orange-600 to-red-700',
    iconName: 'ShieldCheck'
  },
  {
    id: 'NT_TC_QPAN',
    name: 'Tổ Nghệ thuật - Thể chất - QP-AN',
    description: 'Giảng dạy Giáo dục thể chất, GDQP-AN, Âm nhạc và Mĩ thuật',
    color: 'from-rose-500 to-red-600',
    iconName: 'Music'
  },
  {
    id: 'CN_TRAI_NGHIEM',
    name: 'Tổ Công nghệ & Hoạt động trải nghiệm',
    description: 'Giảng dạy môn Công nghệ, Thiết kế kĩ thuật, Hoạt động trải nghiệm hướng nghiệp',
    color: 'from-lime-650 to-green-700',
    iconName: 'Laptop'
  },
  {
    id: 'HANH_CHINH',
    name: 'Tổ Văn phòng & Kế toán - Tài chính',
    description: 'Quản lý thu chi học phí, thủ quỹ ngân sách, hồ sơ cán bộ, pháp chế và thủ tục hành chính',
    color: 'from-rose-600 to-pink-700',
    iconName: 'ClipboardList'
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user_chutich',
    email: 'chutich@misvn.edu.vn',
    name: 'Thầy PGS.TS. Nguyễn Văn Minh',
    role: 'ADMIN',
    roleName: 'Ban Giám hiệu & Hội đồng',
    title: 'Chủ tịch Hội đồng Trường',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'BGH'
  },
  {
    id: 'user_ceo',
    email: 'ceo@misvn.edu.vn',
    name: 'HVL',
    role: 'ADMIN',
    roleName: 'Ban Giám hiệu & Hội đồng',
    title: 'Giám đốc Điều hành (CEO)',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'BGH'
  },
  {
    id: 'user_triet',
    email: 'triet@misvn.edu.vn',
    name: 'Thầy Nguyễn Minh Triết',
    role: 'ADMIN',
    roleName: 'Ban Giám hiệu',
    title: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'BGH'
  },
  {
    id: 'user_tuan',
    email: 'tuan@misvn.edu.vn',
    name: 'Thầy Ngô Anh Tuấn',
    role: 'ADMIN',
    roleName: 'Ban Giám hiệu',
    title: 'Phó Hiệu trưởng cơ sở vật chất',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'BGH'
  },
  {
    id: 'user_nam_anh',
    email: 'nam_anh@misvn.edu.vn',
    name: 'Thầy Dương Nam Anh',
    role: 'ADMIN',
    roleName: 'Ban Giám hiệu',
    title: 'Phó Hiệu trưởng chuyên môn',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'BGH'
  },
  {
    id: 'user_nhan',
    email: 'nhan@misvn.edu.vn',
    name: 'Cô Lê Thị Thanh Nhàn',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Tổ trưởng Tổ Toán - Tin học',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_dat',
    email: 'dat@misvn.edu.vn',
    name: 'Thầy Vũ Tiến Đạt',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Tổ trưởng Tổ Ngữ văn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_binh_mgr',
    email: 'binh_mgr@misvn.edu.vn',
    name: 'Cô Hoàng Trúc Liên',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chức năng',
    title: 'Tổ trưởng Tổ Văn phòng - Hành chính',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  // -- BỔ SUNG CÁC TỔ TRƯỞNG / TRƯỞNG NHÓM THEO SƠ ĐỒ CHUYÊN MÔN --
  {
    id: 'user_khtn_mgr',
    email: 'kimanh@misvn.edu.vn',
    name: 'Cô Trần Thị Kim Anh',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Trưởng nhóm Tổ Vật lí - Hóa học (THPT)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'KHTN'
  },
  {
    id: 'user_lsdl_mgr',
    email: 'vanson@misvn.edu.vn',
    name: 'Thầy Hoàng Văn Sơn',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Trưởng nhóm Tổ Sinh - Địa - GDQP (THPT)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'LS_DL'
  },
  {
    id: 'user_nn_mgr',
    email: 'minhtuyet@misvn.edu.vn',
    name: 'Cô Minh Tuyết',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Trưởng nhóm Tổ Ngoại ngữ (THPT)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'NGOAI_NGU'
  },
  {
    id: 'user_nt_mgr',
    email: 'hoanghuong@misvn.edu.vn',
    name: 'Cô Hoàng Thị Hương',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Tổ trưởng / Liên hệ Tổ GDKT-PL & Nghệ thuật (THPT)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'NT_TC_QPAN'
  },
  {
    id: 'user_khtn_cs_mgr',
    email: 'minhkhang@misvn.edu.vn',
    name: 'Thầy Vũ Minh Khang',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Trưởng nhóm Tổ Khoa học Tự nhiên (THCS)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'KHTN'
  },
  {
    id: 'user_toan_th_mgr',
    email: 'maichi@misvn.edu.vn',
    name: 'Cô Nguyễn Mai Chi',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Tổ trưởng Tổ Toán - Tiếng Việt (Tiểu học)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_khtn_th_mgr',
    email: 'thuha@misvn.edu.vn',
    name: 'Cô Lê Thu Hà',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Trưởng nhóm Tổ Tự nhiên & Xã hội (Tiểu học)',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'CN_TRAI_NGHIEM'
  },
  {
    id: 'user_nt_th_mgr',
    email: 'congson@misvn.edu.vn',
    name: 'Thầy Trịnh Công Sơn',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Tổ trưởng / Liên hệ Tổ Nghệ thuật & Thể chất (Tiểu học)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'NT_TC_QPAN'
  },
  {
    id: 'user_nam',
    email: 'nam@misvn.edu.vn',
    name: 'Thầy Trần Hoàng Nam',
    role: 'MANAGER',
    roleName: 'Tổ phó Chuyên môn',
    title: 'Tổ phó Tổ Toán - Tin học (THCS)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_nhung',
    email: 'nhung@misvn.edu.vn',
    name: 'Cô Phạm Hồng Nhung',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Tổ Ngữ văn',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_kha',
    email: 'kha@misvn.edu.vn',
    name: 'Thầy Nguyễn Văn Kha',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Hành chính thiết bị',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_lan',
    email: 'lan@misvn.edu.vn',
    name: 'Cô Nguyễn Thanh Lan',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Tổ trưởng Tổ Ngữ văn & Lịch sử - Địa lí (THCS)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_phong',
    email: 'phong@misvn.edu.vn',
    name: 'Thầy Bùi Hải Phong',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Tin học ứng dụng',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_quyen',
    email: 'quyen@misvn.edu.vn',
    name: 'Cô Đỗ Thục Quyên',
    role: 'MANAGER',
    roleName: 'Liên hệ chuyên môn',
    title: 'Liên hệ Tổ Ngoại ngữ & GDCD (THCS)',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'NGOAI_NGU'
  },
  {
    id: 'user_binh',
    email: 'binh@misvn.edu.vn',
    name: 'Thầy Phạm Thanh Bình',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Kế toán tài vụ',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_dung',
    email: 'dung@misvn.edu.vn',
    name: 'Cô Mai Phương Dũng',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Nhân viên Y tế học đường',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_minh',
    email: 'minh@misvn.edu.vn',
    name: 'Thầy Lê Quang Minh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán hình học lớp 12',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_hoa',
    email: 'hoa@misvn.edu.vn',
    name: 'Cô Trịnh Thúy Hoa',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Văn học hiện đại',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_khanh',
    email: 'khanh@misvn.edu.vn',
    name: 'Thầy Nguyễn Quốc Khánh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Thủ thư thư viện',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_ngoc',
    email: 'ngoc@misvn.edu.vn',
    name: 'Cô Lâm Nhã Ngọc',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Tin học Scratch / Pascal',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131fed10495?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_van_anh',
    email: 'van_anh@misvn.edu.vn',
    name: 'Cô Trần Vân Anh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Văn học dân gian',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_long',
    email: 'long@misvn.edu.vn',
    name: 'Thầy Hoàng Thăng Long',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Quản trị hệ thống & CNTT',
    avatar: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  // -- BỔ SUNG THÀNH VIÊN TỔ TOÁN - TIN (12 giáo viên) --
  {
    id: 'user_toan_thai',
    email: 'toan_thai@misvn.edu.vn',
    name: 'Thầy Lê Quốc Thái',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán Đại số khối 11',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_thao',
    email: 'toan_thao@misvn.edu.vn',
    name: 'Cô Vũ Thu Thảo',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán Giải tích khối 12',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_dang',
    email: 'toan_dang@misvn.edu.vn',
    name: 'Thầy Phan Hải Đăng',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Lập trình C++ / Python',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_linh',
    email: 'toan_linh@misvn.edu.vn',
    name: 'Cô Đặng Khánh Linh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán Hình học khối 10',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_quan',
    email: 'toan_quan@misvn.edu.vn',
    name: 'Thầy Trịnh Minh Quân',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Tin học Văn phòng & nghề',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_trang',
    email: 'toan_trang@misvn.edu.vn',
    name: 'Cô Phạm Kiều Trang',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán bồi dưỡng học sinh giỏi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_hoang',
    email: 'toan_hoang@misvn.edu.vn',
    name: 'Thầy Nguyễn Văn Hoàng',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên chuyên đề Toán ứng dụng',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_yen',
    email: 'toan_yen@misvn.edu.vn',
    name: 'Cô Đỗ Hoàng Yến',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Lập trình Web khối chuyên',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_dao',
    email: 'toan_dao@misvn.edu.vn',
    name: 'Thầy Bùi Quang Đạo',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán lớp chất lượng cao',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_chi',
    email: 'toan_chi@misvn.edu.vn',
    name: 'Cô Nguyễn Quỳnh Chi',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Xác xuất thống kê & Hình học',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_long',
    email: 'toan_long@misvn.edu.vn',
    name: 'Thầy Lâm Hoàng Long',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Tin học Robotics & AI mầm',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },
  {
    id: 'user_toan_ngan',
    email: 'toan_ngan@misvn.edu.vn',
    name: 'Cô Phan Kim Ngân',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Toán Toán ứng dụng thực tiễn',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TOAN_TIN'
  },

  // -- BỔ SUNG THÀNH VIÊN TỔ NGỮ VĂN (12 giáo viên) --
  {
    id: 'user_van_mai',
    email: 'van_mai@misvn.edu.vn',
    name: 'Cô Nguyễn Tuyết Mai',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Lịch sử Văn học lớp 12',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_bao',
    email: 'van_bao@misvn.edu.vn',
    name: 'Thầy Đinh Gia Bảo',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Ngữ văn nâng cao khối tuyển',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_vi',
    email: 'van_vi@misvn.edu.vn',
    name: 'Cô Huỳnh Thúy Vi',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Ngữ văn trung đại Việt Nam',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_bich',
    email: 'van_bich@misvn.edu.vn',
    name: 'Cô Lưu Ngọc Bích',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Văn học thế giới',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_ky',
    email: 'van_ky@misvn.edu.vn',
    name: 'Thầy Trương Vĩnh Kỳ',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Phân tích văn học khối 11',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_my',
    email: 'van_my@misvn.edu.vn',
    name: 'Cô Hoàng Diễm My',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Sáng tạo viết chuẩn tư duy',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131fed10495?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_huong',
    email: 'van_huong@misvn.edu.vn',
    name: 'Cô Ngô Vũ Quỳnh Hương',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Lý luận văn học chuyên sâu',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_khanh_mr',
    email: 'van_khanh_mr@misvn.edu.vn',
    name: 'Thầy Mai Quốc Khánh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Ngữ văn cơ bản khối 10',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_an',
    email: 'van_an@misvn.edu.vn',
    name: 'Cô Kiều Khánh An',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Ngôn ngữ học & Giao tiếp',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_hung',
    email: 'van_hung@misvn.edu.vn',
    name: 'Thầy Vương Chí Hùng',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Ngữ văn ứng dụng đời sống',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_vandang',
    email: 'van_vandang@misvn.edu.vn',
    name: 'Cô Đặng Thanh Vân',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Thuyết trình & Đọc hiểu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },
  {
    id: 'user_van_duy',
    email: 'van_duy@misvn.edu.vn',
    name: 'Thầy Trần Đình Duy',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Giáo viên Lịch sử Văn học Việt Nam',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'VAN'
  },

  // -- BỔ SUNG CHUYÊN VIÊN TỔ HÀNH CHÍNH (12 chuyên viên) --
  {
    id: 'user_hc_ha',
    email: 'hc_ha@misvn.edu.vn',
    name: 'Thầy Triệu Quang Hà',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Thanh tra Kiểm soát nội bộ',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_dung',
    email: 'hc_dung@misvn.edu.vn',
    name: 'Cô Tống Phương Dung',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Văn thư lưu trữ học bạ học sinh',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_thuan',
    email: 'hc_thuan@misvn.edu.vn',
    name: 'Thầy Lâm Vĩnh Thuận',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Kế toán tài sản & Kho vật tư',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_hanh',
    email: 'hc_hanh@misvn.edu.vn',
    name: 'Cô Lương Mỹ Hạnh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Thủ quỹ trường học kiêm Ban Tài chính',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_son',
    email: 'hc_son@misvn.edu.vn',
    name: 'Thầy Cao Thanh Sơn',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên kỹ thuật hạ tầng thông tin',
    avatar: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_vy',
    email: 'hc_vy@misvn.edu.vn',
    name: 'Cô Dương Ái Vy',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Thư viện số & Nghiên cứu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_sanh',
    email: 'hc_sanh@misvn.edu.vn',
    name: 'Thầy Nguyễn Thạch Sanh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên Giám sát nề nếp học sinh',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_nga',
    email: 'hc_nga@misvn.edu.vn',
    name: 'Cô Kiều Nguyệt Nga',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Tư vấn tuyển sinh & Công tác tổ chuyên',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_thanh',
    email: 'hc_thanh@misvn.edu.vn',
    name: 'Thầy Lương Thế Thành',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Nhân viên Y tế & Vệ sinh học đường',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_linh',
    email: 'hc_linh@misvn.edu.vn',
    name: 'Cô Tạ Ngọc Linh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên Bảo hiểm xã hội & Lương bổng',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_thang',
    email: 'hc_thang@misvn.edu.vn',
    name: 'Thầy Vương Toàn Thắng',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên thi đua pháp chế toàn trường',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  {
    id: 'user_hc_huong',
    email: 'hc_huong@misvn.edu.vn',
    name: 'Cô Phan Thu Hương',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Trợ lý ban Hành chính liên lạc BGH',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'HANH_CHINH'
  },
  // -- BỘ PHẬN 1: PHÒNG TUYỂN SINH & TRUYỀN THÔNG (TUYEN_SINH_PR) --
  {
    id: 'user_pr_mgr',
    email: 'pr_mgr@misvn.edu.vn',
    name: 'Cô Vũ Khánh Chi',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chức năng',
    title: 'Trưởng phòng Tuyển sinh, PR & Quan hệ Phụ huynh',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TUYEN_SINH_PR'
  },
  {
    id: 'user_pr_ts1',
    email: 'pr_ts1@misvn.edu.vn',
    name: 'Cô Mai Phương Thảo',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên Tư vấn Chương trình đào tạo & CSKH',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TUYEN_SINH_PR'
  },
  {
    id: 'user_pr_mkt',
    email: 'pr_mkt@misvn.edu.vn',
    name: 'Thầy Nguyễn Tiến Đạt',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên Marketing & Tổ chức Sự kiện School Tour',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'TUYEN_SINH_PR'
  },
  // -- BỘ PHẬN 2: BAN CHƯƠNG TRÌNH QUỐC TẾ (QUOC_TE) --
  {
    id: 'user_qt_mgr',
    email: 'qt_mgr@misvn.edu.vn',
    name: 'Thầy David Miller',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chuyên môn',
    title: 'Giám đốc học thuật kiêm Liên hệ Tổ Ngoại ngữ & Tin học (Tiểu học)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'QUOC_TE'
  },
  {
    id: 'user_qt_staff1',
    email: 'qt_staff1@misvn.edu.vn',
    name: 'Cô Trần Thanh Vân',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Điều phối viên Học thuật & Kết nối Giáo viên nước ngoài',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'QUOC_TE'
  },
  {
    id: 'user_qt_staff2',
    email: 'qt_staff2@misvn.edu.vn',
    name: 'Thầy Jack Harrison',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên gia Luyện thi IELTS, SAT & ACT khối chuyên',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'QUOC_TE'
  },
  // -- BỘ PHẬN 3: PHÒNG KHẢO THÍ & ĐBCL (KHAO_THI) --
  {
    id: 'user_kt_mgr',
    email: 'anhntm@school.edu.vn',
    name: 'Nguyễn Thị Minh Anh',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chức năng',
    title: 'Trưởng phòng Khảo thí & ĐBCL',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'KHAO_THI'
  },
  {
    id: 'user_kt_staff1',
    email: 'kt_staff1@misvn.edu.vn',
    name: 'Thầy Lưu Nhật Nam',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên Kiểm định kết quả & Quản lý điểm số học vụ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'KHAO_THI'
  },
  {
    id: 'user_kt_staff2',
    email: 'kt_staff2@misvn.edu.vn',
    name: 'Cô Bùi Hà My',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Cán bộ Thanh tra Chương trình & Lấy ý kiến Phụ huynh',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'KHAO_THI'
  },
  // -- BỘ PHẬN 4: TỔ CÔNG TÁC HỌC SINH & THAM VẤN (CTHS_TAM_LY) --
  {
    id: 'user_tl_mgr',
    email: 'tl_mgr@misvn.edu.vn',
    name: 'Thầy Nguyễn Hoàng Hải',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chức năng',
    title: 'Tổ trưởng Công tác Học sinh, Đoàn Đội & Sinh hoạt Bán trú',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'CTHS_TAM_LY'
  },
  {
    id: 'user_tl_staff1',
    email: 'tl_staff1@misvn.edu.vn',
    name: 'Cô Nguyễn Minh Thư',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên viên Tham vấn Tâm lý & Giáo dục Kỹ năng sống',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131fed10495?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'CTHS_TAM_LY'
  },
  {
    id: 'user_tl_staff2',
    email: 'tl_staff2@misvn.edu.vn',
    name: 'Cô Lê Quỳnh Chi',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Quản lý khu Ký túc xá học sinh & Trật tự cơ sở',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'CTHS_TAM_LY'
  },
  // -- BỘ PHẬN 5: PHÒNG DỊCH VỤ & VẬN HÀNH HỌC ĐƯỜNG (DICH_VU_HOC_DUONG) --
  {
    id: 'user_dv_mgr',
    email: 'dv_mgr@misvn.edu.vn',
    name: 'Thầy Phạm Thế Anh',
    role: 'MANAGER',
    roleName: 'Tổ trưởng Chức năng',
    title: 'Trưởng phòng Khai thác Dịch vụ phụ trợ & Vận hành',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG'
  },
  {
    id: 'user_dv_bus',
    email: 'dv_bus@misvn.edu.vn',
    name: 'Thầy Trương Quốc Bảo',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Điều phối viên Mạng lưới Xe bus đưa đón học sinh toàn thành phố',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG'
  },
  {
    id: 'user_dv_chef',
    email: 'dv_chef@misvn.edu.vn',
    name: 'Cô Hoàng Kim Oanh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Chuyên gia Dinh dưỡng & Tổng quản lý bếp ăn học đường',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG'
  },
  {
    id: 'user_dv_nurse',
    email: 'dv_nurse@misvn.edu.vn',
    name: 'Cô Ngô Khánh Linh',
    role: 'STAFF',
    roleName: 'Giáo viên / Nhân viên',
    title: 'Y tá trưởng phụ trách sức khoẻ học vụ & tủ thuốc sơ cấp cứu',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG'
  },
  {
    id: 'user_dv_kitchen',
    email: 'dv_kitchen@misvn.edu.vn',
    name: 'Cô Nguyễn Thị Hòa',
    role: 'STAFF',
    roleName: 'Nhân viên vận hành học đường',
    title: 'Nhân viên bếp bán trú',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG',
    gender: 'Nữ',
    phone: '0903456781',
    address: 'Số 24, ngõ 16, Nam Từ Liêm, Hà Nội'
  },
  {
    id: 'user_dv_canteen',
    email: 'dv_canteen@misvn.edu.vn',
    name: 'Cô Trần Mai Hương',
    role: 'STAFF',
    roleName: 'Nhân viên vận hành học đường',
    title: 'Nhân viên canteen học đường',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG',
    gender: 'Nữ',
    phone: '0903456782',
    address: 'Số 31, ngõ 8, Cầu Giấy, Hà Nội'
  },
  {
    id: 'user_dv_cleaning',
    email: 'dv_cleaning@misvn.edu.vn',
    name: 'Cô Phạm Thị Dung',
    role: 'STAFF',
    roleName: 'Nhân viên vận hành học đường',
    title: 'Nhân viên tạp vụ vệ sinh học đường',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG',
    gender: 'Nữ',
    phone: '0903456783',
    address: 'Số 15, ngõ 22, Hà Đông, Hà Nội'
  },
  {
    id: 'user_dv_security',
    email: 'dv_security@misvn.edu.vn',
    name: 'Thầy Lê Văn Dũng',
    role: 'STAFF',
    roleName: 'Nhân viên vận hành học đường',
    title: 'Nhân viên bảo vệ cổng trường',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'DICH_VU_HOC_DUONG',
    gender: 'Nam',
    phone: '0903456784',
    address: 'Số 42, ngõ 19, Long Biên, Hà Nội'
  },
  {
    id: 'user_cths_giamthi',
    email: 'giamthi@misvn.edu.vn',
    name: 'Thầy Nguyễn Đức Thành',
    role: 'STAFF',
    roleName: 'Nhân viên công tác học sinh',
    title: 'Giám thị học đường',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    workspaceId: 'CTHS_TAM_LY',
    gender: 'Nam',
    phone: '0903456785',
    address: 'Số 12, ngõ 5, Thanh Xuân, Hà Nội'
  }
];

export interface MITarget {
  name: string;
  icon: string;
  bg: string;
  text: string;
  color: string; // Tailwind bg bar color
  description: string;
}

export function getTaskIntelligences(task: Task): MITarget[] {
  const list: MITarget[] = [];
  const wId = task.workspaceId;
  const combined = (task.title + " " + task.description).toLowerCase();

  if (
    wId === 'TOAN_TIN' || 
    combined.includes('toán') || 
    combined.includes('lập trình') || 
    combined.includes('robot') || 
    combined.includes('tin học') || 
    combined.includes('thuật toán') || 
    combined.includes('khảo thí') || 
    combined.includes('kiểm định') || 
    combined.includes('thống kê') || 
    combined.includes('điểm số') || 
    combined.includes('steam')
  ) {
    list.push({ 
      name: 'Trí tuệ Logic - Toán', 
      icon: '📐', 
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
      text: 'logical',
      color: 'bg-indigo-600',
      description: 'Khả năng tư duy logic học đường, lập luận khoa học, xử lý số liệu & lập trình hệ thống.'
    });
  }

  if (
    wId === 'VAN' || 
    combined.includes('văn') || 
    combined.includes('ngôn ngữ') || 
    combined.includes('tiếng anh') || 
    combined.includes('ielts') || 
    combined.includes('cambridge') || 
    combined.includes('thư viện') || 
    combined.includes('brochure') || 
    combined.includes('phát thanh') || 
    combined.includes('diễn thuyết') || 
    combined.includes('kịch nghệ')
  ) {
    list.push({ 
      name: 'Trí tuệ Ngôn ngữ', 
      icon: '📝', 
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      text: 'linguistic',
      color: 'bg-emerald-600',
      description: 'Năng lực biểu đạt câu chữ linh hoạt, kể chuyện sáng nghệ thuật và lĩnh hội văn học đọc viết.'
    });
  }

  if (
    combined.includes('không gian') || 
    combined.includes('mỹ thuật') || 
    combined.includes('thiết kế') || 
    combined.includes('bản đồ') || 
    combined.includes('vẽ') || 
    combined.includes('trung bày') || 
    combined.includes('triển lãm') || 
    combined.includes('sơ đồ') || 
    combined.includes('robotics') || 
    combined.includes('decor') || 
    combined.includes('trang trí')
  ) {
    list.push({ 
      name: 'Trí tuệ Không gian', 
      icon: '🎨', 
      bg: 'bg-purple-50 text-purple-700 border-purple-200', 
      text: 'spatial',
      color: 'bg-purple-600',
      description: 'Khả năng mường tượng hình khối nhạy bén, phối màu kiến trúc trường học và phác thảo sơ đồ.'
    });
  }

  if (
    wId === 'DICH_VU_HOC_DUONG' || 
    combined.includes('vườn') || 
    combined.includes('sinh thái') || 
    combined.includes('cỏ') || 
    combined.includes('cây') || 
    combined.includes('môi trường') || 
    combined.includes('bảo vệ động vật') || 
    combined.includes('thiên nhiên') || 
    combined.includes('rác')
  ) {
    list.push({ 
      name: 'Trí tuệ Tự nhiên', 
      icon: '🌿', 
      bg: 'bg-green-50 text-green-700 border-green-200', 
      text: 'naturalist',
      color: 'bg-green-600',
      description: 'Sự nhạy cảm tinh tế với thế giới sinh vật học, nuôi trồng thực vật và vận hành trường học xanh.'
    });
  }

  if (
    combined.includes('vận động') || 
    combined.includes('thể chất') || 
    combined.includes('dã ngoại') || 
    combined.includes('xe bus') || 
    combined.includes('thực phẩm') || 
    combined.includes('dinh dưỡng') || 
    combined.includes('bữa ăn') || 
    combined.includes('bóng đá') || 
    combined.includes('chạy bộ') || 
    combined.includes('kịch') || 
    combined.includes('nhảy') || 
    combined.includes('múa')
  ) {
    list.push({ 
      name: 'Trí tuệ Vận động', 
      icon: '🏃‍♂️', 
      bg: 'bg-orange-50 text-orange-700 border-orange-200', 
      text: 'kinesthetic',
      color: 'bg-orange-500',
      description: 'Sự kiểm soát điều khiển cơ thể dẻo dai khéo léo, thể thao học vụ và kỹ năng cuộc sống thực địa.'
    });
  }

  if (
    combined.includes('nhạc') || 
    combined.includes('hát') || 
    combined.includes('đàn') || 
    combined.includes('giai điệu') || 
    combined.includes('âm thanh') || 
    combined.includes('văn nghệ') || 
    combined.includes('tiết mục') || 
    combined.includes('fete')
  ) {
    list.push({ 
      name: 'Trí tuệ Âm nhạc', 
      icon: '🎵', 
      bg: 'bg-pink-50 text-pink-700 border-pink-200', 
      text: 'musical',
      color: 'bg-pink-500',
      description: 'Khả năng cảm thụ cao về cao độ nhịp điệu giai điệu, hòa âm nhạc cụ và trình diễn sân khấu.'
    });
  }

  if (
    wId === 'CTHS_TAM_LY' || 
    combined.includes('tâm lý') || 
    combined.includes('tư vấn') || 
    combined.includes('tự giác') || 
    combined.includes('nội tâm') || 
    combined.includes('tự đánh giá') || 
    combined.includes('hướng nghiệp') || 
    combined.includes('mục tiêu cá nhân') || 
    combined.includes('suy ngẫm')
  ) {
    list.push({ 
      name: 'Trí tuệ Nội tâm', 
      icon: '🧠', 
      bg: 'bg-teal-50 text-teal-700 border-teal-200', 
      text: 'intrapersonal',
      color: 'bg-teal-600',
      description: 'Ý thức tự nhận thức thấu hiểu cảm xúc ưu nhược điểm bản thân để hoàn thiện kỷ luật tự giác.'
    });
  }

  if (
    wId === 'TUYEN_SINH_PR' || 
    wId === 'BGH' || 
    combined.includes('giao tiếp') || 
    combined.includes('chăm sóc phụ huynh') || 
    combined.includes('tư vấn phụ huynh') || 
    combined.includes('hội họp') || 
    combined.includes('cộng tác') || 
    combined.includes('đối ngoại') || 
    combined.includes('quan hệ') || 
    combined.includes('ngoại giao') || 
    combined.includes('open day') || 
    combined.includes('school tour')
  ) {
    list.push({ 
      name: 'Trí tuệ Giao tiếp', 
      icon: '🤝', 
      bg: 'bg-blue-50 text-blue-700 border-blue-200', 
      text: 'interpersonal',
      color: 'bg-blue-600',
      description: 'Khả năng thấu cảm kết nối nhóm, nắm bắt tâm lý người đối thoại để đàm phán hợp tác thành công.'
    });
  }

  // Fallbacks to guarantee at least one based on department
  if (list.length === 0) {
    if (wId === 'TOAN_TIN' || wId === 'KHAO_THI') {
      list.push({ 
        name: 'Trí tuệ Logic - Toán', 
        icon: '📐', 
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
        text: 'logical',
        color: 'bg-indigo-600',
        description: 'Khả năng tư duy logic học đường, lập luận khoa học, xử lý số liệu & lập trình hệ thống.'
      });
    } else if (wId === 'VAN' || wId === 'QUOC_TE') {
      list.push({ 
        name: 'Trí tuệ Ngôn ngữ', 
        icon: '📝', 
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        text: 'linguistic',
        color: 'bg-emerald-600',
        description: 'Năng lực biểu đạt câu chữ linh hoạt, kể chuyện sáng nghệ thuật và lĩnh hội văn học đọc viết.'
      });
    } else if (wId === 'BGH' || wId === 'TUYEN_SINH_PR') {
      list.push({ 
        name: 'Trí tuệ Giao tiếp', 
        icon: '🤝', 
        bg: 'bg-blue-50 text-blue-700 border-blue-200', 
        text: 'interpersonal',
        color: 'bg-blue-600',
        description: 'Khả năng thấu cảm kết nối nhóm, nắm bắt tâm lý người đối thoại để đàm phán hợp tác thành công.'
      });
    } else if (wId === 'CTHS_TAM_LY') {
      list.push({ 
        name: 'Trí tuệ Nội tâm', 
        icon: '🧠', 
        bg: 'bg-teal-50 text-teal-700 border-teal-200', 
        text: 'intrapersonal',
        color: 'bg-teal-600',
        description: 'Ý thức tự nhận thức thấu hiểu cảm xúc ưu nhược điểm bản thân để hoàn thiện kỷ luật tự giác.'
      });
    } else {
      list.push({ 
        name: 'Trí tuệ Tự nhiên', 
        icon: '🌿', 
        bg: 'bg-green-50 text-green-700 border-green-200', 
        text: 'naturalist',
        color: 'bg-green-600',
        description: 'Sự nhạy cảm tinh tế với thế giới sinh vật học, nuôi trồng thực vật và vận hành trường học xanh.'
      });
    }
  }

  return list;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    projectId: 'PROJECT_ACADEMIC',
    projectName: 'Dự án học vụ',
    startDate: '2026-05-27',
    title: 'Biên soạn đề cương ôn tập Học kỳ II môn Toán khối 10',
    description: 'Xây dựng ngân hàng câu hỏi, ma trận đề và đáp án chi tiết bám sát chương trình GDPT mới 2018 kiểm tra cuối học kỳ II.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_nam',
    assignedName: 'Thầy Trần Hoàng Nam',
    assignedRole: 'Giáo viên Tổ Toán - Tin học',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-05',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [
      {
        id: 'c1',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng Tổ Toán - Tin',
        content: 'Chú ý bổ sung thêm 20% câu hỏi vận dụng cao theo chuẩn định hướng thi tốt nghiệp mới nhé thầy Nam.',
        createdAt: '2026-05-28 09:30'
      },
      {
        id: 'c2',
        userName: 'Thầy Trần Hoàng Nam',
        userTitle: 'Giáo viên Toán',
        content: 'Dạ vâng, em đã nhận chỉ đạo và đang chuẩn bị bổ sung phần vận dụng trắc nghiệm trả lời ngắn.',
        createdAt: '2026-05-29 14:15'
      }
    ],
    history: [
      {
        id: 'h1',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng Tổ Toán - Tin',
        action: 'Đã tạo công việc và giao cho Thầy Trần Hoàng Nam',
        createdAt: '2026-05-27 08:00'
      },
      {
        id: 'h2',
        userName: 'Thầy Trần Hoàng Nam',
        userTitle: 'Giáo viên Toán',
        action: 'Đã chuyển trạng thái sang Đang tiến hành',
        createdAt: '2026-05-27 10:30'
      }
    ]
  },
  {
    id: 'task_2',
    projectId: 'PROJECT_ACADEMIC',
    projectName: 'Dự án học vụ',
    parentTaskId: 'task_1',
    startDate: '2026-05-28',
    title: 'Hoàn thiện và gửi báo cáo tổng kết thi đua dạy tốt đợt 26/03',
    description: 'Tổng hợp số tiết thao giảng có xếp loại Giỏi, tập hợp danh sách giáo viên có giờ học tốt, đề xuất khen thưởng gửi Ban Giám hiệu.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_nhan',
    assignedName: 'Cô Lê Thị Thanh Nhàn',
    assignedRole: 'Tổ trưởng Tổ Toán - Tin học',
    priority: 'TRUNG_BINH',
    status: 'CHO_DUYET',
    deadline: '2026-06-01',
    tag: 'Báo cáo',
    createdBy: 'Thầy Nguyễn Minh Triết',
    reportEvidence: 'Đã tổng hợp đầy đủ hồ sơ biên bản dự giờ của 10 giáo viên trong tổ chuyên môn. Thống kê có 8 tiết đạt loại Xuất sắc, 2 tiết đạt loại Khá. Kính gửi Hiệu trưởng phê duyệt danh sách đề xuất thi đua.',
    comments: [],
    history: [
      {
        id: 'h1_t2',
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng',
        action: 'Đã giao việc cho Tổ trưởng Lê Thị Thanh Nhàn',
        createdAt: '2026-05-25 15:00'
      },
      {
        id: 'h2_t2',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng',
        action: 'Đã chuẩn bị báo cáo hoàn chỉnh và gửi yêu cầu phê duyệt',
        createdAt: '2026-05-30 08:45'
      }
    ]
  },
  {
    id: 'task_3',
    projectId: 'PROJECT_EVENTS',
    projectName: 'Dự án sự kiện',
    startDate: '2026-05-29',
    title: 'Chuẩn bị kế hoạch tổ chức Lễ Tổng kết và Tri ân khối 12',
    description: 'Lên chương trình chi tiết, phân công chuẩn bị phông màn, âm thanh ánh sáng, bố trí chỗ ngồi giáo viên, đại biểu phụ huynh và học sinh toàn trường.',
    workspaceId: 'BGH',
    assignedId: 'user_nhan',
    assignedName: 'Cô Lê Thị Thanh Nhàn',
    assignedRole: 'Tổ trưởng Tổ Toán - Tin học',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-15',
    tag: 'Hội họp',
    createdBy: 'Thầy Nguyễn Minh Triết',
    comments: [
      {
        id: 'c1_t3',
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng',
        content: 'Nhớ kết hợp chặt chẽ với Đoàn thanh niên để trang trí maket và sắp xếp đội ngũ tiếp tân thật chu đáo.',
        createdAt: '2026-05-30 09:12'
      }
    ],
    history: [
      {
        id: 'h1_t3',
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng',
        action: 'Đã khởi tạo công việc trọng tâm trường học',
        createdAt: '2026-05-29 11:00'
      }
    ]
  },
  {
    id: 'task_4',
    title: 'Chấm bài thi khảo sát năng lực đợt 3 học sinh khối 12',
    description: 'Chấm tự luận và ráp phách thi thử, tổng hợp phổ điểm môn Toán lớp 12 để gửi phòng khảo thí phân tích điểm mạnh yếu.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_nam',
    assignedName: 'Thầy Trần Hoàng Nam',
    assignedRole: 'Giáo viên Tổ Toán - Tin học',
    priority: 'CAO',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-08',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: [
      {
        id: 'h1_t4',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng',
        action: 'Đã giao bài chấm phách thi',
        createdAt: '2026-05-29 16:30'
      }
    ]
  },
  {
    id: 'task_5',
    title: 'Soạn thảo kế hoạch tuyển sinh lớp 10 năm học 2026 - 2027',
    description: 'Xác định chỉ tiêu tuyển sinh các lớp thường và lớp chuyên, phân bổ số phòng thi tuyển sinh, hồ sơ đăng ký dự tuyển và quy chế xét tuyển.',
    workspaceId: 'BGH',
    assignedId: 'user_triet',
    assignedName: 'Thầy Nguyễn Minh Triết',
    assignedRole: 'Hiệu trưởng (Trưởng ban Giám hiệu)',
    priority: 'CAO',
    status: 'HOAN_THANH',
    deadline: '2026-05-28',
    tag: 'Đột xuất',
    createdBy: 'Sở Giáo dục & Đào tạo',
    comments: [],
    history: [
      {
        id: 'h1_t5',
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng',
        action: 'Đã phê duyệt và phát hành bản cứng tới các tổ chuyên môn',
        createdAt: '2026-05-28 17:00'
      }
    ]
  },
  {
    id: 'task_6',
    title: 'Tổng kiểm tra, sửa chữa thiết bị điện và quạt máy phòng thi tốt nghiệp',
    description: 'Đảm bảo 40 phòng thi chính thức và phòng dự phòng hoạt động ổn định về ánh sáng, hệ thống làm mát phục vụ kỳ thi quốc gia.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_kha',
    assignedName: 'Thầy Nguyễn Văn Kha',
    assignedRole: 'Cán bộ Hành chính thiết bị',
    priority: 'CAO',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-12',
    tag: 'Báo cáo',
    createdBy: 'Thầy Nguyễn Minh Triết',
    comments: [],
    history: [
      {
        id: 'h1_t6',
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng',
        action: 'Đã giao việc ưu tiên kiểm tra hạ tầng mùa thi',
        createdAt: '2026-05-29 09:00'
      }
    ]
  },
  {
    id: 'task_7',
    title: 'Tổ chức chuyên đề đổi mới phương pháp giảng dạy Ngữ văn mới',
    description: 'Thực hiện 1 tiết dạy chuyên đề mẫu tích hợp công nghệ, áp dụng phương pháp sân khấu hóa tác phẩm định hướng năng lực học sinh.',
    workspaceId: 'VAN',
    assignedId: 'user_nhung',
    assignedName: 'Cô Phạm Hồng Nhung',
    assignedRole: 'Giáo viên Tổ Ngữ văn',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-10',
    tag: 'Chuyên môn',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [
      {
        id: 'c1_t7',
        userName: 'Thầy Vũ Tiến Đạt',
        userTitle: 'Tổ trưởng Tổ Ngữ văn',
        content: 'Cô Nhung có thể mời thêm đại diện Ban Giám hiệu cùng dự giờ đánh giá tiết dạy mẫu này nhé.',
        createdAt: '2026-05-29 10:11'
      }
    ],
    history: [
      {
        id: 'h1_t7',
        userName: 'Thầy Vũ Tiến Đạt',
        userTitle: 'Tổ trưởng Tổ Ngữ văn',
        action: 'Đã giao kế hoạch giảng soạn chuyên đề',
        createdAt: '2026-05-28 14:00'
      }
    ]
  },
  {
    id: 'task_8',
    title: 'Xây dựng kế hoạch ngày hội Open Day & Trải nghiệm mẫu cho phụ huynh khối tiểu học',
    description: 'Điều phối thiết kế các trạm trải nghiệm khoa học, nghệ thuật, thể chất và kịch nghệ. Chuẩn bị tài liệu brochure tuyển sinh học phí năm học tới.',
    workspaceId: 'TUYEN_SINH_PR',
    assignedId: 'user_pr_ts1',
    assignedName: 'Cô Mai Phương Thảo',
    assignedRole: 'Chuyên viên Tư vấn Chương trình đào tạo & CSKH',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-15',
    tag: 'Hoạt động',
    createdBy: 'Cô Vũ Khánh Chi',
    comments: [
      {
        id: 'c1_t8',
        userName: 'Cô Vũ Khánh Chi',
        userTitle: 'Trưởng phòng Tuyển sinh & PR',
        content: 'Cần chuẩn bị trước biểu mẫu đăng ký lớp học trải nghiệm trực tuyến để phụ huynh quét mã QR nhanh tại sảnh.',
        createdAt: '2026-05-29 15:30'
      }
    ],
    history: [
      {
        id: 'h1_t8',
        userName: 'Cô Vũ Khánh Chi',
        userTitle: 'Trưởng phòng Tuyển sinh & PR',
        action: 'Đã giao nhiệm vụ lên kịch bản trạm trải nghiệm',
        createdAt: '2026-05-29 11:00'
      }
    ]
  },
  {
    id: 'task_9',
    title: 'Kiểm định chất lượng giáo trình và phân phối chương trình song ngữ Cambridge khối trung học',
    description: 'Phối hợp với giáo viên bản xứ đối chiếu tiến độ giảng dạy, rà soát đề cương học phần Khoa học (Science) và Toán học (Maths) Quốc tế.',
    workspaceId: 'QUOC_TE',
    assignedId: 'user_qt_staff1',
    assignedName: 'Cô Trần Thanh Vân',
    assignedRole: 'Điều phối viên Học thuật song ngữ',
    priority: 'TRUNG_BINH',
    status: 'CHO_DUYET',
    deadline: '2026-06-08',
    tag: 'Chuyên môn',
    createdBy: 'Thầy David Miller',
    reportEvidence: 'Em đã hoàn thiện xong bảng đối chiếu tiến độ dạy song ngữ của tất cả các khối 10-11-12. Đã rà soát giáo án tuần tới và khớp với khung chuẩn của văn phòng Cambridge Anh Quốc. Kính trình Thầy phê chuẩn.',
    comments: [],
    history: [
      {
        id: 'h1_t9',
        userName: 'Thầy David Miller',
        userTitle: 'Giám đốc Chương trình Quốc tế',
        action: 'Giao kiểm tra rà soát giáo án và chương trình Cambridge song ngữ',
        createdAt: '25-05-2026'
      }
    ]
  },
  {
    id: 'task_10',
    title: 'Tổng hợp phân tích điểm đánh giá định kỳ và lập báo cáo Đảm bảo Chất lượng Học kỳ II',
    description: 'Thống kê kết quả phân bổ điểm số theo hình chuông, chỉ ra các tổ có độ lệnh chuẩn cao, đề xuất phương án phụ đạo bổ trợ cho học sinh yếu.',
    workspaceId: 'KHAO_THI',
    assignedId: 'user_kt_staff1',
    assignedName: 'Thầy Lưu Nhật Nam',
    assignedRole: 'Chuyên viên Kiểm định học vụ',
    priority: 'CAO',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-12',
    tag: 'Báo cáo',
    createdBy: 'Cô Đỗ Thùy Trang',
    comments: [],
    history: [
      {
        id: 'h1_t10',
        userName: 'Cô Đỗ Thùy Trang',
        userTitle: 'Trưởng phòng ĐBCL',
        action: 'Khởi tạo nhiệm vụ thống kê cơ sở dữ liệu điểm đợt cuối học kì',
        createdAt: '2026-05-30 08:30'
      }
    ]
  },
  {
    id: 'task_11',
    title: 'Tham vấn tâm lý và hỗ trợ xử lý tình huống nề nếp bán trú khối 10',
    description: 'Tiến hành gặp gỡ, tham vấn và hỗ trợ học sinh gặp khó khăn tâm lý. Lập lộ trình rèn luyện nề nếp và tính tự giác trong khu bán trú.',
    workspaceId: 'CTHS_TAM_LY',
    assignedId: 'user_tl_staff1',
    assignedName: 'Cô Nguyễn Minh Thư',
    assignedRole: 'Chuyên viên Tham vấn Tâm lý học đường',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-05',
    tag: 'Đột xuất',
    createdBy: 'Thầy Nguyễn Hoàng Hải',
    comments: [
      {
        id: 'c1_t11',
        userName: 'Thầy Nguyễn Hoàng Hải',
        userTitle: 'Tổ trưởng Công tác học sinh',
        content: 'Cô Thư lưu ý giữ bảo mật thông tin tham vấn của học sinh theo đúng nguyên tắc ứng xử học đường nhé.',
        createdAt: '2026-05-30 10:00'
      }
    ],
    history: [
      {
        id: 'h1_t11',
        userName: 'Thầy Nguyễn Hoàng Hải',
        userTitle: 'Tổ trưởng Công tác học sinh',
        action: 'Gửi yêu cầu tiếp nhận tham vấn ca tâm lý khẩn cấp',
        createdAt: '2026-05-30 09:15'
      }
    ]
  },
  {
    id: 'task_12',
    title: 'Họp rà soát nhà cung cấp và nghiệm thu an toàn vệ sinh thực phẩm bếp ăn bán trú học đường',
    description: 'Thực hiện kiểm tra đột xuất nguồn gốc nguyên liệu thực phẩm đầu vào, quy trình lưu mẫu thức ăn 24h và vệ sinh khử khuẩn khu vực sơ chế.',
    workspaceId: 'DICH_VU_HOC_DUONG',
    assignedId: 'user_dv_chef',
    assignedName: 'Cô Hoàng Kim Oanh',
    assignedRole: 'Tổng quản lý bếp ăn học đường',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-03',
    tag: 'Hội họp',
    createdBy: 'Thầy Phạm Thế Anh',
    comments: [],
    history: [
      {
        id: 'h1_t12',
        userName: 'Thầy Phạm Thế Anh',
        userTitle: 'Trưởng phòng Vận hành',
        action: 'Giao nhiệm vụ rà soát chất lượng phục vụ bữa ăn tập thể',
        createdAt: '2026-05-29 08:00'
      }
    ]
  },
  {
    id: 'task_demo_minh_1',
    title: 'Chỉ đạo rà soát và kiểm tra chất lượng đội tuyển thi HSG Quốc gia',
    description: 'Thầy Chủ tịch Hội đồng Trường chỉ đạo triển khai đợt kiểm tra đánh giá chuyên sâu đội tuyển học sinh giỏi môn Toán khối 11, 12 chuẩn bị cho kỳ tập huấn mới.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_nhan',
    assignedName: 'Cô Lê Thị Thanh Nhàn',
    assignedRole: 'Tổ trưởng Tổ Toán - Tin học',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-15',
    tag: 'Chuyên môn',
    createdBy: 'Thầy PGS.TS. Nguyễn Văn Minh',
    comments: [
      {
        id: 'cd1',
        userName: 'Thầy PGS.TS. Nguyễn Văn Minh',
        userTitle: 'Chủ tịch Hội đồng Trường',
        content: 'Chú ý tập trung vào rèn luyện tư duy thực chứng và phương pháp giải đề nâng cao đạt chuẩn chất lượng quốc tế.',
        createdAt: '2026-05-30 08:30'
      },
      {
        id: 'cd2',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng Toán - Tin',
        content: 'Dạ kính báo cáo Thầy, tổ chuyên môn đã biên soạn ngân hàng tài liệu chuẩn và đang thực hiện rà soát theo đúng tiến độ đề ra ạ.',
        createdAt: '2026-05-30 11:15'
      }
    ],
    history: [
      {
        id: 'hd1',
        userName: 'Thầy PGS.TS. Nguyễn Văn Minh',
        userTitle: 'Chủ tịch Hội đồng Trường',
        action: 'Đã trực tiếp ban hành chỉ đạo và giao nhiệm vụ cho Cô Lê Thị Thanh Nhàn',
        createdAt: '2026-05-30 08:00'
      },
      {
        id: 'hd2',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng Toán - Tin',
        action: 'Đã chuyển trạng thái sang Đang tiến hành và phân công cán bộ',
        createdAt: '2026-05-30 09:00'
      }
    ]
  },
  {
    id: 'task_demo_minh_2',
    title: 'Thanh tra đột xuất công tác an toàn thiết bị phòng thi tốt nghiệp THPT',
    description: 'Báo cáo nghiệm thu công tác chuẩn bị cơ sở vật chất phòng thi tốt nghiệp THPT và phương án phân luồng đón trả học sinh an toàn.',
    workspaceId: 'DICH_VU_HOC_DUONG',
    assignedId: 'user_dv_mgr',
    assignedName: 'Thầy Phạm Thế Anh',
    assignedRole: 'Trưởng phòng Khai thác Dịch vụ phụ trợ & Vận hành',
    priority: 'CAO',
    status: 'CHO_DUYET',
    deadline: '2026-06-02',
    tag: 'Kiểm tra',
    createdBy: 'Thầy PGS.TS. Nguyễn Văn Minh',
    reportEvidence: 'Kính gửi Ban Giám hiệu, Phòng Vận hành đã phối hợp kiểm tra kỹ thuật 45 phòng máy thi chính thức. Đã thay thế 3 quạt thông gió và 5 điều hòa hỏng, đồng thời bố trí lối đi khép kín để bảo đảm an toàn trong kỳ thi (Minh chứng đính kèm: https://images.unsplash.com/photo-1497366216548-37526070297c?w=600).',
    comments: [
      {
        id: 'cd3',
        userName: 'Thầy Phạm Thế Anh',
        userTitle: 'Trưởng phòng Vận hành',
        content: 'Kính gửi Thầy Chủ tịch, chúng em đã đính kèm ảnh minh chứng thực tế để Ban Giám hiệu phê duyệt.',
        createdAt: '2026-05-31 09:15'
      }
    ],
    history: [
      {
        id: 'hd3',
        userName: 'Thầy PGS.TS. Nguyễn Văn Minh',
        userTitle: 'Chủ tịch Hội đồng Trường',
        action: 'Đã trực tiếp ban hành chỉ đạo khẩn',
        createdAt: '2026-05-30 08:30'
      },
      {
        id: 'hd4',
        userName: 'Thầy Phạm Thế Anh',
        userTitle: 'Trưởng phòng Vận hành',
        action: 'Đã nộp báo cáo kèm minh chứng thực tế tại cơ sở',
        createdAt: '2026-05-31 09:15'
      }
    ]
  },
  {
    id: 'task_13',
    title: 'Quyết toán tài chính Quý I năm học & Nộp báo cáo kiểm toán nội bộ',
    description: 'Thực hiện đối chiếu sổ sách, công nợ học phí học sinh và báo cáo chi tiết ngân sách thu chi cho Ban điều hành cùng Chủ tịch Hội đồng Trường.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_accountant',
    assignedName: 'Cô Lê Thị Kim Oanh',
    assignedRole: 'Kế toán trưởng MIS',
    priority: 'CAO',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-10',
    tag: 'Hành chính',
    createdBy: 'HVL',
    comments: [],
    history: [
      {
        id: 'h1_t13',
        userName: 'HVL',
        userTitle: 'Giám đốc Điều hành (CEO)',
        action: 'Yêu cầu kế toán trưởng lập báo cáo quý',
        createdAt: '2026-05-29 10:00'
      }
    ]
  },
  {
    id: 'task_14',
    title: 'Tổ chức Ngày Hội Trải Nghiệm Đa Trí Tuệ - MIS Open Day 2026',
    description: 'Xây dựng kế hoạch truyền thông, phân luồng đón tiếp phụ huynh, trang trí 8 khu vực tượng trưng cho 8 loại hình trí thông minh và chuẩn bị quà tặng lưu niệm.',
    workspaceId: 'TUYEN_SINH_PR',
    assignedId: 'user_pr_mgr',
    assignedName: 'Cô Nguyễn Thị Hoa',
    assignedRole: 'Trưởng phòng Tuyển sinh & Truyền thông',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-18',
    tag: 'Sự kiện',
    createdBy: 'HVL',
    comments: [
      {
        id: 'c1_t14',
        userName: 'HVL',
        userTitle: 'Giám đốc Điều hành (CEO)',
        content: 'Cần phối hợp với Tổ CTHS để chuẩn bị đón tiếp học sinh tiểu học chuyển cấp thật chu đáo.',
        createdAt: '2026-05-30 16:20'
      }
    ],
    history: [
      {
        id: 'h1_t14',
        userName: 'HVL',
        userTitle: 'Giám đốc Điều hành (CEO)',
        action: 'Phê duyệt chủ trương và ngân sách tổ chức Open Day 2026',
        createdAt: '2026-05-29 11:30'
      }
    ]
  },
  {
    id: 'task_15',
    title: 'Tuyển dụng giáo viên bản ngữ giảng dạy IELTS học kỳ I 2026/27',
    description: 'Thực hiện phỏng vấn thử, kiểm tra chứng chỉ TESOL/TEFL, và thương thảo hợp đồng với 3 giáo viên nước ngoài phụ trách đầu ra IELTS khối THPT.',
    workspaceId: 'QUOC_TE',
    assignedId: 'user_intl_coord',
    assignedName: 'Thầy Nicholas John',
    assignedRole: 'Điều phối viên Ban Chương trình Quốc tế',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-25',
    tag: 'Chuyên môn',
    createdBy: 'Thầy Nguyễn Minh Triết',
    comments: [],
    history: [
      {
        id: 'h1_t15',
        userName: 'Thầy Nguyễn Minh Triết',
        userTitle: 'Hiệu trưởng',
        action: 'Giao Ban Quốc tế tuyển dụng bổ sung nhân lực chất lượng cao',
        createdAt: '2026-05-30 14:00'
      }
    ]
  },
  {
    id: 'task_16',
    title: 'Rà soát ý kiến phản hồi chất lượng đào tạo và đề xuất cải tiến học bạ',
    description: 'Tổng hợp số liệu khảo sát ý kiến phụ huynh về chất lượng dạy học của giáo viên bộ môn qua phiếu khảo sát định chuẩn học đường cuối năm.',
    workspaceId: 'KHAO_THI',
    assignedId: 'user_exam_officer',
    assignedName: 'Thầy Nguyễn Khắc Thành',
    assignedRole: 'Cán bộ khảo thí chất lượng',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-12',
    tag: 'Kiểm tra',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_17',
    title: 'Xuất bản nội san Văn học Đa Trí Tuệ - Chủ đề Nắng Mùa Hạ',
    description: 'Biên tập, tuyển chọn các tác phẩm tản văn, bài thơ và phóng sự ảnh của các nhóm học sinh xuất sắc thuộc chuyên đề Sáng tạo nghệ thuật.',
    workspaceId: 'VAN',
    assignedId: 'user_van_teacher',
    assignedName: 'Thầy Trần Hữu Nghĩa',
    assignedRole: 'Giáo viên Tổ Ngữ văn',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-20',
    tag: 'Sự kiện',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_18',
    title: 'Kế hoạch tổ chức Hội trại kỹ năng sinh thái ngoài trời học sinh THCS',
    description: 'Toàn bộ chiến dịch dã ngoại rèn luyện kỹ năng sinh tồn, nhận diện thực vật rừng quốc gia Cúc Phương cho toàn bộ học sinh khối 8, 9.',
    workspaceId: 'CTHS_TAM_LY',
    assignedId: 'user_cths_officer',
    assignedName: 'Thầy Đỗ Văn Lâm',
    assignedRole: 'Cán bộ phụ trách phong trào Đoàn Đội',
    priority: 'TRUNG_BINH',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-22',
    tag: 'Sự kiện',
    createdBy: 'Thầy Nguyễn Hoàng Hải',
    comments: [],
    history: []
  },
  {
    id: 'task_19',
    title: 'Phê duyệt chiến lược chuyển đổi số toàn diện hệ thống MIS Smart School',
    description: 'Nghiên cứu, thông qua dự án trang bị màn hình tương tác thông minh cho 100% phòng học của nhà trường và tích hợp hệ thống phần mềm quản lý học vụ hiện đại.',
    workspaceId: 'BGH',
    assignedId: 'user_chutich',
    assignedName: 'Thầy PGS.TS. Nguyễn Văn Minh',
    assignedRole: 'Chủ tịch Hội đồng Trường',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-15',
    tag: 'Hành chính',
    createdBy: 'Thầy PGS.TS. Nguyễn Văn Minh',
    comments: [],
    history: []
  },
  {
    id: 'task_20',
    title: 'Bảo trì hệ thống phòng máy tính thực nghiệm Robotics & Trí tuệ Nhân tạo',
    description: 'Kiểm tra phần cứng các bộ kit Arduino, Raspberry Pi, và cài đặt lại hệ điều hành hỗ trợ lập trình Scratch, Python cho khối CLB Công nghệ thông tin chuyên sâu.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_cs_teacher',
    assignedName: 'Cô Hoàng Khánh Linh',
    assignedRole: 'Giáo viên Tin học',
    priority: 'TRUNG_BINH',
    status: 'HOAN_THANH',
    deadline: '2026-05-30',
    tag: 'Kiểm tra',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: [
      {
        id: 'h1_t20',
        userName: 'Cô Lê Thị Thanh Nhàn',
        userTitle: 'Tổ trưởng Toán - Tin',
        action: 'Tạo nhiệm vụ bảo trì phòng Robotics',
        createdAt: '2026-05-25 08:00'
      },
      {
        id: 'h2_t20',
        userName: 'Cô Hoàng Khánh Linh',
        userTitle: 'Giáo viên Tin học',
        action: 'Đã hoàn thành kiểm tra và bàn giao lại phòng máy hoạt động 100% đạt chuẩn',
        createdAt: '2026-05-30 16:45'
      }
    ]
  },
  {
    id: 'task_21',
    title: 'Đánh giá xếp hạng và ký phụ lục vận hành xe buýt trường học năm 2026',
    description: 'Làm việc với đối tác vận tải rà soát camera giám sát hành trình xe, thiết bị cảnh báo bỏ quên trẻ trên xe và tinh chỉnh luồng đưa đón tránh ùn tắc đầu giờ.',
    workspaceId: 'DICH_VU_HOC_DUONG',
    assignedId: 'user_dv_mgr',
    assignedName: 'Thầy Phạm Thế Anh',
    assignedRole: 'Trưởng phòng Vận hành',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-08',
    tag: 'Hành chính',
    createdBy: 'Thầy Ngô Anh Tuấn',
    comments: [],
    history: []
  },
  {
    id: 'task_22',
    title: 'Triển khai công nợ và tập huấn nghiệp vụ thu ngân học phí hè',
    description: 'Phân tích tổng hợp, rà soát lỗi tích hợp thanh toán mã QR động trên ứng dụng phụ huynh cổng thông tin học vụ MIS.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_accountant',
    assignedName: 'Cô Lê Thị Kim Oanh',
    assignedRole: 'Kế toán trưởng',
    priority: 'TRUNG_BINH',
    status: 'HOAN_THANH',
    deadline: '2026-05-28',
    tag: 'Hành chính',
    createdBy: 'HVL',
    comments: [],
    history: []
  },
  {
    id: 'task_23',
    title: 'Đăng ký và duyệt chỉ tiêu cấp phép hoạt động trường hè Quốc tế song ngữ',
    description: 'Chuẩn bị hồ sơ pháp chế gửi Sở Giáo dục Đào tạo đăng ký danh mục các khóa bồi dưỡng ngắn hạn Đa trí tuệ hè năm 2026.',
    workspaceId: 'BGH',
    assignedId: 'user_triet',
    assignedName: 'Thầy Nguyễn Minh Triết',
    assignedRole: 'Hiệu trưởng',
    priority: 'CAO',
    status: 'CHO_DUYET',
    deadline: '2026-06-02',
    tag: 'Hành chính',
    createdBy: 'Thầy PGS.TS. Nguyễn Văn Minh',
    comments: [],
    history: []
  },
  {
    id: 'task_24',
    title: 'Bồi dưỡng chuyên đề Đại số nâng cao cho học sinh mũi nhọn 11A1',
    description: 'Biên soạn tài liệu nâng cao chuyên sâu về Hệ phương trình và Tổ hợp toán học phục vụ đội tuyển tham gia thi Học sinh giỏi Cờ đỏ Học viện.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_thai',
    assignedName: 'Thầy Lê Quốc Thái',
    assignedRole: 'Giáo viên Toán Đại số khối 11',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-12',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_25',
    title: 'Biên soạn giáo án ôn tập Giải tích chuyên đề giới hạn và tiệm cận',
    description: 'Xây dựng chuyên đề bài giảng PowerPoint tích hợp công nghệ tương tác, bám sát các dạng toán trắc nghiệm thế hệ mới của Bộ GD&ĐT.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_thao',
    assignedName: 'Cô Vũ Thu Thảo',
    assignedRole: 'Giáo viên Toán Giải tích khối 12',
    priority: 'TRUNG_BINH',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-15',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_26',
    title: 'Biên soạn ngân hàng bài tập lập trình Python nâng cao cho khối chuyên',
    description: 'Xây dựng 25 bài tập thực hành thuật toán sắp xếp, quy hoạch động và đệ quy ứng dụng trong dạy tin học nâng cao định chuẩn thi học sinh giỏi.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_dang',
    assignedName: 'Thầy Phan Hải Đăng',
    assignedRole: 'Giáo viên Lập trình C++ / Python',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-09',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_27',
    title: 'Thiết kế học cụ mô hình không gian 3D tương tác lớp 10',
    description: 'Làm mô hình hình học trực quan giúp học sinh nhận biết góc giữa đường thẳng và mặt phẳng trong không gian hình học lớp 10.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_linh',
    assignedName: 'Cô Đặng Khánh Linh',
    assignedRole: 'Giáo viên Toán Hình học khối 10',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-20',
    tag: 'Hoạt động',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_28',
    title: 'Kiểm tra bảo dưỡng phòng máy tính thi nghề khối THCS',
    description: 'Rà soát cài đặt phần mềm Excel kĩ năng văn phòng, kiểm tra tốc độ đường truyền mạng nội bộ phòng máy 2 phục vụ kỳ thi đánh giá chuyển cấp.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_quan',
    assignedName: 'Thầy Trịnh Minh Quân',
    assignedRole: 'Giáo viên Tin học Văn phòng & nghề',
    priority: 'TRUNG_BINH',
    status: 'HOAN_THANH',
    deadline: '2026-06-01',
    tag: 'Kiểm tra',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_29',
    title: 'Biên soạn đề kiểm tra trắc nghiệm Ngữ văn 12 theo định hướng mới',
    description: 'Xây dựng ma trận đề kiểm tra đánh giá rèn luyện năng lực đọc hiểu văn bản ngoài sách giáo khoa bám sát kỳ thi THPT Quốc gia năm học tới.',
    workspaceId: 'VAN',
    assignedId: 'user_van_mai',
    assignedName: 'Cô Nguyễn Tuyết Mai',
    assignedRole: 'Giáo viên Lịch sử Văn học lớp 12',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-10',
    tag: 'Chuyên môn',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_30',
    title: 'Xây dựng đề án tập huấn nâng cao đội tuyển HSG Văn khối 12',
    description: 'Tuyển chọn tư liệu lý luận văn học chuyên sâu, lên khung bài luận chuyên biệt hỗ trợ học sinh có tư duy tự sự độc lập xuất sắc.',
    workspaceId: 'VAN',
    assignedId: 'user_van_bao',
    assignedName: 'Thầy Đinh Gia Bảo',
    assignedRole: 'Giáo viên Ngữ văn nâng cao khối tuyển',
    priority: 'CAO',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-15',
    tag: 'Chuyên môn',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_31',
    title: 'Hội thảo Đổi mới Sinh hoạt chuyên môn Tổ Ngữ văn đợt II',
    description: 'Lập báo cáo tóm tắt phân tích kết quả ứng dụng sơ đồ tư duy phân tích kết cấu truyện ngắn Việt Nam hiện đại.',
    workspaceId: 'VAN',
    assignedId: 'user_van_vi',
    assignedName: 'Cô Huỳnh Thúy Vi',
    assignedRole: 'Giáo viên Ngữ văn trung đại Việt Nam',
    priority: 'TRUNG_BINH',
    status: 'HOAN_THANH',
    deadline: '2026-05-29',
    tag: 'Hội họp',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_32',
    title: 'Triển khai tuần lễ thuyết trình đọc thảo luận Văn học nước ngoài',
    description: 'Lên lịch trình theo dõi báo cáo của các nhóm, định chuẩn tiêu chí chấm điểm thuyết trình tiếng Việt mượt mà của học sinh khối 11.',
    workspaceId: 'VAN',
    assignedId: 'user_van_bich',
    assignedName: 'Cô Lưu Ngọc Bích',
    assignedRole: 'Giáo viên Văn học thế giới',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-18',
    tag: 'Hoạt động',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_33',
    title: 'Xây dựng thiết chế rà soát tài sản cơ sở vật chất cuối kỳ hiệu quả',
    description: 'Xác lập quy chuẩn ghi nhận hư hại bàn ghế bục giảng, lập tờ trình xin phê chuẩn kinh tế sửa chữa phòng họp hội đồng giáo viên.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_ha',
    assignedName: 'Thầy Triệu Quang Hà',
    assignedRole: 'Cán bộ Thanh tra Kiểm soát nội bộ',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-08',
    tag: 'Kiểm tra',
    createdBy: 'HVL',
    comments: [],
    history: []
  },
  {
    id: 'task_34',
    title: 'Kiểm tra đồng bộ học bạ số đối lưu lên CSDL quốc gia',
    description: 'Hoàn thành hồ sơ rà soát mã định danh, điểm tổng kết khối 12 đồng bộ mượt mà vào cổng giáo dục quốc gia của Sở Giáo dục Đào tạo.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_dung',
    assignedName: 'Cô Tống Phương Dung',
    assignedRole: 'Cán bộ Văn thư lưu trữ học bạ học sinh',
    priority: 'CAO',
    status: 'CHO_DUYET',
    deadline: '2026-06-06',
    tag: 'Báo cáo',
    createdBy: 'Thầy Nguyễn Minh Triết',
    reportEvidence: 'Biên bản số 45 đã hoàn thành đối chiếu chéo số học sinh là 452 em khối 12, không lỗi trường thuộc tính định danh. Toàn bộ danh mục học viện đã sẵn sàng trình lãnh đạo ký đóng dấu số.',
    comments: [],
    history: []
  },
  {
    id: 'task_35',
    title: 'Tổng hợp nhu cầu văn phòng phẩm cho năm học mới',
    description: 'Phát phiếu tổng hợp nhu cầu giấy thi, sổ điểm danh, mực in văn phòng, xây dựng phương án phân bổ hợp lý theo nhân sự từng phòng ban.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_thuan',
    assignedName: 'Thầy Lâm Vĩnh Thuận',
    assignedRole: 'Cán bộ Kế toán tài sản & Kho vật tư',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-25',
    tag: 'Hành chính',
    createdBy: 'Cô Hoàng Trúc Liên',
    comments: [],
    history: []
  },
  {
    id: 'task_36',
    title: 'Giải ngân hoàn thuế cho giáo viên đi tập huấn nước ngoài',
    description: 'Thực hiện kết chuyển chứng từ kế toán nhà trường, xác minh tính phù hợp thuế thu nhập cá nhân đúng pháp luật Việt Nam.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_hanh',
    assignedName: 'Cô Lương Mỹ Hạnh',
    assignedRole: 'Thủ quỹ trường học kiêm Ban Tài chính',
    priority: 'TRUNG_BINH',
    status: 'HOAN_THANH',
    deadline: '2026-05-30',
    tag: 'Hành chính',
    createdBy: 'Cô Hoàng Trúc Liên',
    comments: [],
    history: []
  },
  {
    id: 'task_37',
    title: 'Thiết kế chiến dịch truyền thông đa kênh tuyển sinh bổ sung hè',
    description: 'Lập kế hoạch thiết kế hình ảnh, thiết lập quảng cáo Facebook và Google để tiếp cận phụ huynh quan tâm chương trình học hè MIS Smart Summer.',
    workspaceId: 'TUYEN_SINH_PR',
    assignedId: 'user_pr_mkt',
    assignedName: 'Thầy Nguyễn Tiến Đạt',
    assignedRole: 'Chuyên viên Marketing & Tổ chức Sự kiện School Tour',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-07',
    tag: 'Hoạt động',
    createdBy: 'Cô Vũ Khánh Chi',
    comments: [],
    history: []
  },
  {
    id: 'task_38',
    title: 'Biên dịch câu hỏi ôn tập chứng chỉ giáo viên quốc tế',
    description: 'Hỗ trợ dịch thuật tài liệu kiểm chuẩn chuyên môn Cambridge, thiết lập hệ thống chấm điểm tự động trên Google Sheets.',
    workspaceId: 'QUOC_TE',
    assignedId: 'user_qt_staff2',
    assignedName: 'Thầy Jack Harrison',
    assignedRole: 'Chuyên gia Luyện thi IELTS, SAT & ACT khối chuyên',
    priority: 'TRUNG_BINH',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-14',
    tag: 'Chuyên môn',
    createdBy: 'Thầy David Miller',
    comments: [],
    history: []
  },
  {
    id: 'task_39',
    title: 'Tổng hợp phân tích phản hồi phụ huynh đợt thi thử IELTS đợt I',
    description: 'Phân tích các phản hồi tiêu cực về tính bảo mật của phòng thi, đề xuất cải tiến phòng thi bảo đảm cách âm tiêu chuẩn quốc tế.',
    workspaceId: 'KHAO_THI',
    assignedId: 'user_kt_staff2',
    assignedName: 'Cô Bùi Hà My',
    assignedRole: 'Cán bộ Thanh tra Chương trình & Lấy ý kiến Phụ huynh',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-08',
    tag: 'Báo cáo',
    createdBy: 'Cô Đỗ Thùy Trang',
    comments: [],
    history: []
  },
  {
    id: 'task_40',
    title: 'Nâng cấp nội quy kỷ luật tích cực ký túc xá bán trú',
    description: 'Xây dựng thang điểm thi đua ký túc xá, tăng cường các chuyên đề chia sẻ lối sống tự lập văn minh cho học sinh nội trú.',
    workspaceId: 'CTHS_TAM_LY',
    assignedId: 'user_tl_staff2',
    assignedName: 'Cô Lê Quỳnh Chi',
    assignedRole: 'Quản lý khu Ký túc xá học sinh & Trật tự cơ sở',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-18',
    tag: 'Báo cáo',
    createdBy: 'Thầy Nguyễn Hoàng Hải',
    comments: [],
    history: []
  },
  {
    id: 'task_41',
    title: 'Lập bản đồ lộ trình xe buýt trường học năm học 2026/27',
    description: 'Tinh chỉnh 15 tuyến xe đưa đón, bổ sung điểm dừng tại các ngõ hẹp, phân chia giờ khởi hành tối ưu tránh trễ học sinh và giảm thiểu chi phí xăng dầu.',
    workspaceId: 'DICH_VU_HOC_DUONG',
    assignedId: 'user_dv_bus',
    assignedName: 'Thầy Trương Quốc Bảo',
    assignedRole: 'Điều phối viên Mạng lưới Xe bus đưa đón học sinh toàn thành phố',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-10',
    tag: 'Chuyên môn',
    createdBy: 'Thầy Phạm Thế Anh',
    comments: [],
    history: []
  },
  {
    id: 'task_42',
    title: 'Lập biểu đồ theo dõi sức khỏe học sinh cuối cấp đợt nắng nóng hè',
    description: 'Phổ biến tủ thuốc cơ bản phòng say nắng say nóng đến 100% giáo viên chủ nhiệm khối 12, kiểm soát vệ sinh an toàn sức khỏe thi THPT.',
    workspaceId: 'DICH_VU_HOC_DUONG',
    assignedId: 'user_dv_nurse',
    assignedName: 'Cô Ngô Khánh Linh',
    assignedRole: 'Y tá trưởng phụ trách sức khoẻ học vụ & tủ thuốc sơ cấp cứu',
    priority: 'CAO',
    status: 'CHO_DUYET',
    deadline: '2026-06-05',
    tag: 'Báo cáo',
    createdBy: 'Thầy Phạm Thế Anh',
    reportEvidence: 'Đã hoàn tất huấn luyện y tế sơ cứu cho 12 giáo viên chủ nhiệm khối 12. Tủ thuốc phòng thi đã trang bị đầy đủ trà sâm, nước oresol giải nhiệt bổ sung điện giải nhanh chóng.',
    comments: [],
    history: []
  },
  {
    id: 'task_43',
    title: 'Học tập nghiên cứu đề án giáo án bồi dưỡng Toán tuyển sinh Olympic trẻ',
    description: 'Tổng hợp tài liệu đại số và giải tích nâng cao từ các trường chuyên trên cả nước cho học sinh mũi nhọn khối 10.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_trang',
    assignedName: 'Cô Phạm Kiều Trang',
    assignedRole: 'Giáo viên Toán bồi dưỡng học sinh giỏi',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-12',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_44',
    title: 'Thiết kế bài giảng chuyên đề Tài chính cá nhân cho học sinh THPT',
    description: 'Thiết kế giáo án tích hợp kỹ năng quản lý ngân sách cá nhân, đầu tư cơ bản và vận dụng kiến thức toán học vào quản lý chi tiêu.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_hoang',
    assignedName: 'Thầy Nguyễn Văn Hoàng',
    assignedRole: 'Giáo viên chuyên đề Toán ứng dụng',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-22',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_45',
    title: 'Cập nhật hệ thống bài tập HTML/CSS/JS cho Học kỳ hè',
    description: 'Xây dựng 8 trạm lập trình web mini trên nền tảng CodePen tạo không khí vui tươi tự giác cho học sinh tham gia học hè khoa học máy tính.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_yen',
    assignedName: 'Cô Đỗ Hoàng Yến',
    assignedRole: 'Giáo viên Lập trình Web khối chuyên',
    priority: 'TRUNG_BINH',
    status: 'HOAN_THANH',
    deadline: '2026-05-28',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_46',
    title: 'Thiết lập ngân hàng đề Toán tuyển sinh khối 10 hệ chất lượng cao',
    description: 'Thiết kế cấu trúc đề thi đa trí tuệ đánh giá tư duy hình học trực quan, giới hạn thời gian thực nghiệm chặt chẽ.',
    workspaceId: 'TOAN_TIN',
    assignedId: 'user_toan_dao',
    assignedName: 'Thầy Bùi Quang Đạo',
    assignedRole: 'Giáo viên Toán lớp chất lượng cao',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-08',
    tag: 'Chuyên môn',
    createdBy: 'Cô Lê Thị Thanh Nhàn',
    comments: [],
    history: []
  },
  {
    id: 'task_47',
    title: 'Tổng kết cuộc thi viết thư quốc tế UPU cấp trường',
    description: 'Tập hợp các bài viết xuất sắc gửi cục bưu điện quốc gia, chấm điểm sơ khảo khen thưởng thi đua cấp trường cho học sinh đạt giải.',
    workspaceId: 'VAN',
    assignedId: 'user_van_my',
    assignedName: 'Cô Hoàng Diễm My',
    assignedRole: 'Giáo viên Sáng tạo viết chuẩn tư duy',
    priority: 'THAP',
    status: 'HOAN_THANH',
    deadline: '2026-05-27',
    tag: 'Kiểm tra',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_48',
    title: 'Nghiên cứu tài liệu tham khảo cho bộ sách giáo khoa mới',
    description: 'So sánh cấu trúc phân môn tổ chức bài học môn Ngữ văn bổ trợ giữa các nhà xuất bản sách giáo dục uy tín.',
    workspaceId: 'VAN',
    assignedId: 'user_van_huong',
    assignedName: 'Cô Ngô Vũ Quỳnh Hương',
    assignedRole: 'Giáo viên Lý luận văn học chuyên sâu',
    priority: 'TRUNG_BINH',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-11',
    tag: 'Chuyên môn',
    createdBy: 'Thầy Vũ Tiến Đạt',
    comments: [],
    history: []
  },
  {
    id: 'task_49',
    title: 'Bảo trì sửa chữa hệ thống bộ phát Wi-Fi phục vụ học đường',
    description: 'Kiểm tra hoạt động đo lường băng thông mạng tại sảnh chờ Ban Giám hiệu và phòng thiết bị số Tổ văn phòng bảo đảm an toàn kết nối thi trực tuyến.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_son',
    assignedName: 'Thầy Cao Thanh Sơn',
    assignedRole: 'Chuyên viên kỹ thuật hạ tầng thông tin',
    priority: 'CAO',
    status: 'DANG_TIEN_HANH',
    deadline: '2026-06-06',
    tag: 'Kiểm tra',
    createdBy: 'Cô Hoàng Trúc Liên',
    comments: [],
    history: []
  },
  {
    id: 'task_50',
    title: 'Số hóa và bảo tồn đầu mục sách khoa học giáo dục quý',
    description: 'Số hóa và lưu trữ tài liệu sư phạm lịch sử để phục vụ giáo viên nghiên cứu, giảng dạy chất lượng cao.',
    workspaceId: 'HANH_CHINH',
    assignedId: 'user_hc_vy',
    assignedName: 'Cô Dương Ái Vy',
    assignedRole: 'Cán bộ Thư viện số & Nghiên cứu',
    priority: 'THAP',
    status: 'CHUA_BAT_DA',
    deadline: '2026-06-25',
    tag: 'Hành chính',
    createdBy: 'Cô Hoàng Trúc Liên',
    comments: [],
    history: []
  }
];

export const MOCK_ASSETS: any[] = [
  { id: 'ast_1', code: 'TS-CNTT-001', name: 'Laptop Dell Vostro 3520 (Lab AI)', category: 'CNTT', location: 'Phòng Lab AI 1', status: 'DANG_SU_DUNG', condition: 'MOI', purchaseDate: '2025-08-15', assignedTo: 'user_nam', assignedName: 'Thầy Trần Hoàng Nam' },
  { id: 'ast_2', code: 'TS-CNTT-002', name: 'Máy chiếu Epson EH-TW7000', category: 'THIET_BI_GIANG_DAY', location: 'Phòng học 302', status: 'SAN_SANG', condition: 'TOT', purchaseDate: '2024-05-10', lastMaintenanceDate: '2026-01-15' },
  { id: 'ast_3', code: 'TS-NT-001', name: 'Bàn giáo viên cao cấp gỗ Sồi', category: 'NOI_THAT', location: 'Phòng học 405', status: 'DANG_SU_DUNG', condition: 'KHA', purchaseDate: '2023-12-01' },
  { id: 'ast_4', code: 'TS-TV-001', name: 'Kệ sách thông minh thư viện', category: 'THU_VIEN', location: 'Thư viện Tầng 2', status: 'SAN_SANG', condition: 'TOT', purchaseDate: '2024-10-20' },
  { id: 'ast_5', code: 'TS-CNTT-005', name: 'Tivi Sony 4K 65 inch', category: 'THIET_BI_GIANG_DAY', location: 'Phòng học 405', status: 'DANG_SUA_CHUA', condition: 'HONG', purchaseDate: '2025-01-15', lastMaintenanceDate: '2026-05-20' },
  { id: 'ast_6', code: 'TS-CNTT-006', name: 'Màn hình tương tác ViewSonic 75"', category: 'THIET_BI_GIANG_DAY', location: 'Phòng học 301', status: 'SAN_SANG', condition: 'MOI', purchaseDate: '2026-02-10' },
  { id: 'ast_7', code: 'TS-NT-002', name: 'Tủ đựng thiết bị phòng Lab', category: 'NOI_THAT', location: 'Phòng Lab AI 1', status: 'SAN_SANG', condition: 'TOT', purchaseDate: '2025-08-15' },
  { id: 'ast_8', code: 'TS-CNTT-008', name: 'Router Wifi Cisco Enterprise', category: 'CNTT', location: 'Phòng Server Tầng 3', status: 'DANG_SU_DUNG', condition: 'TOT', purchaseDate: '2024-09-05', lastMaintenanceDate: '2026-03-01' },
  { id: 'ast_9', code: 'TS-KHAC-001', name: 'Máy điều hòa Daikin 18000BTU', category: 'KHAC', location: 'Phòng Hội đồng', status: 'DANG_SU_DUNG', condition: 'KHA', purchaseDate: '2023-04-12', nextMaintenanceDate: '2026-07-15' },
  { id: 'ast_10', code: 'TS-CNTT-010', name: 'Máy in Canon LBP2900', category: 'CNTT', location: 'Văn phòng Hành chính', status: 'THANH_LY', condition: 'HONG', purchaseDate: '2021-02-20' }
];

export const MOCK_ASSET_HANDOVERS: any[] = [
  { id: 'ho_1', assetId: 'ast_1', assetCode: 'TS-CNTT-001', assetName: 'Laptop Dell Vostro 3520 (Lab AI)', receiverId: 'user_nam', receiverName: 'Thầy Trần Hoàng Nam', receiverRole: 'TEACHER', location: 'Phòng Lab AI 1', handoverDate: '2025-09-05', conditionAtHandover: 'Mới 100%, kèm sạc', status: 'DA_BAN_GIAO', approvedBy: 'user_kha' },
  { id: 'ho_2', assetId: 'ast_6', assetCode: 'TS-CNTT-006', assetName: 'Màn hình tương tác ViewSonic 75"', receiverId: 'user_nhan', receiverName: 'Cô Lê Thị Thanh Nhàn', receiverRole: 'MANAGER', location: 'Phòng học 301', handoverDate: '2026-06-15', conditionAtHandover: 'Mới, đủ phụ kiện', status: 'CHO_DUYET', notes: 'Giáo viên yêu cầu mượn dùng thi giáo viên giỏi' }
];

export const MOCK_ASSET_TRANSFERS: any[] = [
  { id: 'tr_1', assetId: 'ast_2', assetCode: 'TS-CNTT-002', assetName: 'Máy chiếu Epson EH-TW7000', fromLocation: 'Phòng học 301', toLocation: 'Phòng học 302', requestDate: '2026-05-10', transferDate: '2026-05-11', status: 'DA_CHUYEN', requestedBy: 'user_dat', requestorName: 'Thầy Vũ Tiến Đạt', approvedBy: 'user_kha', reason: 'Phòng 301 sửa chữa trần nhà' },
  { id: 'tr_2', assetId: 'ast_3', assetCode: 'TS-NT-001', assetName: 'Bàn giáo viên cao cấp gỗ Sồi', fromLocation: 'Phòng học 405', toLocation: 'Phòng học 101', requestDate: '2026-06-20', status: 'CHO_DUYET', requestedBy: 'user_nhung', requestorName: 'Cô Phạm Hồng Nhung', reason: 'Phòng 101 bị hỏng bàn giáo viên' }
];

export const MOCK_MAINTENANCE_REPORTS: any[] = [
  { id: 'mr_1', assetId: 'ast_5', assetCode: 'TS-CNTT-005', assetName: 'Tivi Sony 4K 65 inch', reportedBy: 'user_hoa', reporterName: 'Cô Trịnh Thúy Hoa', reportDate: '2026-06-18', issueDescription: 'Màn hình bị sọc ngang, không lên hình khi cắm HDMI', priority: 'CAO', status: 'DANG_SUA', assignedTechnician: 'user_son' },
  { id: 'mr_2', assetId: 'ast_9', assetCode: 'TS-KHAC-001', assetName: 'Máy điều hòa Daikin 18000BTU', reportedBy: 'user_binh_mgr', reporterName: 'Cô Hoàng Trúc Liên', reportDate: '2026-05-25', issueDescription: 'Điều hòa không mát, kêu to', priority: 'TRUNG_BINH', status: 'DA_HOAN_THANH', assignedTechnician: 'user_son', completionDate: '2026-05-26', resolutionNotes: 'Đã bơm thêm gas và vệ sinh cục nóng' },
  { id: 'mr_3', assetId: 'ast_10', assetCode: 'TS-CNTT-010', assetName: 'Máy in Canon LBP2900', reportedBy: 'user_binh', reporterName: 'Thầy Phạm Thanh Bình', reportDate: '2026-06-21', issueDescription: 'Kẹt giấy liên tục, in bị lem mực', priority: 'CAO', status: 'CHO_TIEP_NHAN' }
];

export const MOCK_INVENTORY_ITEMS: any[] = [
  { id: 'inv_1', code: 'VT-VPP-001', name: 'Giấy in A4 Double A 70gsm', category: 'VAN_PHONG_PHAM', unit: 'Ram', currentStock: 45, minStockLevel: 20, location: 'Kho Hành chính' },
  { id: 'inv_2', code: 'VT-VPP-002', name: 'Bút dạ quang viết bảng (Xanh/Đỏ/Đen)', category: 'VAN_PHONG_PHAM', unit: 'Hộp', currentStock: 15, minStockLevel: 10, location: 'Kho Hành chính' },
  { id: 'inv_3', code: 'VT-VS-001', name: 'Nước lau sàn Sunlight 3.8kg', category: 'VE_SINH', unit: 'Can', currentStock: 8, minStockLevel: 5, location: 'Kho Vật tư Vệ sinh' },
  { id: 'inv_4', code: 'VT-YT-001', name: 'Cồn y tế 70 độ 500ml', category: 'Y_TE', unit: 'Chai', currentStock: 2, minStockLevel: 10, location: 'Phòng Y tế' }
];

export const MOCK_INVENTORY_TRANSACTIONS: any[] = [
  { id: 'tx_1', itemId: 'inv_1', itemName: 'Giấy in A4 Double A 70gsm', type: 'NHAP', quantity: 50, date: '2026-06-01', performerName: 'Thầy Lâm Vĩnh Thuận', notes: 'Nhập kho đầu tháng' },
  { id: 'tx_2', itemId: 'inv_1', itemName: 'Giấy in A4 Double A 70gsm', type: 'XUAT', quantity: 5, date: '2026-06-15', performerName: 'Cô Hoàng Trúc Liên', notes: 'Cấp phát cho Tổ Toán - Tin' },
  { id: 'tx_3', itemId: 'inv_4', itemName: 'Cồn y tế 70 độ 500ml', type: 'XUAT', quantity: 3, date: '2026-06-20', performerName: 'Cô Mai Phương Dũng', notes: 'Sử dụng phòng Y tế' }
];

export const MOCK_MASTER_TIMETABLE: TimetableSlot[] = [
  // Thứ 2
  { id: 'TKB_1', day: 2, period: 1, subject: 'Toán học nâng cao', className: '10A1', room: 'P.302', teacherId: 'user_nhan' },
  { id: 'TKB_2', day: 2, period: 2, subject: 'Toán học nâng cao', className: '10A1', room: 'P.302', teacherId: 'user_nhan' },
  { id: 'TKB_3', day: 2, period: 3, subject: 'Ngữ văn chuyên đề', className: '11A2', room: 'P.105', teacherId: 'user_dat' },
  { id: 'TKB_4', day: 2, period: 4, subject: 'Ngữ văn chuyên đề', className: '11A2', room: 'P.105', teacherId: 'user_dat' },
  { id: 'TKB_5', day: 2, period: 5, subject: 'Khoa học máy tính', className: '10A1', room: 'Lab AI 1', teacherId: 'user_nam' },
  { id: 'TKB_6', day: 2, period: 6, subject: 'Khoa học máy tính', className: '10A1', room: 'Lab AI 1', teacherId: 'user_nam' },

  // Thứ 3
  { id: 'TKB_7', day: 3, period: 1, subject: 'Văn học VN hiện đại', className: '12A1', room: 'P.401', teacherId: 'user_dat' },
  { id: 'TKB_8', day: 3, period: 2, subject: 'Văn học VN hiện đại', className: '12A1', room: 'P.401', teacherId: 'user_dat' },
  { id: 'TKB_9', day: 3, period: 3, subject: 'Giải tích 12', className: '12A2', room: 'P.405', teacherId: 'user_nhan' },
  { id: 'TKB_10', day: 3, period: 4, subject: 'Giải tích 12', className: '12A2', room: 'P.405', teacherId: 'user_nhan' }
];

export const MOCK_RECRUITMENT_JOBS: any[] = [
  { id: 'JOB01', code: 'REC-26-001', position: 'Giáo viên Toán THPT', department: 'TOAN_TIN', targetCount: 2, reason: 'Mở rộng quy mô', deadline: '2026-07-15', manager: 'Admin', status: 'OPEN' },
  { id: 'JOB02', code: 'REC-26-002', position: 'Nhân viên Y tế Học đường', department: 'DICH_VU_HOC_DUONG', targetCount: 1, reason: 'Thay thế nhân sự nghỉ thai sản', deadline: '2026-06-30', manager: 'Admin', status: 'OPEN' },
  { id: 'JOB03', code: 'REC-26-003', position: 'Giáo viên Tiếng Anh Bản ngữ', department: 'NGOAI_NGU', targetCount: 3, reason: 'Chương trình Quốc tế mới', deadline: '2026-08-01', manager: 'Admin', status: 'DRAFT' },
];

export const MOCK_CANDIDATES: any[] = [
  { id: 'CAN01', name: 'Nguyễn Văn A', phone: '0901234567', email: 'nva@gmail.com', jobId: 'JOB01', jobPosition: 'Giáo viên Toán THPT', source: 'Facebook', status: 'INTERVIEW', interviewDate: '2026-06-25' },
  { id: 'CAN02', name: 'Trần Thị B', phone: '0902345678', email: 'ttb@gmail.com', jobId: 'JOB01', jobPosition: 'Giáo viên Toán THPT', source: 'Website', status: 'TRIAL', interviewDate: '2026-06-20', evaluation: 'Chuyên môn tốt, cần xem thêm sư phạm' },
  { id: 'CAN03', name: 'Lê Y Tế', phone: '0903456789', email: 'yte@gmail.com', jobId: 'JOB02', jobPosition: 'Nhân viên Y tế', source: 'LinkedIn', status: 'NEW' },
];

export const MOCK_ONBOARDING_TASKS: any[] = [
  { id: 'ONB01', userId: 'user_new1', userName: 'Hoàng Tân Binh', roleName: 'Giáo viên', status: 'IN_PROGRESS', mentorName: 'Cô Nguyễn Tuyết Mai', checklist: [{id:'1', text:'Nộp hồ sơ gốc', done:true}, {id:'2', text:'Nhận laptop', done:false}, {id:'3', text:'Đọc nội quy', done:false}] },
];

export const MOCK_PROBATION_EVALS: any[] = [
  { id: 'PRO01', userId: 'user_prob1', userName: 'Phạm Thử Việc', position: 'Giáo viên Lý', mentorName: 'Thầy Phạm Minh Tuấn', startDate: '2026-05-01', endDate: '2026-07-01', objectives: 'Hoàn thành 10 tiết dạy thử, không có phản ánh xấu từ phụ huynh', status: 'IN_PROGRESS' },
];

export const MOCK_HR_CONTRACTS: any[] = [
  { id: 'CTR01', userId: 'user_mai', userName: 'Cô Nguyễn Thị Mai', contractType: 'Hợp đồng không thời hạn', contractNumber: 'HDLD-001/2020', signDate: '2020-08-01', effectiveDate: '2020-08-01', expirationDate: '2099-12-31', status: 'ACTIVE' },
  { id: 'CTR02', userId: 'user_dat', userName: 'Thầy Trần Văn Dũng', contractType: 'Hợp đồng 1 năm', contractNumber: 'HDLD-152/2025', signDate: '2025-08-01', effectiveDate: '2025-08-01', expirationDate: '2026-07-31', status: 'EXPIRING' },
];

export const MOCK_CPD_PROGRAMS: any[] = [
  { id: 'CPD01', code: 'CPD-26-01', name: 'Tập huấn kỹ năng PCCC và Cứu nạn', type: 'SAFETY', targetAudience: 'Toàn thể giáo viên, nhân viên', manager: 'Ban An Ninh', startDate: '2026-07-10', endDate: '2026-07-11', organizer: 'CA PCCC Quận', objectives: 'Đảm bảo 100% nhân sự biết sử dụng bình chữa cháy', status: 'APPROVED' },
  { id: 'CPD02', code: 'CPD-26-02', name: 'Phương pháp Dạy học Dự án (PBL)', type: 'SPECIALTY', targetAudience: 'Giáo viên Trung học', manager: 'Tổ Chuyên môn', startDate: '2026-06-15', endDate: '2026-06-17', organizer: 'Nội bộ', objectives: 'Cập nhật phương pháp sư phạm mới', status: 'IN_PROGRESS' },
];

export const MOCK_CPD_PARTICIPANTS: any[] = [
  { id: 'CPDP01', programId: 'CPD02', programName: 'Phương pháp Dạy học Dự án (PBL)', userId: 'user_mai', userName: 'Cô Nguyễn Thị Mai', status: 'ATTENDED' },
];

export const MOCK_DISCIPLINARY_RECORDS: any[] = [
  { id: 'DIS01', userId: 'user_dat', userName: 'Thầy Trần Văn Dũng', date: '2026-06-10', violationType: 'Chuyên cần', severity: 'REMINDER', description: 'Đến muộn 3 lần trong tháng', recordedBy: 'Admin', status: 'MONITORING' },
];

export const MOCK_TRANSFER_RECORDS: any[] = [
  { id: 'TR01', userId: 'user_toan_long', userName: 'Thầy Lâm Hoàng Long', currentDept: 'HANH_CHINH', newDept: 'TOAN_TIN', reason: 'Chuyển công tác theo nguyện vọng và chuyên môn', effectiveDate: '2026-05-01', proposedBy: 'Admin', status: 'APPROVED' },
];
