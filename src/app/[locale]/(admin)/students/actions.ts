"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";

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
      db.select().from(schema.studentDirectory),
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
      },
    };
  } catch (e) {
    console.error("Failed to fetch students data:", e);
    return { students: [], grades: [], tuitionFees: [] };
  }
}
