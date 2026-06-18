export const APPROVAL_MOCK_DATA = {
  'Đề xuất mua sắm thiết bị CNTT': {
    code: 'DXMS-2025-0007',
    dept: 'Tin học',
    user: 'Trần Thị Mai',
    deadline: '16/05/2025 17:00',
    purpose: 'Trang bị bổ sung máy tính phục vụ giảng dạy và học tập thực hành môn Tin học theo chương trình mới GDPT 2018.',
    budget: '180,000,000đ',
    items: [
      { name: 'Máy tính để bàn Dell Inspiron 3020', qty: 10, price: '15,000,000đ', total: '150,000,000đ' },
      { name: 'Máy tính bảng Apple iPad Gen 9 WiFi', qty: 5, price: '6,000,000đ', total: '30,000,000đ' }
    ],
    attachments: ['De_xuat_mua_sam_CNTT.pdf', 'Bao_gia_thiet_bi.pdf', 'Cau_hinh_ky_thuat.xlsx'],
    timeline: [
      { step: 1, role: 'Lập đề xuất', user: 'Trần Thị Mai', date: '15/05/2025 09:12', done: true },
      { step: 2, role: 'Trưởng bộ phận', user: 'Phạm Quang Minh', date: '15/05/2025 14:20', done: true },
      { step: 3, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
    ]
  },
  'Kế hoạch tổ chức Ngày hội STEM': {
    code: 'KH-STEM-2025-002',
    dept: 'Đoàn trường',
    user: 'Trần Thị Mai',
    deadline: '17/05/2025 17:00',
    purpose: 'Tổ chức ngày hội trải nghiệm khoa học STEM nhằm nâng cao tinh thần tự học, nghiên cứu và sáng tạo kỹ thuật cho học sinh toàn trường.',
    budget: '25,000,000đ',
    items: [
      { name: 'Kinh phí vật tư mô hình trưng bày', qty: 1, price: '8,000,000đ', total: '8,000,000đ' },
      { name: 'Giải thưởng cuộc thi chế tạo Robotics', qty: 1, price: '5,000,000đ', total: '5,000,000đ' },
      { name: 'Thuê âm thanh, ánh sáng, backdrop sân khấu', qty: 1, price: '12,000,000đ', total: '12,000,000đ' }
    ],
    attachments: ['Ke_hoach_ngay_hoi_STEM_2025.docx', 'Du_tru_chi_tiet_STEM.xlsx'],
    timeline: [
      { step: 1, role: 'Lập đề xuất', user: 'Trần Thị Mai', date: '16/05/2025 08:30', done: true },
      { step: 2, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
    ]
  },
  'Quy chế chi tiêu nội bộ 2025-2026': {
    code: 'QCCT-2025-001',
    dept: 'Kế toán',
    user: 'Nguyễn Văn Nam',
    deadline: '18/05/2025 17:00',
    purpose: 'Cập nhật định mức thanh toán chi tiêu nội bộ, tiền làm thêm giờ (overtime) của giáo viên chuyên môn và cán bộ văn phòng phù hợp với ngân sách năm học mới.',
    budget: 'Theo định mức chi tiêu thực tế',
    items: [
      { name: 'Định mức thanh toán công tác phí', qty: 1, price: 'Tăng 10%', total: 'Theo thực chi' },
      { name: 'Định mức phụ cấp ngoài giờ giáo viên', qty: 1, price: '45,000đ/tiết', total: 'Theo thực dạy' }
    ],
    attachments: ['Quy_che_chi_tieu_noi_bo_2025_2026_Trinh_Ky.pdf'],
    timeline: [
      { step: 1, role: 'Lập đề xuất', user: 'Nguyễn Văn Nam', date: '16/05/2025 11:15', done: true },
      { step: 2, role: 'Ban Giám hiệu', user: 'Chờ duyệt', date: '', active: true }
    ]
  }
};

export const SEED_TASKS = [
  { title: 'Soạn đề thi HSG cấp trường', status: 'todo', priority: 'high', dept: 'Toán', tag: 'Chuyên môn' },
  { title: 'Lên lịch họp phụ huynh cuối kỳ', status: 'todo', priority: 'medium', dept: 'BGH', tag: 'Hành chính' },
  { title: 'Chấm thi thử THPT Quốc gia', status: 'in_progress', priority: 'high', dept: 'Văn', tag: 'Chuyên môn' },
  { title: 'Báo cáo tổng kết tuần 12', status: 'pending_approval', priority: 'medium', dept: 'Đoàn đội', tag: 'Báo cáo' },
  { title: 'Duyệt danh sách học sinh giỏi', status: 'pending_approval', priority: 'high', dept: 'BGH', tag: 'Phê duyệt' },
  { title: 'Mua sắm dụng cụ thí nghiệm Hóa học', status: 'completed', priority: 'low', dept: 'Hóa', tag: 'Mua sắm' },
  { title: 'Tập huấn PCCC năm 2025', status: 'todo', priority: 'high', dept: 'Hành chính', tag: 'Sự kiện' },
  { title: 'Xếp thời khóa biểu tuần 15', status: 'in_progress', priority: 'high', dept: 'BGH', tag: 'Chuyên môn' },
  { title: 'Đánh giá chất lượng giáo viên', status: 'in_progress', priority: 'medium', dept: 'BGH', tag: 'Đánh giá' },
  { title: 'Nhập điểm giữa kỳ lên hệ thống', status: 'todo', priority: 'high', dept: 'Tiếng Anh', tag: 'Chuyên môn' },
];
