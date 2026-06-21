"use server";

import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor, writeAuditLog } from "@/src/libs/server/auth-helper";
import { approveApprovalRequest, cancelApprovalRequest, getApprovalHistory, getApprovalRequests, rejectApprovalRequest, requestApprovalRevision } from "@/src/libs/server/approval-engine";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  const actor = await getCurrentActor();
  if (!actor) return { data: [], approvalRequests: [], actor: null };

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
    let leaveRows = await db.select().from(schema.leaveRequests);
    if (leaveRows.length === 0) {
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
      leaveRows = await db.select().from(schema.leaveRequests);
    }

    // Filter leave requests based on data scope permissions
    const userRows = await db.select().from(schema.users);
    const profileRows = await db.select().from(schema.employeeProfiles);

    const profileMap = new Map(profileRows.map(p => [p.id, p]));
    const userMap = new Map(userRows.map(u => [u.id, u]));

    const leaveWithUser = leaveRows.map(l => {
      const profile = profileMap.get(l.employeeProfileId);
      const user = profile ? userMap.get(profile.userId) : null;
      return {
        ...l,
        user,
      };
    });

    const filtered = leaveWithUser.filter(item => {
      if (actor.role === 'ADMIN' || actor.workspaceId === 'BGH') return true;
      if (actor.role === 'MANAGER') {
        return item.user?.workspaceId === actor.workspaceId || item.user?.departmentId === actor.departmentId;
      }
      return item.user?.id === actor.id;
    });

    const approvalRequests = await getApprovalRequests({ pageSize: 100 });

    return { data: filtered, approvalRequests: approvalRequests.items, actor };
  } catch (e) {
    console.error("Approvals getInitialData failed:", e);
    return { data: [], approvalRequests: [], actor };
  }
}

export async function approveLeaveRequest(id: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [request] = await db.select().from(schema.leaveRequests).where(eq(schema.leaveRequests.id, id)).limit(1);
    if (!request) return { success: false, error: "Yêu cầu không tồn tại" };

    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') {
      await writeAuditLog(actor.id, "APPROVE_LEAVE_DENIED", "LEAVE_REQUEST", id, { success: false, reason: "Insufficient permissions" });
      return { success: false, error: "Bạn không có quyền phê duyệt yêu cầu này." };
    }

    await db.update(schema.leaveRequests).set({
      status: 'approved',
      approvedById: actor.id,
      updatedAt: new Date(),
    }).where(eq(schema.leaveRequests.id, id));

    await writeAuditLog(actor.id, "APPROVE_LEAVE", "LEAVE_REQUEST", id, { before: { status: request.status }, after: { status: 'approved' } });
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function rejectLeaveRequest(id: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [request] = await db.select().from(schema.leaveRequests).where(eq(schema.leaveRequests.id, id)).limit(1);
    if (!request) return { success: false, error: "Yêu cầu không tồn tại" };

    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') {
      await writeAuditLog(actor.id, "REJECT_LEAVE_DENIED", "LEAVE_REQUEST", id, { success: false, reason: "Insufficient permissions" });
      return { success: false, error: "Bạn không có quyền từ chối yêu cầu này." };
    }

    await db.update(schema.leaveRequests).set({
      status: 'rejected',
      approvedById: actor.id,
      updatedAt: new Date(),
    }).where(eq(schema.leaveRequests.id, id));

    await writeAuditLog(actor.id, "REJECT_LEAVE", "LEAVE_REQUEST", id, { before: { status: request.status }, after: { status: 'rejected' } });
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}


export async function approveEngineRequest(id: string, comment?: string) {
  try {
    const item = await approveApprovalRequest(id, comment);
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true, item };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function rejectEngineRequest(id: string, comment?: string) {
  try {
    const item = await rejectApprovalRequest(id, comment);
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true, item };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function requestEngineRevision(id: string, comment?: string) {
  try {
    const item = await requestApprovalRevision(id, comment);
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true, item };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function cancelEngineRequest(id: string, comment?: string) {
  try {
    const item = await cancelApprovalRequest(id, comment);
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true, item };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getEngineRequestHistory(id: string) {
  try {
    const history = await getApprovalHistory(id);
    return { success: true, history };
  } catch (e: any) {
    return { success: false, error: e.message, history: [] };
  }
}
