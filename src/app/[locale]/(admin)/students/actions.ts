"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { studentService } from "@/src/libs/server/student-service";
import { revalidatePath } from "next/cache";
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from "@/src/libs/server/auth-helper";

const STUDENT_SEED = [
  { id: "student_seed_001", code: "HS2025001", name: "Nguyễn Minh Anh", className: "6A1", gpa: 8.7, rank: "3/42", gender: "Nữ" },
  { id: "student_seed_002", code: "HS2025002", name: "Trần Gia Huy", className: "6A1", gpa: 8.1, rank: "9/42", gender: "Nam" },
  { id: "student_seed_003", code: "HS2025003", name: "Lê Khánh Linh", className: "7A1", gpa: 9.0, rank: "1/40", gender: "Nữ" },
  { id: "student_seed_004", code: "HS2025004", name: "Phạm Đức Anh", className: "7A1", gpa: 7.8, rank: "14/40", gender: "Nam" },
  { id: "student_seed_005", code: "HS2025005", name: "Hoàng Bảo Ngọc", className: "8A1", gpa: 8.5, rank: "5/39", gender: "Nữ" },
  { id: "student_seed_006", code: "HS2025006", name: "Vũ Quang Minh", className: "8A1", gpa: 7.9, rank: "12/39", gender: "Nam" },
  { id: "student_seed_007", code: "HS2025007", name: "Đỗ Nhật Nam", className: "9A1", gpa: 8.3, rank: "7/41", gender: "Nam" },
  { id: "student_seed_008", code: "HS2025008", name: "Bùi Hà My", className: "9A1", gpa: 8.8, rank: "2/41", gender: "Nữ" },
  { id: "student_seed_009", code: "HS2025009", name: "Ngô Tuấn Kiệt", className: "10A1", gpa: 8.2, rank: "8/38", gender: "Nam" },
  { id: "student_seed_010", code: "HS2025010", name: "Phan Thảo Vy", className: "10A1", gpa: 8.6, rank: "4/38", gender: "Nữ" },
  { id: "student_seed_011", code: "HS2025011", name: "Đặng Hải Đăng", className: "11A1", gpa: 7.7, rank: "16/36", gender: "Nam" },
  { id: "student_seed_012", code: "HS2025012", name: "Mai Phương Anh", className: "12A1", gpa: 8.9, rank: "2/35", gender: "Nữ" },
];

const SUBJECTS = ["Toán", "Ngữ văn", "Tiếng Anh", "Khoa học", "Lịch sử", "Tin học"];

function canManageStudents(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || actor.workspaceId === 'BGH');
}

function studentsChanged() {
  revalidatePath('/[locale]/students', 'layout');
  revalidatePath('/[locale]/classes', 'layout');
}

function buildStudentInputPayload(input: any) {
  return {
    gpa: Number(input.gpa) || 0,
    rank: input.rank || 'N/A',
    dob: input.dob || '',
    gender: input.gender || '',
    location: input.location || '',
    admissionDate: input.admissionDate || new Date().toISOString().slice(0, 10),
    status: input.status || 'Đang học',
    attendanceRate: input.attendanceRate || '0%',
    attendanceStat: input.attendanceStat || { present: 0, excused: 0, unexcused: 0, late: 0 },
    conduct: input.conduct || { status: 'Tốt', advantages: [], notes: [] },
    health: input.health || { status: 'Tốt', height: '', weight: '', bloodType: '', warning: '' },
    achievements: input.achievements || [],
    parents: [{
      name: input.parentName || '',
      relation: 'Cha/Mẹ',
      phone: input.parentPhone || '',
      email: input.parentEmail || '',
    }].filter(parent => parent.name || parent.phone || parent.email),
    timeline: input.timeline || [],
  };
}

function buildStudentPayload(student: (typeof STUDENT_SEED)[number], index: number) {
  const attendancePresent = 172 + (index % 8);
  const excused = 3 + (index % 3);
  const unexcused = index % 2;

  return {
    gpa: student.gpa,
    rank: student.rank,
    dob: `20${10 - (index % 5)}-0${(index % 9) + 1}-15`,
    gender: student.gender,
    location: "TP. Hồ Chí Minh",
    admissionDate: "2024-08-15",
    status: "Đang học",
    attendanceRate: `${Math.round((attendancePresent / (attendancePresent + excused + unexcused)) * 1000) / 10}%`,
    attendanceStat: { present: attendancePresent, excused, unexcused, late: index % 4 },
    conduct: {
      status: student.gpa >= 8.5 ? "Tốt" : "Khá",
      advantages: ["Chủ động trong học tập", "Hợp tác tốt với bạn bè"],
      notes: student.gpa >= 8.5 ? ["Duy trì phong độ học tập tốt"] : ["Cần tăng tốc ôn tập theo tuần"],
    },
    health: { status: "Tốt", height: `${150 + index * 2} cm`, weight: `${42 + index} kg`, bloodType: "O+", warning: "Không có" },
    achievements: student.gpa >= 8.5 ? ["Học sinh xuất sắc tháng", "Tích cực CLB STEM"] : ["Tiến bộ trong học kỳ"],
    parents: [
      { name: `Phụ huynh ${student.name.split(" ").slice(-1)[0]}`, relation: "Cha/Mẹ", phone: `09${String(10000000 + index * 12345).slice(0, 8)}`, email: `phuhuynh${index + 1}@example.edu.vn` },
    ],
    timeline: [
      { date: "2024-09-05", title: "Khai giảng năm học", type: "school" },
      { date: "2024-11-20", title: "Cập nhật học lực giữa kỳ", type: "academic" },
      { date: "2025-01-10", title: "Hoàn tất hồ sơ 360°", type: "profile" },
    ],
    sparkline: "M0,15 L20,12 L40,8 L60,14 L80,5 L100,2",
  };
}

async function seedStudentsIfEmpty() {
  const existing = await db.select({ id: schema.studentDirectory.id }).from(schema.studentDirectory).limit(1);
  if (existing.length > 0) return;

  const now = new Date();

  await db.insert(schema.studentDirectory).values(
    STUDENT_SEED.map((student, index) => {
      const payload = buildStudentPayload(student, index);
      const parent = payload.parents[0];
      return {
        id: student.id,
        code: student.code,
        name: student.name,
        className: student.className,
        enrollmentStatus: "active",
        parentName: parent.name,
        parentPhone: parent.phone,
        parentEmail: parent.email,
        payload,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );

  await db.insert(schema.sisGrades).values(
    STUDENT_SEED.flatMap((student, studentIndex) =>
      SUBJECTS.map((subject, subjectIndex) => ({
        id: `grade_${student.id}_${subjectIndex + 1}`,
        studentId: student.id,
        subject,
        payload: {
          score: Number((student.gpa + (subjectIndex % 3) * 0.2 - 0.25).toFixed(1)),
          term: "HK2 2024-2025",
          teacher: ["Nguyễn Thị Lan", "Trần Văn Hùng", "Lê Minh Châu"][subjectIndex % 3],
          comment: studentIndex % 2 === 0 ? "Nắm chắc kiến thức, cần duy trì" : "Có tiến bộ rõ trong tháng gần nhất",
        },
        createdAt: now,
        updatedAt: now,
      })),
    ),
  );

  await db.insert(schema.tuitionFees).values(
    STUDENT_SEED.map((student, index) => ({
      id: `tuition_${student.id}`,
      studentId: student.id,
      invoiceNo: `INV-2025-${String(index + 1).padStart(3, "0")}`,
      amount: index % 4 === 0 ? "1850000" : "0",
      status: index % 4 === 0 ? "pending" : "paid",
      payload: {
        period: "Tháng 01/2025",
        dueDate: "2025-01-25",
        paidAt: index % 4 === 0 ? null : "2025-01-12",
        items: [{ name: "Học phí", amount: 1850000 }],
      },
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function getInitialData() {
  try {
    await seedStudentsIfEmpty();

    const [studentsList, gradesList, tuitionFeesList, officialCountSetting, admissionsTargetSetting] = await Promise.all([
      studentService.findMany({}),
      db.select().from(schema.sisGrades),
      db.select().from(schema.tuitionFees),
      db.select({ value: schema.systemSettings.value }).from(schema.systemSettings).where(eq(schema.systemSettings.key, 'academics:official_student_count')).limit(1),
      db.select({ value: schema.systemSettings.value }).from(schema.systemSettings).where(eq(schema.systemSettings.key, 'admissions:next_year_pipeline_target')).limit(1),
    ]);

    return {
      students: studentsList,
      grades: gradesList,
      tuitionFees: tuitionFeesList,
      officialStats: {
        totalStudents: Number(officialCountSetting[0]?.value || 1045),
        totalClasses: 34,
        averageClassSize: 30.7,
        admissionsPipeline: Number(admissionsTargetSetting[0]?.value || 150),
        classGroups: [
          { level: 'Tiểu học', grades: 'Khối 1-5', classes: 20, students: 610 },
          { level: 'THCS', grades: 'Khối 6-9', classes: 8, students: 244 },
          { level: 'THPT', grades: 'Khối 10-12', classes: 6, students: 191 },
        ],
        classDistribution: [
          { className: '1A1', students: 31 }, { className: '1A2', students: 31 }, { className: '1A3', students: 31 }, { className: '1A4', students: 29 },
          { className: '2A1', students: 31 }, { className: '2A2', students: 31 }, { className: '2A3', students: 30 }, { className: '2A4', students: 30 },
          { className: '3A1', students: 31 }, { className: '3A2', students: 31 }, { className: '3A3', students: 30 }, { className: '3A4', students: 30 },
          { className: '4A1', students: 31 }, { className: '4A2', students: 31 }, { className: '4A3', students: 30 }, { className: '4A4', students: 30 },
          { className: '5A1', students: 31 }, { className: '5A2', students: 31 }, { className: '5A3', students: 30 }, { className: '5A4', students: 30 },
          { className: '6A1', students: 31 }, { className: '6A2', students: 30 },
          { className: '7A1', students: 31 }, { className: '7A2', students: 30 },
          { className: '8A1', students: 31 }, { className: '8A2', students: 30 },
          { className: '9A1', students: 31 }, { className: '9A2', students: 30 },
          { className: '10A1', students: 32 }, { className: '10A2', students: 32 },
          { className: '11A1', students: 32 }, { className: '11A2', students: 32 },
          { className: '12A1', students: 32 }, { className: '12A2', students: 31 },
        ],
      },
    };
  } catch (e) {
    console.error("Failed to fetch students data:", e);
    return { students: [], grades: [], tuitionFees: [] };
  }
}

export async function createStudent(input: any) {
  try {
    const actor = await getCurrentActor();
    if (!canManageStudents(actor)) return { success: false, error: 'Unauthorized' };
    const name = String(input.name || '').trim();
    if (!name) return { success: false, error: 'Họ tên học sinh bắt buộc.' };
    const id = `student_${Date.now()}`;
    const code = String(input.code || `HS${Date.now().toString().slice(-7)}`).trim();
    const payload = buildStudentInputPayload(input);
    const [student] = await db.insert(schema.studentDirectory).values({
      id,
      code,
      name,
      className: input.className || null,
      enrollmentStatus: input.enrollmentStatus || 'active',
      parentName: input.parentName || null,
      parentPhone: input.parentPhone || null,
      parentEmail: input.parentEmail || null,
      payload,
    }).returning();
    await writeAuditLog(actor?.id || null, 'create_student', 'student', id, { after: student, module: 'students' });
    studentsChanged();
    return { success: true, data: student };
  } catch (e: any) {
    console.error('Create student failed:', e);
    return { success: false, error: e.message };
  }
}

export async function updateStudent(id: string, input: any) {
  try {
    const actor = await getCurrentActor();
    if (!canManageStudents(actor)) return { success: false, error: 'Unauthorized' };
    const [before] = await db.select().from(schema.studentDirectory).where(eq(schema.studentDirectory.id, id)).limit(1);
    if (!before) return { success: false, error: 'Không tìm thấy học sinh.' };
    const payload = { ...((before.payload as any) || {}), ...buildStudentInputPayload(input) };
    const [student] = await db.update(schema.studentDirectory).set({
      code: input.code ?? before.code,
      name: input.name ?? before.name,
      className: input.className ?? before.className,
      enrollmentStatus: input.enrollmentStatus ?? before.enrollmentStatus,
      parentName: input.parentName ?? before.parentName,
      parentPhone: input.parentPhone ?? before.parentPhone,
      parentEmail: input.parentEmail ?? before.parentEmail,
      payload,
      updatedAt: new Date(),
    }).where(eq(schema.studentDirectory.id, id)).returning();
    await writeAuditLog(actor?.id || null, 'update_student', 'student', id, { before, after: student, module: 'students' });
    studentsChanged();
    return { success: true, data: student };
  } catch (e: any) {
    console.error('Update student failed:', e);
    return { success: false, error: e.message };
  }
}

export async function deleteStudent(id: string) {
  try {
    const actor = await getCurrentActor();
    if (!canManageStudents(actor)) return { success: false, error: 'Unauthorized' };
    const [deleted] = await db.delete(schema.studentDirectory).where(eq(schema.studentDirectory.id, id)).returning();
    if (deleted) {
      await db.delete(schema.sisGrades).where(eq(schema.sisGrades.studentId, id));
      await db.delete(schema.tuitionFees).where(eq(schema.tuitionFees.studentId, id));
    }
    await writeAuditLog(actor?.id || null, 'delete_student', 'student', id, { before: deleted, module: 'students' });
    studentsChanged();
    return { success: true };
  } catch (e: any) {
    console.error('Delete student failed:', e);
    return { success: false, error: e.message };
  }
}

export async function addStudentTimeline(id: string, input: { type: 'notification' | 'message' | 'note'; text: string }) {
  try {
    const actor = await getCurrentActor();
    if (!canManageStudents(actor)) return { success: false, error: 'Unauthorized' };
    const text = input.text.trim();
    if (!text) return { success: false, error: 'Nội dung bắt buộc.' };
    const [student] = await db.select().from(schema.studentDirectory).where(eq(schema.studentDirectory.id, id)).limit(1);
    if (!student) return { success: false, error: 'Không tìm thấy học sinh.' };
    const payload = (student.payload || {}) as Record<string, any>;
    const item = {
      date: new Date().toISOString(),
      title: input.type === 'notification' ? 'Đã gửi thông báo' : input.type === 'message' ? 'Tin nhắn trao đổi' : 'Ghi chú trao đổi',
      desc: text,
      user: actor?.name || 'Hệ thống',
      type: input.type,
    };
    const nextPayload = { ...payload, timeline: [item, ...(payload.timeline || [])] };
    const [updated] = await db.update(schema.studentDirectory).set({ payload: nextPayload, updatedAt: new Date() }).where(eq(schema.studentDirectory.id, id)).returning();
    await writeAuditLog(actor?.id || null, 'add_student_timeline', 'student', id, { after: item, module: 'students' });
    studentsChanged();
    return { success: true, data: updated, timeline: item };
  } catch (e: any) {
    console.error('Add student timeline failed:', e);
    return { success: false, error: e.message };
  }
}
