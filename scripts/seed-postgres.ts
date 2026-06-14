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

  console.log(`Seeded ${WORKSPACES.length} workspaces, ${MOCK_USERS.length} users, ${INITIAL_TASKS.length} tasks, ${mockLeads.length} leads.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pgliteClient.close();
});
