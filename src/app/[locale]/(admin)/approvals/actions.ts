"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    // 1. Ensure employeeProfiles exists for our seed users
    const profiles = await db.select().from(schema.employeeProfiles);
    if (profiles.length === 0) {
      const defaultProfiles = [
        {
          id: 'ep_nhung',
          userId: 'user_nhung',
          employeeCode: 'NS-0021',
          phoneNumber: '0912 345 678',
          gender: 'Nữ',
          address: 'Hai Bà Trưng, Hà Nội',
          status: 'active',
          payload: {}
        },
        {
          id: 'ep_phong',
          userId: 'user_phong',
          employeeCode: 'NS-0034',
          phoneNumber: '0988 777 666',
          gender: 'Nam',
          address: 'Hoàng Mai, Hà Nội',
          status: 'active',
          payload: {}
        }
      ];
      for (const ep of defaultProfiles) {
        await db.insert(schema.employeeProfiles).values(ep);
      }
    }

    // 2. Ensure leaveRequests exists
    let data = await db.select().from(schema.leaveRequests);
    if (data.length === 0) {
      const defaultLeaveRequests = [
        {
          id: 'leave_1',
          employeeProfileId: 'ep_nhung',
          type: 'Nghỉ phép năm',
          startDate: new Date('2026-06-20T08:00:00Z'),
          endDate: new Date('2026-06-21T17:00:00Z'),
          reason: 'Giải quyết việc gia đình riêng ở quê.',
          status: 'pending',
          substituteTeacherId: 'user_hoa',
          payload: { employeeName: 'Cô Phạm Hồng Nhung', department: 'Tổ Ngữ văn' }
        },
        {
          id: 'leave_2',
          employeeProfileId: 'ep_phong',
          type: 'Nghỉ ốm',
          startDate: new Date('2026-06-18T08:00:00Z'),
          endDate: new Date('2026-06-18T17:00:00Z'),
          reason: 'Đi khám bệnh định kỳ tại bệnh viện Bạch Mai.',
          status: 'pending',
          substituteTeacherId: 'user_minh',
          payload: { employeeName: 'Thầy Bùi Hải Phong', department: 'Tổ Toán - Tin học' }
        }
      ];
      for (const leave of defaultLeaveRequests) {
        await db.insert(schema.leaveRequests).values(leave);
      }
      data = await db.select().from(schema.leaveRequests);
    }
    return { data };
  } catch (e) {
    console.error("Approvals getInitialData failed:", e);
    return { data: [] };
  }
}

export async function approveLeaveRequest(id: string, userId: string) {
  try {
    await db.update(schema.leaveRequests).set({
      status: 'approved',
      approvedById: userId,
      updatedAt: new Date(),
    }).where(eq(schema.leaveRequests.id, id));
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function rejectLeaveRequest(id: string, userId: string) {
  try {
    await db.update(schema.leaveRequests).set({
      status: 'rejected',
      approvedById: userId,
      updatedAt: new Date(),
    }).where(eq(schema.leaveRequests.id, id));
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

