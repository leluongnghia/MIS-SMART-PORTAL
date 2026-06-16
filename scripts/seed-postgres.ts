import { db, pgliteClient, schema } from '../src/libs/server/db';
import { INITIAL_TASKS, MOCK_USERS, WORKSPACES } from '../src/mockData';

const now = new Date();

async function seed() {
  await db.insert(schema.workspaces).values(
    WORKSPACES.map((workspace: any) => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || '',
      color: workspace.color || '',
      iconName: workspace.iconName || '',
      payload: workspace,
      createdAt: now,
      updatedAt: now,
    })),
  ).onConflictDoNothing();

  // Seed departments
  await db.insert(schema.departments).values(
    WORKSPACES.filter((w: any) => w.id !== 'ALL').map((w: any) => ({
      id: w.id,
      name: w.name,
      code: w.id,
      description: w.description || '',
      managerId: MOCK_USERS.find((u: any) => u.workspaceId === w.id && (u.role === 'MANAGER' || u.role === 'ADMIN'))?.id || null,
      payload: w,
      createdAt: now,
      updatedAt: now,
    }))
  ).onConflictDoNothing();

  await db.insert(schema.users).values(
    MOCK_USERS.map((user: any) => ({
      id: user.id,
      clerkUserId: null,
      name: user.name,
      role: user.role,
      roleName: user.roleName || '',
      title: user.title || '',
      email: user.email || user.personalEmail || null,
      workspaceId: user.workspaceId || '',
      phone: user.phone || user.phoneNumber || null,
      avatarUrl: user.avatar || null,
      departmentId: user.workspaceId && user.workspaceId !== 'ALL' ? user.workspaceId : null,
      status: 'ACTIVE',
      payload: user,
      createdAt: now,
      updatedAt: now,
    })),
  ).onConflictDoNothing();

  await db.insert(schema.tasks).values(
    INITIAL_TASKS.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      workspaceId: task.workspaceId,
      assignedId: task.assignedId,
      assignedName: task.assignedName || '',
      status: task.status,
      priority: task.priority,
      deadline: task.deadline || '',
      tag: task.tag || '',
      payload: task,
      createdAt: now,
      updatedAt: now,
    })),
  ).onConflictDoNothing();

  await db.insert(schema.rbacConfig).values({
    id: 'default',
    config: {},
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  await db.insert(schema.userOverrides).values({
    id: 'default',
    overrides: {},
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  // Seed mock leads matching new schema
  const mockLeads = [
    {
      id: 'lead_seed_1',
      leadCode: 'LD-2026-0001',
      fullName: 'Nguyễn Minh Anh',
      parentName: 'Nguyễn Văn Hùng',
      phone: '0912345678',
      email: 'parent.minhanh@gmail.com',
      source: 'Website',
      grade: 'Lớp 6',
      status: 'received' as const,
      assignedUserId: 'user_pr_ts1',
      notes: 'Phụ huynh quan tâm chương trình bán trú và dịch vụ đưa đón.',
      dateOfBirth: new Date('2012-05-15'),
      currentClass: 'Lớp 5A',
      currentSchool: 'Trường Tiểu học Nghĩa Tân',
      address: 'Số 12 Ngõ 45 Trần Thái Tông, Cầu Giấy, Hà Nội',
      enrollmentSystem: 'Hệ Chất lượng cao',
      payload: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead_seed_2',
      leadCode: 'LD-2026-0002',
      fullName: 'Trần Thị Mai',
      parentName: 'Lê Thị Hồng',
      phone: '0987654321',
      email: 'parent.tranmai@gmail.com',
      source: 'Facebook',
      grade: 'Lớp 10',
      status: 'consulting' as const,
      assignedUserId: 'user_pr_ts1',
      notes: 'Đã tư vấn qua điện thoại. Phụ huynh đang cân nhắc học phí.',
      dateOfBirth: new Date('2010-09-20'),
      currentClass: 'Lớp 9B',
      currentSchool: 'Trường THCS Cầu Giấy',
      address: 'Chung cư Sunrise Building, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      enrollmentSystem: 'Hệ Song ngữ',
      payload: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead_seed_3',
      leadCode: 'LD-2026-0003',
      fullName: 'Phạm Đức Nam',
      parentName: 'Phạm Văn Minh',
      phone: '0905558888',
      email: 'parent.ducnam@gmail.com',
      source: 'Google',
      grade: 'Lớp 1',
      status: 'test_scheduled' as const,
      assignedUserId: 'user_pr_ts1',
      notes: 'Phụ huynh đã đăng ký thi test đánh giá năng lực đầu vào.',
      dateOfBirth: new Date('2015-02-10'),
      currentClass: 'Mẫu giáo lớn',
      currentSchool: 'Mầm non Hoa Hồng',
      address: 'Số 8 Ngõ 102 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      enrollmentSystem: 'Hệ Song ngữ',
      testDate: new Date('2026-06-20T08:30:00Z'),
      testTime: '08:30',
      payload: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead_seed_4',
      leadCode: 'LD-2026-0004',
      fullName: 'Lê Hoàng Bách',
      parentName: 'Lê Thị Thảo',
      phone: '0911223344',
      email: 'parent.hoangbach@gmail.com',
      source: 'Referral',
      grade: 'Lớp 11',
      status: 'test_participated' as const,
      assignedUserId: 'user_pr_ts1',
      notes: 'Đã thi test ngày 10/06. Kết quả tốt, đạt học bổng 20%.',
      dateOfBirth: new Date('2009-11-05'),
      currentClass: 'Lớp 10A2',
      currentSchool: 'Trường THPT Yên Hòa',
      address: 'Số 152 Nguyễn Khang, Yên Hòa, Cầu Giấy, Hà Nội',
      enrollmentSystem: 'Hệ Chất lượng cao',
      testDate: new Date('2026-06-10T14:00:00Z'),
      testTime: '14:00',
      mathScore: 8,
      englishScore: 9,
      vietnameseScore: 7,
      scholarshipPercent: 20,
      payload: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead_seed_5',
      leadCode: 'LD-2026-0005',
      fullName: 'Vũ Bảo Lâm',
      parentName: 'Vũ Hoàng Hải',
      phone: '0933445566',
      email: 'parent.baolam@gmail.com',
      source: 'Event',
      grade: 'Mầm non',
      status: 'seat_reserved' as const,
      assignedUserId: 'user_pr_ts1',
      notes: 'Phụ huynh đã hoàn thành đóng phí giữ chỗ 5.000.000đ.',
      dateOfBirth: new Date('2018-07-25'),
      currentSchool: 'Mầm non Tư thục Việt Anh',
      address: 'Số 66 Trung Kính, Yên Hòa, Cầu Giấy, Hà Nội',
      enrollmentSystem: 'Hệ Song ngữ',
      scholarshipPercent: 10,
      finalTuition: 54000000,
      seatReservationFee: 5000000,
      seatReservationDate: new Date('2026-06-12T10:00:00Z'),
      payload: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead_seed_6',
      leadCode: 'LD-2026-0006',
      fullName: 'Hoàng Minh Khang',
      parentName: 'Hoàng Văn Tuấn',
      phone: '0944556677',
      email: 'parent.minhkhang@gmail.com',
      source: 'Website',
      grade: 'Lớp 7',
      status: 'docs_submitted' as const,
      assignedUserId: 'user_pr_ts1',
      notes: 'Đã nhận đủ hồ sơ bản cứng bàn giao.',
      dateOfBirth: new Date('2011-04-18'),
      currentClass: 'Lớp 6A4',
      currentSchool: 'Trường THCS Dịch Vọng',
      address: 'Phòng 1205 Tòa nhà FLC, Trần Thái Tông, Cầu Giấy, Hà Nội',
      enrollmentSystem: 'Hệ Chất lượng cao',
      nationalStudentId: '001201012345',
      insuranceId: 'GD1012345678',
      moetStudentId: 'HS-2026-9988',
      siblingsInfo: { hasSiblings: true, siblingName: 'Hoàng Minh Tuấn', siblingClass: 'Lớp 9' },
      payload: {},
      createdAt: now,
      updatedAt: now,
    }
  ];

  await db.insert(schema.leads).values(mockLeads).onConflictDoNothing();

  // Seed activities & pipelines for mock leads
  for (const lead of mockLeads) {
    await db.insert(schema.leadPipeline).values({
      id: `pipe_seed_${lead.id}`,
      leadId: lead.id,
      fromStatus: null,
      toStatus: lead.status,
      changedById: 'user_pr_ts1',
      changedAt: now,
      note: 'Khởi tạo dữ liệu mẫu tuyển sinh',
      payload: {},
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    await db.insert(schema.leadActivities).values({
      id: `act_seed_create_${lead.id}`,
      leadId: lead.id,
      type: 'create',
      title: 'Lead Created',
      description: `Khởi tạo hồ sơ học sinh ${lead.fullName} với trạng thái ${lead.status}`,
      activityAt: now,
      createdById: 'user_pr_ts1',
      payload: {},
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    if (lead.notes) {
      await db.insert(schema.leadActivities).values({
        id: `act_seed_note_${lead.id}`,
        leadId: lead.id,
        type: 'consultation',
        title: 'Ghi chú tư vấn đầu kỳ',
        description: lead.notes,
        activityAt: now,
        createdById: 'user_pr_ts1',
        payload: {},
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing();
    }
  }

  // Seed default chat conversations
  console.log("Seeding chat conversations and members...");
  const conversations = [
    {
      id: 'conv_school_ann',
      type: 'SCHOOL_ANNOUNCEMENT',
      name: 'Thông báo toàn trường',
      description: 'Kênh thông báo chính thức toàn trường',
      createdBy: 'user_chutich',
      status: 'ACTIVE',
      isPinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'conv_dept_tuyen_sinh',
      type: 'DEPARTMENT_CHANNEL',
      name: 'Kênh Tuyển sinh & PR',
      description: 'Kênh làm việc của Phòng Tuyển sinh & Truyền thông',
      departmentId: 'TUYEN_SINH_PR',
      createdBy: 'user_tuan', // Truong phong
      status: 'ACTIVE',
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'conv_dept_bgh',
      type: 'DEPARTMENT_CHANNEL',
      name: 'Kênh Ban Giám hiệu',
      description: 'Kênh trao đổi nội bộ Ban Giám hiệu',
      departmentId: 'BGH',
      createdBy: 'user_chutich',
      status: 'ACTIVE',
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'conv_dm_triet_ceo',
      type: 'DIRECT_MESSAGE',
      name: null,
      description: null,
      createdBy: 'user_triet',
      status: 'ACTIVE',
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
  ];

  await db.insert(schema.chatConversations).values(conversations).onConflictDoNothing();

  // Seed chat members
  const members: any[] = [];
  
  // School Ann - all users
  for (const user of MOCK_USERS) {
    members.push({
      id: `member_school_${user.id}`,
      conversationId: 'conv_school_ann',
      userId: user.id,
      role: user.role === 'ADMIN' ? 'OWNER' : 'MEMBER',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Dept Tuyen Sinh
  for (const user of MOCK_USERS.filter(u => u.workspaceId === 'TUYEN_SINH_PR')) {
    members.push({
      id: `member_tuyen_sinh_${user.id}`,
      conversationId: 'conv_dept_tuyen_sinh',
      userId: user.id,
      role: user.role === 'MANAGER' ? 'OWNER' : 'MEMBER',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Dept BGH
  for (const user of MOCK_USERS.filter(u => u.workspaceId === 'BGH')) {
    members.push({
      id: `member_bgh_${user.id}`,
      conversationId: 'conv_dept_bgh',
      userId: user.id,
      role: user.role === 'ADMIN' ? 'OWNER' : 'MEMBER',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // DM Triet - CEO
  members.push(
    {
      id: 'member_dm_triet',
      conversationId: 'conv_dm_triet_ceo',
      userId: 'user_triet',
      role: 'MEMBER',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'member_dm_ceo',
      conversationId: 'conv_dm_triet_ceo',
      userId: 'user_ceo',
      role: 'MEMBER',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    }
  );

  await db.insert(schema.chatMembers).values(members).onConflictDoNothing();

  // Seed message samples
  const messages = [
    {
      id: 'msg_ann_1',
      conversationId: 'conv_school_ann',
      senderId: 'user_chutich',
      content: 'Chào mừng các thầy cô đến với hệ thống quản lý MIS Smart Portal mới. Hãy cập nhật đầy đủ thông tin cá nhân của mình.',
      type: 'TEXT',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'msg_ts_1',
      conversationId: 'conv_dept_tuyen_sinh',
      senderId: 'user_tuan',
      content: 'Mọi người chuẩn bị báo cáo số liệu tuyển sinh tuần này để nộp cho BGH nhé.',
      type: 'TEXT',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'msg_dm_1',
      conversationId: 'conv_dm_triet_ceo',
      senderId: 'user_triet',
      content: 'Anh Luân ơi, chiều nay có lịch họp liên tịch lúc 14h, anh tham dự được không ạ?',
      type: 'TEXT',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
    }
  ];

  await db.insert(schema.chatMessages).values(messages).onConflictDoNothing();

  // Seed default categories
  const defaultCategories = [
    // years
    { id: 'cat_yr_25_26', group: 'school_year', code: '2025-2026', name: 'Năm học 2025-2026', description: 'Năm học 2025-2026', sortOrder: 1, status: 'ACTIVE' },
    { id: 'cat_yr_26_27', group: 'school_year', code: '2026-2027', name: 'Năm học 2026-2027', description: 'Năm học 2026-2027', sortOrder: 2, status: 'ACTIVE' },
    // semesters
    { id: 'cat_sem_1', group: 'semester', code: 'SEM1', name: 'Học kỳ I', description: 'Học kỳ 1', sortOrder: 1, status: 'ACTIVE' },
    { id: 'cat_sem_2', group: 'semester', code: 'SEM2', name: 'Học kỳ II', description: 'Học kỳ 2', sortOrder: 2, status: 'ACTIVE' },
    // campuses
    { id: 'cat_cam_cg', group: 'campus', code: 'CAU_GIAY', name: 'Cơ sở Cầu Giấy', description: 'Cơ sở Cầu Giấy', sortOrder: 1, status: 'ACTIVE' },
    { id: 'cat_cam_lh', group: 'campus', code: 'LANG_HA', name: 'Cơ sở Láng Hạ', description: 'Cơ sở Láng Hạ', sortOrder: 2, status: 'ACTIVE' },
    // grades
    { id: 'cat_gr_6', group: 'grade_level', code: 'GRADE_6', name: 'Khối 6', description: 'Khối 6 THCS', sortOrder: 6, status: 'ACTIVE' },
    { id: 'cat_gr_10', group: 'grade_level', code: 'GRADE_10', name: 'Khối 10', description: 'Khối 10 THPT', sortOrder: 10, status: 'ACTIVE' },
    // document types
    { id: 'cat_doc_qc', group: 'document_type', code: 'QUY_CHE', name: 'Quy chế học vụ', description: 'Quy định, quy chế nội bộ', sortOrder: 1, status: 'ACTIVE' },
    { id: 'cat_doc_bm', group: 'document_type', code: 'BIEU_MAU', name: 'Biểu mẫu chuẩn', description: 'Các mẫu import/export', sortOrder: 2, status: 'ACTIVE' },
    { id: 'cat_doc_cv', group: 'document_type', code: 'CONG_VAN', name: 'Công văn nội bộ', description: 'Văn bản điều hành', sortOrder: 3, status: 'ACTIVE' },
  ];
  await db.insert(schema.systemCategories).values(defaultCategories.map(c => ({ ...c, createdAt: now, updatedAt: now }))).onConflictDoNothing();

  // Seed default settings
  const defaultSettings = [
    { key: 'school_info:name', value: 'Trường Tiểu học & THCS MIS', group: 'school_info', label: 'Tên trường', description: 'Tên chính thức của trường', isSecret: false, isEditable: true },
    { key: 'school_info:hotline', value: '024 1234 5678', group: 'school_info', label: 'Hotline tuyển sinh', description: 'Hotline hỗ trợ', isSecret: false, isEditable: true },
    { key: 'academics:default_year', value: '2026-2027', group: 'academics', label: 'Năm học mặc định', description: 'Năm học hiện tại hệ thống', isSecret: false, isEditable: true },
    { key: 'academics:default_semester', value: 'SEM1', group: 'academics', label: 'Học kỳ mặc định', description: 'Học kỳ hiện tại hệ thống', isSecret: false, isEditable: true },
    { key: 'chat:allow_dm', value: 'true', group: 'chat', label: 'Cho phép chat DM', description: 'Cho phép chat 1-1', isSecret: false, isEditable: true },
    { key: 'chat:allow_tag_department', value: 'true', group: 'chat', label: 'Cho phép tag phòng ban', description: 'Cho phép tag @Tên phòng', isSecret: false, isEditable: true },
    { key: 'chat:allow_tag_all', value: 'true', group: 'chat', label: 'Cho phép tag @all', description: 'Cho phép tag toàn trường', isSecret: false, isEditable: true },
    { key: 'chat:mention_limit', value: '20', group: 'chat', label: 'Hạn mức mention', description: 'Hạn mức cảnh báo số người', isSecret: false, isEditable: true },
  ];
  await db.insert(schema.systemSettings).values(defaultSettings.map(s => ({ ...s, createdAt: now, updatedAt: now }))).onConflictDoNothing();

  console.log(`Seeded ${WORKSPACES.length} workspaces, ${MOCK_USERS.length} users, ${INITIAL_TASKS.length} tasks, ${mockLeads.length} leads.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pgliteClient.close();
});
