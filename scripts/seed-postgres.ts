import { db, schema } from '../src/libs/server/db';
import { INITIAL_TASKS, MOCK_USERS, WORKSPACES } from '../src/mockData';

const now = new Date();

async function seed() {
  // Truncate existing student-related tables
  console.log("Cleaning old classes, students, grades, and tuition fees...");
  try {
    await db.delete(schema.sisGrades);
    await db.delete(schema.tuitionFees);
    await db.delete(schema.studentDirectory);
    await db.delete(schema.classes);
  } catch (e) {
    console.log("Cleanup skipped or table not initialized yet:", e);
  }

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
    MOCK_USERS.map((user: any, index: number) => ({
      id: user.id,
      clerkUserId: null,
      name: user.name,
      role: user.role,
      roleName: user.roleName || '',
      title: user.title || '',
      email: user.email || user.personalEmail || null,
      workspaceId: user.workspaceId || '',
      phone: user.phone || user.phoneNumber || `09${String(index + 10000000).slice(0, 8)}`,
      avatarUrl: user.avatar || null,
      departmentId: user.workspaceId && user.workspaceId !== 'ALL' ? user.workspaceId : null,
      status: 'ACTIVE',
      employeeCode: user.employeeCode || `${user.role === 'ADMIN' ? 'BGH' : user.role === 'MANAGER' ? 'QL' : 'NV'}-${String(index + 1).padStart(4, '0')}`,
      staffType: user.role === 'ADMIN' ? 'MANAGER' : user.role === 'MANAGER' ? 'MANAGER' : (user.title || '').toLowerCase().includes('giáo viên') ? 'TEACHER' : 'STAFF',
      joinedAt: new Date(now.getFullYear() - (index % 6), index % 12, (index % 25) + 1),
      managerId: MOCK_USERS.find((candidate: any) => candidate.workspaceId === user.workspaceId && candidate.role === 'MANAGER')?.id || MOCK_USERS.find((candidate: any) => candidate.workspaceId === 'BGH' && candidate.role === 'ADMIN')?.id || null,
      teachingLevel: (user.title || '').toLowerCase().includes('giáo viên') ? (index % 2 === 0 ? 'THCS' : 'THPT') : null,
      subject: (user.title || '').includes('Toán') ? 'Toán' : (user.title || '').includes('Văn') ? 'Ngữ văn' : (user.title || '').includes('Tin') ? 'Tin học' : null,
      homeroomClassId: (user.title || '').toLowerCase().includes('giáo viên') ? `${10 + (index % 3)}A${(index % 5) + 1}` : null,
      internalNote: `Seed hồ sơ thành viên: ${user.roleName || user.role} - ${user.workspaceId || 'N/A'}`,
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

  // Seed employee profiles and contracts
  console.log("Seeding employee profiles and contracts...");
  const profiles = [];
  const contracts = [];
  const attendances = [];
  const payrolls = [];
  const leaveReqs = [];

  for (let i = 0; i < MOCK_USERS.length; i++) {
    const user = MOCK_USERS[i];
    const index = i;
    const employeeCode = user.employeeCode || `${user.role === 'ADMIN' ? 'BGH' : user.role === 'MANAGER' ? 'QL' : 'NV'}-${String(index + 1).padStart(4, '0')}`;
    const joinedAtDate = new Date(now.getFullYear() - (index % 6), index % 12, (index % 25) + 1);
    const managerId = MOCK_USERS.find((candidate: any) => candidate.workspaceId === user.workspaceId && candidate.role === 'MANAGER')?.id || MOCK_USERS.find((candidate: any) => candidate.workspaceId === 'BGH' && candidate.role === 'ADMIN')?.id || null;

    profiles.push({
      id: `ep_${user.id}`,
      userId: user.id,
      employeeCode: employeeCode,
      identityCard: `03009000${String(1000 + index).slice(1)}`,
      socialInsurance: `0123456${String(1000 + index).slice(1)}`,
      phoneNumber: user.phone || `09${String(10000000 + index).slice(0, 8)}`,
      gender: user.name.includes('Thầy') || ['user_chutich', 'user_ceo', 'user_triet', 'user_tuan', 'user_nam_anh'].includes(user.id) ? 'Nam' : (user.name.includes('Cô') ? 'Nữ' : (index % 2 === 0 ? 'Nữ' : 'Nam')),
      dateOfBirth: new Date(1980 + (index % 15), index % 12, (index % 25) + 1),
      address: `Số ${index + 1} Đường Lê Lợi, Cầu Giấy, Hà Nội`,
      bankAccount: `1903456789${index}`,
      bankName: 'Techcombank',
      reportsTo: managerId,
      status: (user.workspaceId === 'BGH' || user.role === 'ADMIN' || user.id === 'user_chutich') ? 'active' : (index % 12 === 0 ? 'probation' : 'active'),
      joinDate: joinedAtDate,
      createdAt: now,
      updatedAt: now,
      payload: {},
    });

    const baseSalary = 15000000 + (index % 10) * 1000000;
    contracts.push({
      id: `contract_${user.id}`,
      employeeProfileId: `ep_${user.id}`,
      contractNumber: `HDLD-${employeeCode}`,
      type: user.role === 'ADMIN' ? 'không xác định thời hạn' : 'xác định thời hạn 3 năm',
      status: 'active',
      startDate: joinedAtDate,
      endDate: new Date(joinedAtDate.getFullYear() + 3, joinedAtDate.getMonth(), joinedAtDate.getDate()),
      baseSalary: baseSalary,
      createdAt: now,
      updatedAt: now,
      payload: {},
    });

    attendances.push({
      id: `att_${user.id}`,
      employeeProfileId: `ep_${user.id}`,
      date: now,
      checkIn: '08:00',
      checkOut: '17:00',
      status: index % 15 === 0 ? 'late' : index % 20 === 0 ? 'absent' : 'present',
      createdAt: now,
      updatedAt: now,
      payload: {},
    });

    payrolls.push({
      id: `payroll_${user.id}`,
      employeeProfileId: `ep_${user.id}`,
      month: '2025-05',
      baseSalary: baseSalary,
      allowances: 1500000,
      deductions: 500000,
      netSalary: baseSalary + 1500000 - 500000,
      status: 'paid',
      paidAt: now,
      createdAt: now,
      updatedAt: now,
      payload: {},
    });

    if (index % 10 === 0) {
      leaveReqs.push({
        id: `leave_${user.id}`,
        employeeProfileId: `ep_${user.id}`,
        type: 'phép năm',
        startDate: new Date(now.getTime() - 2 * 24 * 3600 * 1000),
        endDate: new Date(now.getTime() - 1 * 24 * 3600 * 1000),
        reason: 'Nghỉ giải quyết việc gia đình',
        status: index % 3 === 0 ? 'pending' : 'approved',
        approvedById: 'user_triet',
        substituteTeacherId: null,
        createdAt: now,
        updatedAt: now,
        payload: {},
      });
    }
  }

  await db.insert(schema.employeeProfiles).values(profiles).onConflictDoNothing();
  await db.insert(schema.employmentContracts).values(contracts).onConflictDoNothing();
  await db.insert(schema.attendanceRecords).values(attendances).onConflictDoNothing();
  await db.insert(schema.payrollRecords).values(payrolls).onConflictDoNothing();
  if (leaveReqs.length > 0) {
    await db.insert(schema.leaveRequests).values(leaveReqs).onConflictDoNothing();
  }

  // Seed risks
  console.log("Seeding risks...");
  const mockRisks = [
    {
      id: 'R01',
      title: 'Thâm hụt ngân sách vượt kế hoạch',
      severity: 'high',
      status: 'open',
      payload: { category: 'Tài chính', probability: 'Cao', owner: 'Phạm Thị Lan', ownerRole: 'Phó hiệu trưởng', plan: 'Rà soát chi phí, kiểm soát ngân sách theo tháng', date: '31/05/2026', impact: 5, likelihood: 4 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R02',
      title: 'Gián đoạn hoạt động do sự cố hệ thống',
      severity: 'high',
      status: 'open',
      payload: { category: 'Hoạt động', probability: 'Trung bình', owner: 'Trần Văn Hùng', ownerRole: 'Trưởng phòng CNTT', plan: 'Sao lưu dữ liệu, kiểm thử DR định kỳ', date: '15/06/2026', impact: 4, likelihood: 3 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R03',
      title: 'Thiếu giáo viên cốt lõi',
      severity: 'high',
      status: 'open',
      payload: { category: 'Nhân sự', probability: 'Cao', owner: 'Lê Thị Mai', ownerRole: 'Trưởng phòng TC-HC', plan: 'Kế hoạch tuyển dụng, phát triển nguồn thay thế', date: '30/06/2026', impact: 4, likelihood: 4 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R04',
      title: 'Không tuân thủ quy định tài chính',
      severity: 'high',
      status: 'open',
      payload: { category: 'Tuân thủ', probability: 'Trung bình', owner: 'Nguyễn Văn Nam', ownerRole: 'Hiệu trưởng', plan: 'Đào tạo, kiểm tra tuân thủ định kỳ', date: '20/06/2026', impact: 4, likelihood: 3 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R05',
      title: 'Suy giảm uy tín do phản hồi tiêu cực',
      severity: 'medium',
      status: 'open',
      payload: { category: 'Danh tiếng', probability: 'Trung bình', owner: 'Vũ Thị Hạnh', ownerRole: 'Trưởng phòng Truyền thông', plan: 'Theo dõi truyền thông, phản hồi kịp thời', date: '30/06/2026', impact: 3, likelihood: 3 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R06',
      title: 'Rò rỉ dữ liệu học sinh',
      severity: 'high',
      status: 'open',
      payload: { category: 'An toàn dữ liệu', probability: 'Trung bình', owner: 'Trần Văn Hùng', ownerRole: 'Trưởng phòng CNTT', plan: 'Mã hóa dữ liệu, phân quyền truy cập', date: '25/05/2026', impact: 5, likelihood: 3 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R07',
      title: 'Tai nạn/Chấn thương trong giờ thể chất',
      severity: 'medium',
      status: 'open',
      payload: { category: 'An toàn học đường', probability: 'Thấp', owner: 'Nguyễn Văn Nam', ownerRole: 'Hiệu trưởng', plan: 'Bảo trì thiết bị thể chất, tập huấn sơ cứu', date: '12/07/2026', impact: 3, likelihood: 2 },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'R08',
      title: 'Sự cố cháy nổ phòng thí nghiệm',
      severity: 'high',
      status: 'open',
      payload: { category: 'Cơ sở vật chất', probability: 'Thấp', owner: 'Ngô Anh Tuấn', ownerRole: 'Phó Hiệu trưởng CSVC', plan: 'Trang bị bình cứu hỏa, nội quy nghiêm ngặt', date: '18/06/2026', impact: 5, likelihood: 2 },
      createdAt: now,
      updatedAt: now
    }
  ];
  await db.insert(schema.risks).values(mockRisks).onConflictDoNothing();


  // Seed Classes
  console.log("Seeding classes...");
  const seedClasses = [
    // Tiểu học
    { id: "class_1A1", name: "1A1", code: "1A1", gradeLevel: "1" },
    { id: "class_1A2", name: "1A2", code: "1A2", gradeLevel: "1" },
    { id: "class_1A3", name: "1A3", code: "1A3", gradeLevel: "1" },
    { id: "class_1A4", name: "1A4", code: "1A4", gradeLevel: "1" },
    { id: "class_2A1", name: "2A1", code: "2A1", gradeLevel: "2" },
    { id: "class_2A2", name: "2A2", code: "2A2", gradeLevel: "2" },
    { id: "class_2A3", name: "2A3", code: "2A3", gradeLevel: "2" },
    { id: "class_2A4", name: "2A4", code: "2A4", gradeLevel: "2" },
    { id: "class_3A1", name: "3A1", code: "3A1", gradeLevel: "3" },
    { id: "class_3A2", name: "3A2", code: "3A2", gradeLevel: "3" },
    { id: "class_3A3", name: "3A3", code: "3A3", gradeLevel: "3" },
    { id: "class_3A4", name: "3A4", code: "3A4", gradeLevel: "3" },
    { id: "class_4A1", name: "4A1", code: "4A1", gradeLevel: "4" },
    { id: "class_4A2", name: "4A2", code: "4A2", gradeLevel: "4" },
    { id: "class_4A3", name: "4A3", code: "4A3", gradeLevel: "4" },
    { id: "class_4A4", name: "4A4", code: "4A4", gradeLevel: "4" },
    { id: "class_5A1", name: "5A1", code: "5A1", gradeLevel: "5" },
    { id: "class_5A2", name: "5A2", code: "5A2", gradeLevel: "5" },
    { id: "class_5A3", name: "5A3", code: "5A3", gradeLevel: "5" },
    { id: "class_5A4", name: "5A4", code: "5A4", gradeLevel: "5" },
    // THCS
    { id: "class_6A1", name: "6A1", code: "6A1", gradeLevel: "6" },
    { id: "class_6A2", name: "6A2", code: "6A2", gradeLevel: "6" },
    { id: "class_7A1", name: "7A1", code: "7A1", gradeLevel: "7" },
    { id: "class_7A2", name: "7A2", code: "7A2", gradeLevel: "7" },
    { id: "class_8A1", name: "8A1", code: "8A1", gradeLevel: "8" },
    { id: "class_8A2", name: "8A2", code: "8A2", gradeLevel: "8" },
    { id: "class_9A1", name: "9A1", code: "9A1", gradeLevel: "9" },
    { id: "class_9A2", name: "9A2", code: "9A2", gradeLevel: "9" },
    // THPT
    { id: "class_10A1", name: "10A1", code: "10A1", gradeLevel: "10" },
    { id: "class_10A2", name: "10A2", code: "10A2", gradeLevel: "10" },
    { id: "class_11A1", name: "11A1", code: "11A1", gradeLevel: "11" },
    { id: "class_11A2", name: "11A2", code: "11A2", gradeLevel: "11" },
    { id: "class_12A1", name: "12A1", code: "12A1", gradeLevel: "12" },
    { id: "class_12A2", name: "12A2", code: "12A2", gradeLevel: "12" },
  ];

  await db.insert(schema.classes).values(seedClasses.map(c => ({
    ...c,
    createdAt: now,
    updatedAt: now
  }))).onConflictDoNothing();

  // Seed Student Directory
  console.log("Seeding student directory...");
  const FIRST_NAMES = ['Nguyễn', 'Trần', 'Phạm', 'Võ', 'Lê', 'Hoàng', 'Đỗ', 'Phan', 'Trịnh', 'Bùi', 'Đặng', 'Lương', 'Ngô'];
  const MIDDLE_NAMES = ['Hoàng', 'Minh', 'Gia', 'Bảo', 'Đức', 'Quang', 'Hồng', 'Thị', 'Văn', 'Tuấn', 'Thanh', 'Khánh'];
  const LAST_NAMES = ['Anh', 'Tuấn', 'Hà', 'Nam', 'Châu', 'Khang', 'Ngọc', 'Linh', 'Huy', 'Sơn', 'Dương', 'Hải'];

  const mockStudents = [];
  const mockGrades: any[] = [];
  const mockTuitions: any[] = [];

  const classCounts: Record<string, number> = {
    '1A1': 31, '1A2': 31, '1A3': 31, '1A4': 29,
    '2A1': 31, '2A2': 31, '2A3': 30, '2A4': 30,
    '3A1': 31, '3A2': 31, '3A3': 30, '3A4': 30,
    '4A1': 31, '4A2': 31, '4A3': 30, '4A4': 30,
    '5A1': 31, '5A2': 31, '5A3': 30, '5A4': 30,
    '6A1': 31, '6A2': 30,
    '7A1': 31, '7A2': 30,
    '8A1': 31, '8A2': 30,
    '9A1': 31, '9A2': 30,
    '10A1': 32, '10A2': 32,
    '11A1': 32, '11A2': 32,
    '12A1': 32, '12A2': 31,
  };

  let globalIdx = 0;
  for (const c of seedClasses) {
    const limit = classCounts[c.name] || 30;
    for (let sIdx = 1; sIdx <= limit; sIdx++) {
      globalIdx++;
      const fn = FIRST_NAMES[globalIdx % FIRST_NAMES.length];
      const mn = MIDDLE_NAMES[(globalIdx * 3) % MIDDLE_NAMES.length];
      const ln = LAST_NAMES[(globalIdx * 7) % LAST_NAMES.length];
      const name = `${fn} ${mn} ${ln}`;
      const code = `HS2026${String(1000 + globalIdx).padStart(4, '0')}`;
      const studentId = `stud_${String(globalIdx).padStart(4, '0')}`;
      const className = c.name;
      const gpa = Number((7.0 + (globalIdx % 6) * 0.4 + (sIdx % 2) * 0.3).toFixed(1));
      const attendanceRate = `${95 + (globalIdx % 4)}.${globalIdx % 9}%`;
      const present = 170 + (globalIdx % 10);
      const excused = 2 + (globalIdx % 4);
      const unexcused = globalIdx % 2;
      const late = globalIdx % 3;

      mockStudents.push({
        id: studentId,
        code: code,
        name: name,
        className: className,
        enrollmentStatus: 'active',
        parentName: `${fn} ${mn} Hùng`,
        parentPhone: `090${globalIdx}123456`,
        parentEmail: `parent_${globalIdx}@gmail.com`,
        payload: {
          gender: globalIdx % 2 === 0 ? 'Nữ' : 'Nam',
          dob: `${String(1 + (globalIdx % 28)).padStart(2, '0')}/${String(1 + (globalIdx % 12)).padStart(2, '0')}/2008`,
          location: 'Hà Nội',
          ethnicity: 'Kinh',
          admissionDate: '01/08/2024',
          sparkline: `M0,15 L20,${10 + (globalIdx % 8)} L40,${5 + (globalIdx % 10)} L60,${12 + (globalIdx % 6)} L80,${8 + (globalIdx % 5)} L100,${2 + (globalIdx % 3)}`,
          rank: `${sIdx}/${limit}`,
          gpa: gpa,
          attendanceRate: attendanceRate,
          attendanceStat: { present, excused, unexcused, late },
          conduct: { 
            status: gpa >= 8.5 ? 'Tốt' : 'Khá', 
            advantages: ['Tự giác học tập', 'Hòa đồng, trách nhiệm'], 
            notes: gpa < 8.0 ? ['Cần tập trung môn tự nhiên'] : ['Không có'] 
          },
          health: { status: 'Tốt', height: `${160 + (globalIdx % 15)} cm`, weight: `${50 + (globalIdx % 20)} kg`, bloodType: 'O+', warning: 'Không có' },
          parents: [
            { name: `${fn} ${mn} Hùng`, relation: 'Bố', phone: `090${globalIdx} 123 456`, email: `parent_${globalIdx}@gmail.com`, avatar: `https://i.pravatar.cc/150?u=dad${globalIdx}` }
          ],
          achievements: [
            { date: '01/2025', title: 'Học sinh Giỏi', organization: 'Trường MIS' }
          ],
          timeline: [
            { time: '15/05/2025 14:30', title: 'Trao đổi học tập', desc: 'Giáo viên bộ môn thông báo về tinh thần học tập tiến bộ.', user: 'Cô Phạm Thu Hương', icon: 'MessageSquare', color: 'bg-blue-600' }
          ]
        },
        createdAt: now,
        updatedAt: now
      });

      const subjects = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học'];
      subjects.forEach((subj, sIdx) => {
        const score = Number((gpa - 0.5 + (sIdx % 3) * 0.4).toFixed(1));
        mockGrades.push({
          id: `gr_${String(globalIdx).padStart(4, '0')}_${sIdx + 1}`,
          studentId: studentId,
          subject: subj,
          payload: { score, scores: { midTerm: score - 0.5, finalTerm: score + 0.5, quizzes: [score, score - 0.2, score + 0.3] } },
          createdAt: now,
          updatedAt: now
        });
      });

      mockTuitions.push({ 
        id: `tf_${String(globalIdx).padStart(4, '0')}_01`, 
        studentId: studentId, 
        invoiceNo: `INV-2025-${String(globalIdx).padStart(3, '0')}`, 
        amount: '4500000', 
        status: globalIdx % 3 === 0 ? 'pending' : 'paid', 
        payload: { title: 'Học phí Tháng 05/2025', dueDate: '10/05/2025', method: globalIdx % 3 === 0 ? 'Chờ thanh toán' : 'Chuyển khoản VietQR' }, 
        createdAt: now, 
        updatedAt: now 
      });
    }
  }

  // Insert students in chunks
  console.log(`Inserting ${mockStudents.length} students...`);
  for (let i = 0; i < mockStudents.length; i += 500) {
    await db.insert(schema.studentDirectory).values(mockStudents.slice(i, i + 500)).onConflictDoNothing();
  }

  // Seed SIS Grades
  console.log(`Seeding ${mockGrades.length} student grades...`);
  for (let i = 0; i < mockGrades.length; i += 1000) {
    await db.insert(schema.sisGrades).values(mockGrades.slice(i, i + 1000)).onConflictDoNothing();
  }

  // Seed Tuition Fees
  console.log(`Seeding ${mockTuitions.length} tuition fees...`);
  for (let i = 0; i < mockTuitions.length; i += 500) {
    await db.insert(schema.tuitionFees).values(mockTuitions.slice(i, i + 500)).onConflictDoNothing();
  }

  // Seed Announcements
  console.log("Seeding announcements...");
  const mockAnnouncements = [
    {
      id: 'ann_1',
      title: 'Triển khai chuyên đề nâng cao ứng dụng AI trong giảng dạy năm học 2025-2026',
      senderName: 'PGS.TS. Nguyễn Văn Minh',
      isMeeting: false,
      payload: {
        id: 'ann_1',
        title: 'Triển khai chuyên đề nâng cao ứng dụng AI trong giảng dạy năm học 2025-2026',
        content: 'Yêu cầu toàn thể giáo viên các tổ bộ môn (Toán - Tin, Ngữ văn, Ngoại ngữ, KHTN) tham dự khóa tập huấn ứng dụng các mô hình ngôn ngữ lớn (LLMs) hỗ trợ xây dựng giáo án và bài tập tự học cho học sinh.',
        senderName: 'PGS.TS. Nguyễn Văn Minh',
        senderTitle: 'Hiệu trưởng',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        createdAt: now.toISOString(),
        targetRoles: ['ADMIN', 'MANAGER', 'STAFF'],
        isMeeting: false,
        acknowledgedBy: []
      },
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'ann_2',
      title: 'Họp hội đồng sư phạm tổng kết thi đua và kế hoạch Ngày hội STEM',
      senderName: 'Lê Quang Triết',
      isMeeting: true,
      payload: {
        id: 'ann_2',
        title: 'Họp hội đồng sư phạm tổng kết thi đua và kế hoạch Ngày hội STEM',
        content: 'Ban Giám hiệu triệu tập cuộc họp khẩn với các Trưởng bộ phận và Tổ trưởng chuyên môn nhằm rà soát và thông qua chương trình Ngày hội Trải nghiệm Khoa học công nghệ STEM 2026.',
        senderName: 'Lê Quang Triết',
        senderTitle: 'Phó Hiệu trưởng',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        createdAt: now.toISOString(),
        targetRoles: ['ADMIN', 'MANAGER'],
        meetingTime: '14:00 ngày 22/06/2026',
        meetingLocation: 'Phòng Hội đồng sư phạm tầng 2',
        isMeeting: true,
        acknowledgedBy: []
      },
      createdAt: now,
      updatedAt: now
    }
  ];
  await db.insert(schema.announcements).values(mockAnnouncements).onConflictDoNothing();

  // Seed Facilities Module
  console.log("Seeding facilities data...");
  const mockLocations = [
    { id: 'LOC-10A1', code: 'LOC-A101', name: 'Phòng học 10A1', type: 'CLASSROOM', building: 'Nhà A', floor: 'Tầng 1', capacity: 40, managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', note: 'Phòng học tiêu chuẩn hệ Song ngữ', createdAt: now, updatedAt: now },
    { id: 'LOC-LAB202', code: 'LOC-B202', name: 'Phòng Thí nghiệm Hóa học', type: 'LAB', building: 'Nhà B', floor: 'Tầng 2', capacity: 30, managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', note: 'Trang bị tủ hút độc và vòi tắm khẩn cấp', createdAt: now, updatedAt: now },
    { id: 'LOC-LIB', code: 'LOC-C101', name: 'Thư viện Trung tâm', type: 'LIBRARY', building: 'Nhà C', floor: 'Tầng 1', capacity: 100, managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', note: 'Không gian tự học và đọc sách', createdAt: now, updatedAt: now },
    { id: 'LOC-WAREHOUSE', code: 'LOC-W01', name: 'Kho Thiết bị Tổng hợp', type: 'WAREHOUSE', building: 'Nhà A', floor: 'Tầng 1', capacity: 20, managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', note: 'Kho chứa vật tư tiêu hao và thiết bị dự phòng', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesLocations).values(mockLocations).onConflictDoNothing();

  const mockAssets = [
    { id: 'AST-PROJ01', code: 'AST-IT-001', name: 'Máy chiếu thông minh Epson 4K', category: 'IT', type: 'MÁY CHIẾU', brand: 'Epson', model: 'EB-L520U', serialNumber: 'EPSON8839210', purchaseDate: new Date('2025-01-15'), startUsingDate: new Date('2025-02-01'), locationId: 'LOC-10A1', locationName: 'Phòng học 10A1', responsibleUserId: 'user_tuan', responsibleUserName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', maintenancePriority: 'HIGH', lastMaintenanceDate: new Date('2025-05-10'), nextMaintenanceDate: new Date('2025-11-10'), note: 'Đang hoạt động tốt', sourceType: 'MANUAL', createdAt: now, updatedAt: now },
    { id: 'AST-COMP01', code: 'AST-IT-002', name: 'Hệ thống Máy tính Phòng Lab HP', category: 'IT', type: 'MÁY TÍNH BÀN', brand: 'HP', model: 'ProDesk 400 G9', serialNumber: 'HPCOMP883921', purchaseDate: new Date('2025-02-10'), startUsingDate: new Date('2025-02-15'), locationId: 'LOC-LAB202', locationName: 'Phòng Thí nghiệm Hóa học', responsibleUserId: 'user_tuan', responsibleUserName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', maintenancePriority: 'MEDIUM', lastMaintenanceDate: new Date('2025-05-15'), nextMaintenanceDate: new Date('2025-11-15'), note: 'Dàn 30 máy trạm', sourceType: 'MANUAL', createdAt: now, updatedAt: now },
    { id: 'AST-AC01', code: 'AST-EL-001', name: 'Điều hòa âm trần Daikin 24000BTU', category: 'ELECTRONIC', type: 'ĐIỀU HÒA', brand: 'Daikin', model: 'FCNQ24MV1', serialNumber: 'DAIKIN99827', purchaseDate: new Date('2024-06-20'), startUsingDate: new Date('2024-07-01'), locationId: 'LOC-LIB', locationName: 'Thư viện Trung tâm', responsibleUserId: 'user_tuan', responsibleUserName: 'Nguyễn Văn Tuấn', status: 'ACTIVE', maintenancePriority: 'MEDIUM', lastMaintenanceDate: new Date('2025-04-10'), nextMaintenanceDate: new Date('2025-10-10',), note: 'Vừa bảo trì định kỳ nạp gas', sourceType: 'MANUAL', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesAssets).values(mockAssets).onConflictDoNothing();

  const mockRepairRequests = [
    { id: 'REP-001', title: 'Máy chiếu phòng 10A1 chập chờn tín hiệu', assetId: 'AST-PROJ01', assetName: 'Máy chiếu thông minh Epson 4K', locationId: 'LOC-10A1', locationName: 'Phòng học 10A1', description: 'Máy chiếu khởi động lên rồi tự tắt sau 5 phút, đèn cảnh báo nhấp nháy đỏ.', priority: 'HIGH', status: 'NEW', requestedById: 'user_tuan', requestedByName: 'Nguyễn Văn Tuấn', assignedToId: 'user_tuan', assignedToName: 'Nguyễn Văn Tuấn', receivedAt: now, firstResponseDueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), resolutionDueAt: new Date(now.getTime() + 8 * 60 * 60 * 1000), slaStatus: 'IN_TIME', createdAt: now, updatedAt: now },
    { id: 'REP-002', title: 'Điều hòa Thư viện phát tiếng ồn lớn', assetId: 'AST-AC01', assetName: 'Điều hòa âm trần Daikin 24000BTU', locationId: 'LOC-LIB', locationName: 'Thư viện Trung tâm', description: 'Cục lạnh điều hòa góc phải phát tiếng rè rè to khi chạy tốc độ cao.', priority: 'MEDIUM', status: 'PROCESSING', requestedById: 'user_tuan', requestedByName: 'Nguyễn Văn Tuấn', assignedToId: 'user_tuan', assignedToName: 'Nguyễn Văn Tuấn', receivedAt: now, firstResponseDueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000), resolutionDueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), slaStatus: 'IN_TIME', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesRepairRequests).values(mockRepairRequests).onConflictDoNothing();

  const mockSupplies = [
    { id: 'SUP-A4', code: 'SUP-OFF-001', name: 'Giấy in A4 Double A 80gsm', category: 'Văn phòng phẩm', unit: 'Ram', currentQuantity: 50, minimumQuantity: 10, storageLocation: 'Kho Thiết bị Tổng hợp', managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'IN_STOCK', lastImportedAt: now, note: 'Sử dụng cho toàn trường', createdAt: now, updatedAt: now },
    { id: 'SUP-PEN', code: 'SUP-OFF-002', name: 'Bút bi Thiên Long xanh', category: 'Thiết bị giảng dạy', unit: 'Hộp', currentQuantity: 120, minimumQuantity: 20, storageLocation: 'Kho Thiết bị Tổng hợp', managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'IN_STOCK', lastImportedAt: now, note: 'Cấp phát cho giáo viên', createdAt: now, updatedAt: now },
    { id: 'SUP-MASK', code: 'SUP-MED-001', name: 'Khẩu trang y tế 4 lớp', category: 'Y tế học đường', unit: 'Hộp', currentQuantity: 5, minimumQuantity: 15, storageLocation: 'Kho Thiết bị Tổng hợp', managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', status: 'LOW_STOCK', lastImportedAt: now, note: 'Khẩu trang dự phòng phòng y tế', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesSupplies).values(mockSupplies).onConflictDoNothing();

  const mockSuppliers = [
    { id: 'SPL-001', code: 'SPL-VPP-01', name: 'Công ty Cổ phần Thiết bị Giáo dục Hồng Hà', contactPerson: 'Nguyễn Văn Hà', phone: '0988776655', email: 'sales@hongha.vn', address: 'Số 25 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', serviceTypes: ['SUPPLY'], rating: 5, status: 'ACTIVE', note: 'Nhà cung cấp văn phòng phẩm chính', createdAt: now, updatedAt: now },
    { id: 'SPL-002', code: 'SPL-IT-02', name: 'Hệ thống Máy tính Phong Vũ', contactPerson: 'Trần Minh Vũ', phone: '0911223344', email: 'sales@phongvu.vn', address: 'Số 1 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội', serviceTypes: ['SUPPLY', 'REPAIR'], rating: 4, status: 'ACTIVE', note: 'Cung cấp thiết bị IT và bảo trì hệ thống máy tính', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesSuppliers).values(mockSuppliers).onConflictDoNothing();

  const mockWarranties = [
    { id: 'WAR-001', assetId: 'AST-PROJ01', supplierId: 'SPL-002', warrantyStartDate: new Date('2025-01-15'), warrantyEndDate: new Date('2027-01-15'), warrantyTerms: 'Bảo hành chính hãng 24 tháng lỗi nhà sản xuất, 1000 giờ bóng đèn.', warrantyCode: 'PV-WAR-99381', documentUrl: '/docs/warranty/projector_epson.pdf', status: 'ACTIVE', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesWarranties).values(mockWarranties).onConflictDoNothing();

  const mockSafetyChecks = [
    { id: 'SF-001', code: 'SFC-PCCC-01', title: 'Kiểm tra định kỳ Bình chữa cháy nhà A', checkType: 'FIRE_SAFETY', locationId: 'LOC-10A1', assignedToId: 'user_tuan', assignedToName: 'Nguyễn Văn Tuấn', cycle: 'MONTHLY', lastCheckedAt: now, nextCheckAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), status: 'PASSED', result: 'Đạt yêu cầu', issueDescription: null, note: 'Áp suất bình ổn định, hạn sử dụng còn dài', createdAt: now, updatedAt: now },
    { id: 'SF-002', code: 'SFC-ELE-02', title: 'Kiểm tra hệ thống điện phòng LAB 202', checkType: 'ELECTRICAL', locationId: 'LOC-LAB202', assignedToId: 'user_tuan', assignedToName: 'Nguyễn Văn Tuấn', cycle: 'QUARTERLY', lastCheckedAt: now, nextCheckAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), status: 'PENDING', result: null, issueDescription: null, note: 'Kế hoạch kiểm tra định kỳ hệ thống điện ổ cắm và tủ hút độc', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesSafetyChecks).values(mockSafetyChecks).onConflictDoNothing();

  const mockBookings = [
    { id: 'BKG-001', code: 'BKG-2026-0001', targetType: 'LOCATION', assetId: null, locationId: 'LOC-LAB202', requesterId: 'user_tuan', requesterName: 'Nguyễn Văn Tuấn', department: 'Tổ Toán - Tin', purpose: 'Dạy thực hành Hóa học lớp 11A1 chuyên đề phản ứng Este', startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), endTime: new Date(now.getTime() + 26 * 60 * 60 * 1000), approvedById: 'user_tuan', approvedByName: 'Nguyễn Văn Tuấn', status: 'APPROVED', conditionBefore: 'Đầy đủ dụng cụ thủy tinh sạch, thiết bị điện an toàn', conditionAfter: null, note: 'Cần hỗ trợ kỹ thuật viên phòng thí nghiệm chuẩn bị hóa chất', createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesBookingRequests).values(mockBookings).onConflictDoNothing();

  const mockRenovations = [
    { id: 'REN-001', code: 'REN-2026-001', title: 'Sơn lại toàn bộ hành lang và phòng học nhà A', scope: 'Nhà A (Toàn bộ hành lang từ tầng 1 đến tầng 4, 12 phòng học)', reason: 'Lớp sơn cũ bong tróc và bẩn do mực/bụi phấn sau 3 năm sử dụng.', locationId: 'LOC-10A1', managerId: 'user_tuan', managerName: 'Nguyễn Văn Tuấn', plannedStartDate: now, plannedEndDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), actualStartDate: now, actualEndDate: null, status: 'IN_PROGRESS', tasks: [{ taskName: 'Cạo bỏ lớp sơn cũ bong tróc', completed: true }, { taskName: 'Sơn lót chống kiềm', completed: false }, { taskName: 'Sơn phủ màu 2 lớp', completed: false }], beforeImageUrls: ['/images/renovation/before_1.jpg'], afterImageUrls: null, acceptanceNote: null, relatedPurchaseRequestId: null, createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesRenovationProjects).values(mockRenovations).onConflictDoNothing();

  const mockSlaSettings = [
    { id: 'SLA-1', priority: 'URGENT', firstResponseHours: 1, resolutionHours: 4, createdAt: now, updatedAt: now },
    { id: 'SLA-2', priority: 'HIGH', firstResponseHours: 2, resolutionHours: 8, createdAt: now, updatedAt: now },
    { id: 'SLA-3', priority: 'MEDIUM', firstResponseHours: 4, resolutionHours: 24, createdAt: now, updatedAt: now },
    { id: 'SLA-4', priority: 'LOW', firstResponseHours: 8, resolutionHours: 48, createdAt: now, updatedAt: now }
  ];
  await db.insert(schema.facilitiesSlaSettings).values(mockSlaSettings).onConflictDoNothing();

  console.log(`Seeded ${WORKSPACES.length} workspaces, ${MOCK_USERS.length} users, ${INITIAL_TASKS.length} tasks, ${mockLeads.length} leads, ${mockAnnouncements.length} announcements.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pgliteClient.close();
});
