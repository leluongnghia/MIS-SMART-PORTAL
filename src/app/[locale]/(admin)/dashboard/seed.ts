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
  ]);

  // Seed risks
  await db.insert(schema.risks).values([
    { id: uuidv4(), title: 'Rủi ro về thiếu GV bộ môn Toán', severity: 'high', status: 'open' },
    { id: uuidv4(), title: 'Tiến độ tuyển sinh thấp hơn kế hoạch', severity: 'high', status: 'open' },
    { id: uuidv4(), title: 'Chậm phê duyệt thanh toán', severity: 'medium', status: 'open' }
  ]);

  // Seed events
  await db.insert(schema.events).values([
    { id: uuidv4(), title: 'Nguyễn Văn Nam đã phê duyệt Kế hoạch dạy học HKII', date: new Date('2025-05-16T09:24:00Z'), department: 'Phòng Đào tạo' },
    { id: uuidv4(), title: 'Phê duyệt đề xuất mua sắm 30 bộ máy tính', date: new Date('2025-05-16T08:15:00Z'), department: 'Phòng Tài chính' },
    { id: uuidv4(), title: 'Cập nhật điểm danh học sinh 11A1', date: new Date('2025-05-15T17:30:00Z'), department: 'GVCN - Trần Thị Mai' },
    { id: uuidv4(), title: 'Đăng thông báo: Lịch thi thử THPTQG đợt 2', date: new Date('2025-05-15T16:45:00Z'), department: 'Phòng Đào tạo' },
    { id: uuidv4(), title: 'Hệ thống tự động sao lưu dữ liệu thành công', date: new Date('2025-05-15T14:12:00Z'), department: 'Hệ thống' }
  ]);
  
  // Create a user for employee profiles
  const userId = uuidv4();
  await db.insert(schema.users).values([
    { id: userId, email: 'test@example.com', name: 'Test User', role: 'admin', payload: {} }
  ]);

  // Seed Leave Requests (for approvals)
  const employeeId = uuidv4();
  await db.insert(schema.employeeProfiles).values([
    { id: employeeId, userId: userId, employeeCode: 'EMP001', payload: {} }
  ]);
  
  await db.insert(schema.leaveRequests).values([
    { id: uuidv4(), employeeProfileId: employeeId, type: 'annual', startDate: new Date(), endDate: new Date(), reason: 'Nghỉ ốm', status: 'pending', payload: {} },
    { id: uuidv4(), employeeProfileId: employeeId, type: 'unpaid', startDate: new Date(), endDate: new Date(), reason: 'Việc gia đình', status: 'pending', payload: {} }
  ]);

  console.log("Seeding complete!");
}
