import { UserProfile, DepartmentOKR, MIProfile, LessonPlanAsset } from './types';

// Department OKRs based on standard school parameters and KPI indicators
export const MOCK_DEPARTMENT_OKRS: DepartmentOKR[] = [
  // BGH
  {
    id: 'okr_bgh_1',
    departmentId: 'BGH',
    objective: 'Số hóa, đồng bộ học liệu chuẩn quốc gia ứng dụng CNTT',
    kpi: 'Tỷ lệ sổ điểm số và đồng bộ Google Sheets thành công',
    targetValue: 100,
    currentValue: 95,
    unit: '%',
    progress: 95
  },
  {
    id: 'okr_bgh_2',
    departmentId: 'BGH',
    objective: 'Nâng cấp cải tạo CSVC phòng nghiên cứu và Lab công nghệ',
    kpi: 'Kiểm định chất lượng 40 quạt mát làm lạnh thi tốt nghiệp',
    targetValue: 40,
    currentValue: 38,
    unit: 'Phòng',
    progress: 95
  },

  // TUYEN_SINH_PR
  {
    id: 'okr_pr_1',
    departmentId: 'TUYEN_SINH_PR',
    objective: 'Truyền thông nhận diện học viện song ngữ Đa Trí Tuệ',
    kpi: 'Chiến dịch Open Day & School Tour gia tăng lượng đăng ký',
    targetValue: 500,
    currentValue: 450,
    unit: 'Hồ sơ',
    progress: 90
  },

  // QUOC_TE
  {
    id: 'okr_qt_1',
    departmentId: 'QUOC_TE',
    objective: 'Quản lý chất lượng giáo viên nước ngoài và giảng dạy Cambridge',
    kpi: 'Thiết lập giáo trình ôn thi IELTS/SAT chuẩn hóa mới',
    targetValue: 100,
    currentValue: 85,
    unit: '%',
    progress: 85
  },

  // KHAO_THI
  {
    id: 'okr_kt_1',
    departmentId: 'KHAO_THI',
    objective: 'Nghiệm thu rà soát chất lượng bộ đề chung toàn liên cấp',
    kpi: 'Hoàn tất chấm thi thử & báo cáo phổ điểm thi khảo sát khối 12',
    targetValue: 12,
    currentValue: 10,
    unit: 'Đợt thi',
    progress: 83
  },

  // CTHS_TAM_LY
  {
    id: 'okr_cths_1',
    departmentId: 'CTHS_TAM_LY',
    objective: 'Bảo bọc kỷ luật tích cực và kiểm soát nề nếp bán trú CLB',
    kpi: 'Số lượt tham vấn tư vấn định hướng tâm lý trật tự cảm xúc học sinh',
    targetValue: 150,
    currentValue: 120,
    unit: 'Lượt',
    progress: 80
  },

  // DICH_VU_HOC_DUONG
  {
    id: 'okr_dv_1',
    departmentId: 'DICH_VU_HOC_DUONG',
    objective: 'Đột phá vận hành xe bus học đường và canteen sạch chuẩn vệ sinh',
    kpi: 'Báo cáo vệ sinh bếp ăn, lưu mẫu thực phẩm 24h và kiểm soát bus vận hành',
    targetValue: 100,
    currentValue: 100,
    unit: '%',
    progress: 100
  },

  // TOAN_TIN
  {
    id: 'okr_toan_1',
    departmentId: 'TOAN_TIN',
    objective: 'Đổi mới hoạt động rèn luyện tư duy toán học',
    kpi: 'Tỷ lệ giáo án bồi dưỡng học sinh giỏi ứng dụng công nghệ STEM',
    targetValue: 100,
    currentValue: 80,
    unit: '%',
    progress: 80
  },
  {
    id: 'okr_toan_2',
    departmentId: 'TOAN_TIN',
    objective: 'Phát hành biên soạn đề cương ôn tập học kỳ II môn Toán 10',
    kpi: 'Rà soát ma trận thi thử và đáp án hướng nghiệp chi tiết toán',
    targetValue: 100,
    currentValue: 100,
    unit: '%',
    progress: 100
  },

  // VAN
  {
    id: 'okr_van_1',
    departmentId: 'VAN',
    objective: 'Sáng tạo đổi mới Ngữ Văn kịch nghệ & tranh biện văn học',
    kpi: 'Biên tập giáo án giảng dạy chuyên sâu đổi mới lớp 10, 11',
    targetValue: 24,
    currentValue: 18,
    unit: 'Giáo án',
    progress: 75
  },

  // HANH_CHINH
  {
    id: 'okr_hc_1',
    departmentId: 'HANH_CHINH',
    objective: 'Số hóa quản trị hồ sơ cán bộ, pháp chế học vụ',
    kpi: 'Giải ngân kinh phí sửa chữa và thu học phí đồng bộ nhanh',
    targetValue: 100,
    currentValue: 90,
    unit: '%',
    progress: 90
  }
];

// Seed map of specific MI Profiles for our core officers to represent diverse intelligence profiles
const SPECIFIC_MI_PROFILES: Record<string, MIProfile> = {
  user_chutich: { logical: 90, linguistic: 85, spatial: 60, musical: 50, kinesthetic: 55, interpersonal: 95, intrapersonal: 90, naturalist: 70 },
  user_ceo: { logical: 95, linguistic: 80, spatial: 70, musical: 60, kinesthetic: 65, interpersonal: 92, intrapersonal: 88, naturalist: 65 },
  user_triet: { logical: 85, linguistic: 90, spatial: 75, musical: 65, kinesthetic: 70, interpersonal: 96, intrapersonal: 95, naturalist: 75 },
  
  // TOAN TIN (Tổ Toán - Tin học) -> Thầy Nam, cô Nhàn xuất sắc về Logic - Toán
  user_nhan: { logical: 95, linguistic: 75, spatial: 88, musical: 55, kinesthetic: 60, interpersonal: 88, intrapersonal: 85, naturalist: 64 },
  user_nam: { logical: 98, linguistic: 70, spatial: 85, musical: 50, kinesthetic: 75, interpersonal: 70, intrapersonal: 80, naturalist: 60 },
  user_toan_long: { logical: 92, linguistic: 65, spatial: 90, musical: 60, kinesthetic: 88, interpersonal: 76, intrapersonal: 82, naturalist: 65 }, // robotics 
  user_toan_trang: { logical: 96, linguistic: 72, spatial: 80, musical: 58, kinesthetic: 55, interpersonal: 84, intrapersonal: 90, naturalist: 50 },

  // VAN (Tổ Ngữ Văn) -> Thầy Đạt, cô Nhung xuất sắc về Ngôn ngữ
  user_dat: { logical: 65, linguistic: 96, spatial: 70, musical: 80, kinesthetic: 50, interpersonal: 88, intrapersonal: 90, naturalist: 72 },
  user_nhung: { logical: 60, linguistic: 92, spatial: 68, musical: 85, kinesthetic: 55, interpersonal: 82, intrapersonal: 85, naturalist: 70 },
  user_van_my: { logical: 70, linguistic: 94, spatial: 75, musical: 75, kinesthetic: 60, interpersonal: 85, intrapersonal: 88, naturalist: 68 },

  // CTHS_TAM_LY -> Cô Thư xuất sắc về Nội tâm & Giao tiếp
  user_tl_mgr: { logical: 75, linguistic: 82, spatial: 65, musical: 70, kinesthetic: 78, interpersonal: 90, intrapersonal: 85, naturalist: 70 },
  user_tl_staff1: { logical: 72, linguistic: 85, spatial: 60, musical: 68, kinesthetic: 58, interpersonal: 95, intrapersonal: 96, naturalist: 72 },

  // DICH VU & VAN HANH -> Cô Oanh xuất sắc về Vận động, Tự nhiên (Canteen & Thể chất)
  user_dv_chef: { logical: 70, linguistic: 65, spatial: 72, musical: 55, kinesthetic: 88, interpersonal: 78, intrapersonal: 80, naturalist: 92 },
  user_dv_nurse: { logical: 80, linguistic: 74, spatial: 60, musical: 50, kinesthetic: 82, interpersonal: 88, intrapersonal: 85, naturalist: 78 }
};

// Seed map of specific badges for people based on achievements
const SPECIFIC_BADGES: Record<string, string[]> = {
  user_chutich: ['🏅 Chỉ đạo Chiến lược', '🧠 Lãnh đạo Đa Trí Tuệ'],
  user_ceo: ['⚡ Hiệu quả Vận hành', '📈 Vua Doanh số'],
  user_triet: ['🌟 Hiệu trưởng Sáng tạo', '🤝 Đại sứ Thấu cảm'],
  user_nhan: ['📐 Bậc thầy Logic', '🙌 Tận tụy Giáo vụ'],
  user_nam: ['💻 Giáo viên Công nghệ Tech', '🧬 Nhà nghiên cứu STEM'],
  user_dat: ['📝 Cây bút Ngôn từ', '🎭 Kịch nghệ Học đường'],
  user_nhung: ['🎵 Giai điệu Văn đàn', '🥰 Sứ giả Yêu thương'],
  user_tl_staff1: ['🧠 Thấu hiểu Nội tâm', '🤝 Sứ giả Hòa bình'],
  user_dv_chef: ['🌿 Vận hành Xanh', '🍲 Chuyên dinh dưỡng học']
};

/**
 * Helper to generate random consistent MI Profile scores based on the teacher's primary workspace department
 */
export function generateConsistentMIProfile(id: string, workspaceId: string): MIProfile {
  if (SPECIFIC_MI_PROFILES[id]) {
    return SPECIFIC_MI_PROFILES[id];
  }

  // Create workspace specific trends
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const getScore = (min: number, max: number, offset: number) => {
    return min + ((seed + offset) % (max - min + 1));
  };

  const defaultProfile: MIProfile = {
    logical: getScore(50, 75, 1),
    linguistic: getScore(50, 75, 2),
    spatial: getScore(45, 70, 35),
    musical: getScore(40, 65, 4),
    kinesthetic: getScore(45, 70, 5),
    interpersonal: getScore(60, 80, 6),
    intrapersonal: getScore(60, 80, 7),
    naturalist: getScore(40, 68, 8)
  };

  if (workspaceId === 'TOAN_TIN' || workspaceId === 'KHAO_THI') {
    defaultProfile.logical = getScore(82, 95, 11);
    defaultProfile.spatial = getScore(70, 85, 12);
  } else if (workspaceId === 'VAN' || workspaceId === 'QUOC_TE' || workspaceId === 'TUYEN_SINH_PR') {
    defaultProfile.linguistic = getScore(82, 95, 21);
    defaultProfile.interpersonal = getScore(78, 92, 22);
  } else if (workspaceId === 'CTHS_TAM_LY') {
    defaultProfile.intrapersonal = getScore(85, 96, 31);
    defaultProfile.interpersonal = getScore(82, 95, 32);
    defaultProfile.linguistic = getScore(75, 88, 33);
  } else if (workspaceId === 'DICH_VU_HOC_DUONG') {
    defaultProfile.naturalist = getScore(80, 95, 41);
    defaultProfile.kinesthetic = getScore(80, 92, 42);
  } else if (workspaceId === 'BGH') {
    defaultProfile.logical = getScore(80, 92, 51);
    defaultProfile.interpersonal = getScore(85, 96, 52);
    defaultProfile.intrapersonal = getScore(82, 94, 53);
  }

  return defaultProfile;
}

/**
 * Enriches a simple UserProfile object with full MI details and motivation badges
 */
export function enrichUserWithMIDetails(user: UserProfile): UserProfile {
  const miProfile = generateConsistentMIProfile(user.id, user.workspaceId);
  const badges = SPECIFIC_BADGES[user.id] || ['🌱 Cán bộ tâm huyết Đa Trí Tuệ'];

  return {
    ...user,
    miProfile,
    badges
  };
}

// Starter resource assets for Multiple Intelligences (MI) Lesson Plan Library
export const INITIAL_LESSON_PLANS: LessonPlanAsset[] = [
  {
    id: 'lp_1',
    title: 'Học thuyết đồ thị Euler thông qua vẽ sơ đồ khối không gian trường Đa Trí Tuệ',
    description: 'Giáo án tích hợp trí tuệ Logic-Toán và trí tuệ Không gian. Học sinh thiết kế bản đồ vẽ đường bus di chuyển tối ưu tới trường, kiểm soát nề nếp thi tốt nghiệp.',
    authorName: 'Thầy Trần Hoàng Nam',
    authorTitle: 'Giáo viên Toán hình lớp 12',
    miType: 'logical',
    downloadUrl: '#',
    likesCount: 24
  },
  {
    id: 'lp_2',
    title: 'Kịch nghệ hoá tác phẩm Tắt Đèn: Đồng cảm nỗi khổ chị Dậu qua bài tập nhập vai nội tâm',
    description: 'Giáo án Ngữ văn tích hợp trí tuệ Ngôn ngữ và trí tuệ Nội tâm dạt dào cảm xúc. Giúp giáo viên nâng cấp trải nghiệm đọc hiểu thực tế sâu sắc.',
    authorName: 'Cô Phạm Hồng Nhung',
    authorTitle: 'Giáo viên Văn học THPT',
    miType: 'linguistic',
    downloadUrl: '#',
    likesCount: 32
  },
  {
    id: 'lp_3',
    title: 'Phát nhạc cụ gõ theo phách nhịp tính chất đại số toán cấp hai nâng cao khả năng ghi nhớ',
    description: 'Giáo án toán học tích hợp trí tuệ Âm nhạc và Vận động cơ thể dẻo dai. Học sinh học số mũ, phân số ứng dụng âm bồi, đàn dương cầm sinh động.',
    authorName: 'Cô Lê Thị Thanh Nhàn',
    authorTitle: 'Tổ trưởng Toán - Tin',
    miType: 'musical',
    downloadUrl: '#',
    likesCount: 15
  },
  {
    id: 'lp_4',
    title: 'Vận hành vườn nuôi trồng sinh thái học bảo vệ động thực vật bản địa tại khuôn viên MIS',
    description: 'Giáo án môn tự nhiên xã hội tích hợp thí nghiệm sinh vật cảnh. Thúc đẩy kỹ năng chăm sóc bảo tồn loài chim cây cỏ tự nhiên tại trường.',
    authorName: 'Cô Hoàng Kim Oanh',
    authorTitle: 'Chuyên gia Dinh dưỡng canteen',
    miType: 'naturalist',
    downloadUrl: '#',
    likesCount: 19
  }
];

// Mapping key of MI Profile to human readable names and emojis
export const MI_KEY_DETAILS: Record<keyof MIProfile, { name: string; emoji: string; color: string; bg: string }> = {
  logical: { name: 'Trí tuệ Logic - Toán', emoji: '📐', color: 'bg-indigo-600 border-indigo-200 text-indigo-700', bg: 'from-indigo-500/20 to-indigo-600/30' },
  linguistic: { name: 'Trí tuệ Ngôn ngữ', emoji: '📝', color: 'bg-emerald-600 border-emerald-200 text-emerald-700', bg: 'from-emerald-500/20 to-emerald-600/30' },
  spatial: { name: 'Trí tuệ Không gian', emoji: '🎨', color: 'bg-purple-600 border-purple-200 text-purple-700', bg: 'from-purple-500/20 to-purple-600/30' },
  musical: { name: 'Trí tuệ Âm nhạc', emoji: '🎵', color: 'bg-pink-600 border-pink-200 text-pink-700', bg: 'from-pink-500/20 to-pink-600/30' },
  kinesthetic: { name: 'Trí tuệ Vận động', emoji: '🏃‍♂️', color: 'bg-orange-500 border-orange-200 text-orange-700', bg: 'from-orange-500/20 to-orange-600/30' },
  interpersonal: { name: 'Trí tuệ Giao tiếp', emoji: '🤝', color: 'bg-blue-600 border-blue-200 text-blue-700', bg: 'from-blue-500/20 to-blue-600/30' },
  intrapersonal: { name: 'Trí tuệ Nội tâm', emoji: '🧠', color: 'bg-teal-600 border-teal-200 text-teal-700', bg: 'from-teal-500/20 to-teal-600/30' },
  naturalist: { name: 'Trí tuệ Tự nhiên', emoji: '🌿', color: 'bg-green-600 border-green-200 text-green-700', bg: 'from-green-500/20 to-green-600/30' }
};
