'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function seedDashboardData() {
  const taskCount = await db.select({ count: sql<number>`count(*)` }).from(schema.tasks);
  if (taskCount[0].count > 0) return; // already seeded

  console.log("Seeding dashboard data...");

  // Seed tasks
  await db.insert(schema.tasks).values([
    {
      id: uuidv4(),
      title: 'Báo cáo tài chính Quý II/2025',
      workspaceId: 'w1',
      assignedId: 'u1',
      status: 'pending',
      priority: 'high',
      deadline: '2025-05-20',
      payload: { department: 'Phòng Tài chính' }
    },
    {
      id: uuidv4(),
      title: 'Rà soát hồ sơ học sinh lớp 10',
      workspaceId: 'w2',
      assignedId: 'u2',
      status: 'pending',
      priority: 'high',
      deadline: '2025-05-19',
      payload: { department: 'Phòng Tuyển sinh' }
    },
    {
      id: uuidv4(),
      title: 'Kế hoạch ngoại khóa Khối 11',
      workspaceId: 'w3',
      assignedId: 'u3',
      status: 'overdue',
      priority: 'medium',
      deadline: '2025-05-14',
      payload: { department: 'Đoàn trường', overdueDays: 1 }
    },
    {
      id: uuidv4(),
      title: 'Điều chỉnh phân công giảng dạy HKII',
      workspaceId: 'w4',
      assignedId: 'u4',
      status: 'overdue',
      priority: 'high',
      deadline: '2025-05-15',
      payload: { department: 'Phòng Đào tạo', overdueDays: 0 }
    }
  ]).onConflictDoNothing();

  // Seed risks
  await db.insert(schema.risks).values([
    { id: uuidv4(), title: 'Rủi ro về thiếu GV bộ môn Toán', severity: 'high', status: 'open' },
    { id: uuidv4(), title: 'Tiến độ tuyển sinh thấp hơn kế hoạch', severity: 'high', status: 'open' },
    { id: uuidv4(), title: 'Chậm phê duyệt thanh toán', severity: 'medium', status: 'open' }
  ]).onConflictDoNothing();

  // Seed events
  await db.insert(schema.events).values([
    { id: uuidv4(), title: 'Nguyễn Văn Nam đã phê duyệt Kế hoạch dạy học HKII', date: new Date('2025-05-16T09:24:00Z'), department: 'Phòng Đào tạo' },
    { id: uuidv4(), title: 'Phê duyệt đề xuất mua sắm 30 bộ máy tính', date: new Date('2025-05-16T08:15:00Z'), department: 'Phòng Tài chính' },
    { id: uuidv4(), title: 'Cập nhật điểm danh học sinh 11A1', date: new Date('2025-05-15T17:30:00Z'), department: 'GVCN - Trần Thị Mai' },
    { id: uuidv4(), title: 'Đăng thông báo: Lịch thi thử THPTQG đợt 2', date: new Date('2025-05-15T16:45:00Z'), department: 'Phòng Đào tạo' },
    { id: uuidv4(), title: 'Hệ thống tự động sao lưu dữ liệu thành công', date: new Date('2025-05-15T14:12:00Z'), department: 'Hệ thống' }
  ]).onConflictDoNothing();
  
  // Create a user for employee profiles
  const userId = uuidv4();
  await db.insert(schema.users).values([
    { id: userId, email: 'test@example.com', name: 'Test User', role: 'admin', payload: {} }
  ]).onConflictDoNothing();

  // Seed Leave Requests (for approvals)
  const employeeId = uuidv4();
  await db.insert(schema.employeeProfiles).values([
    { id: employeeId, userId: userId, employeeCode: 'EMP001', payload: {} }
  ]).onConflictDoNothing();
  
  await db.insert(schema.leaveRequests).values([
    { id: uuidv4(), employeeProfileId: employeeId, type: 'annual', startDate: new Date(), endDate: new Date(), reason: 'Nghỉ ốm', status: 'pending', payload: {} },
    { id: uuidv4(), employeeProfileId: employeeId, type: 'unpaid', startDate: new Date(), endDate: new Date(), reason: 'Việc gia đình', status: 'pending', payload: {} }
  ]).onConflictDoNothing();

  const allLeads = await db.select().from(schema.leads);
  if (allLeads.length === 0) {
    console.log("Seeding leads and payments for reports...");
    const l1 = uuidv4();
    const l2 = uuidv4();
    const l3 = uuidv4();
    const l4 = uuidv4();

    await db.insert(schema.leads).values([
      { id: l1, fullName: "Học sinh A", status: "enrolled", source: "Facebook", grade: "Khối 10", phone: "0900000001", leadCode: "LD-SEED-001" },
      { id: l2, fullName: "Học sinh B", status: "enrolled", source: "Google", grade: "Khối 10", phone: "0900000002", leadCode: "LD-SEED-002" },
      { id: l3, fullName: "Học sinh C", status: "seat_reserved", source: "Facebook", grade: "Khối 11", phone: "0900000003", leadCode: "LD-SEED-003" },
      { id: l4, fullName: "Học sinh D", status: "docs_submitted", source: "Website", grade: "Khối 10", phone: "0900000004", leadCode: "LD-SEED-004" },
    ]).onConflictDoNothing();

    await db.insert(schema.payments).values([
      { id: uuidv4(), leadId: l1, type: "tuition", amount: 15000000, status: "paid", transferContent: "TS-SEED-001" },
      { id: uuidv4(), leadId: l2, type: "tuition", amount: 15000000, status: "paid", transferContent: "TS-SEED-002" },
      { id: uuidv4(), leadId: l3, type: "seat_reservation", amount: 5000000, status: "paid", transferContent: "TS-SEED-003" },
    ]).onConflictDoNothing();
  }

  console.log("Seeding complete!");
}
