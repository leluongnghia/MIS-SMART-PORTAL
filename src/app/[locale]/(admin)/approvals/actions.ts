"use server";

import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor, writeAuditLog } from "@/src/libs/server/auth-helper";
import { approveApprovalRequest, cancelApprovalRequest, getApprovalHistory, getApprovalRequests, rejectApprovalRequest, requestApprovalRevision } from "@/src/libs/server/approval-engine";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  const actor = await getCurrentActor();
  if (!actor) return { approvalRequests: [], actor: null };

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

    // 2. Ensure approvalRequests exists with 7 types
    const currentRequests = await db.select().from(schema.approvalRequests).limit(1);
    if (currentRequests.length === 0) {
      const defaultApprovalRequests = [
        {
          id: 'req_leave_1',
          module: 'APPROVALS',
          entityType: 'LEAVE_REQUEST',
          entityId: 'leave_001',
          title: 'Đơn xin nghỉ phép năm',
          description: 'Nghỉ giải quyết việc gia đình riêng ở quê',
          status: 'PENDING',
          requesterId: 'user_nhung',
          requesterName: 'Cô Phạm Hồng Nhung',
          approverRole: 'MANAGER',
          approverDepartmentId: 'dept_ngu_van',
          payload: { startDate: '2026-06-20T08:00:00Z', endDate: '2026-06-21T17:00:00Z', reason: 'Việc gia đình', substituteTeacher: 'Cô Hoa' }
        },
        {
          id: 'req_resign_1',
          module: 'APPROVALS',
          entityType: 'RESIGNATION',
          entityId: 'resign_001',
          title: 'Đơn xin nghỉ việc',
          description: 'Chuyển công tác',
          status: 'PENDING',
          requesterId: 'user_phong',
          requesterName: 'Thầy Bùi Hải Phong',
          approverRole: 'ADMIN',
          approverWorkspaceId: 'BGH',
          payload: { lastWorkingDate: '2026-07-15', reason: 'Chuyển công tác theo nguyện vọng cá nhân', handoverTo: 'Thầy Minh' }
        },
        {
          id: 'req_train_1',
          module: 'APPROVALS',
          entityType: 'TRAINING',
          entityId: 'train_001',
          title: 'Đề xuất tham gia khóa học',
          description: 'Khóa học Montessori nâng cao',
          status: 'APPROVED',
          requesterId: 'user_nhung',
          requesterName: 'Cô Phạm Hồng Nhung',
          approverRole: 'MANAGER',
          payload: { courseName: 'Montessori nâng cao', provider: 'Viện đào tạo', cost: '5,000,000 VNĐ' }
        },
        {
          id: 'req_purch_1',
          module: 'APPROVALS',
          entityType: 'PURCHASE',
          entityId: 'purch_001',
          title: 'Đề xuất mua sắm thiết bị',
          description: 'Mua sắm máy chiếu phòng Toán',
          status: 'NEEDS_REVISION',
          requesterId: 'user_phong',
          requesterName: 'Thầy Bùi Hải Phong',
          approverRole: 'ADMIN',
          payload: { items: ['Máy chiếu Sony X1', 'Màn chiếu 120 inch'], estimatedCost: '25,000,000 VNĐ', priority: 'Cao' }
        },
        {
          id: 'req_maint_1',
          module: 'APPROVALS',
          entityType: 'MAINTENANCE',
          entityId: 'maint_001',
          title: 'Báo hỏng và xin sửa chữa',
          description: 'Điều hòa phòng 302 không mát',
          status: 'PENDING',
          requesterId: 'user_nhung',
          requesterName: 'Cô Phạm Hồng Nhung',
          approverWorkspaceId: 'BGH',
          payload: { location: 'Phòng 302', issue: 'Không mát, có tiếng ồn', urgency: 'Trung bình' }
        },
        {
          id: 'req_asset_1',
          module: 'APPROVALS',
          entityType: 'ASSET_TRANSFER',
          entityId: 'asset_001',
          title: 'Đề xuất điều chuyển tài sản',
          description: 'Điều chuyển đàn Piano từ phòng Âm nhạc lên Hội trường',
          status: 'DRAFT',
          requesterId: 'user_phong',
          requesterName: 'Thầy Bùi Hải Phong',
          payload: { assetName: 'Đàn Piano Yamaha', from: 'Phòng Âm nhạc', to: 'Hội trường lớn', date: '2026-06-25' }
        },
        {
          id: 'req_capa_1',
          module: 'APPROVALS',
          entityType: 'CAPA',
          entityId: 'capa_001',
          title: 'Hành động khắc phục',
          description: 'Khắc phục quy trình điểm danh học sinh',
          status: 'PENDING',
          requesterId: 'user_nhung',
          requesterName: 'Cô Phạm Hồng Nhung',
          approverRole: 'ADMIN',
          payload: { issue: 'Điểm danh muộn do hệ thống lỗi', correctiveAction: 'Sử dụng hệ thống backup', deadline: '2026-06-30' }
        }
      ];
      for (const req of defaultApprovalRequests) {
        await db.insert(schema.approvalRequests).values({
          ...req,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    const approvalRequests = await getApprovalRequests({ pageSize: 100 });

    return { approvalRequests: approvalRequests.items, actor };
  } catch (e) {
    console.error("Approvals getInitialData failed:", e);
    return { approvalRequests: [], actor };
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

export async function createNewRequest(input: any) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const newId = `req_${Date.now()}`;
    await db.insert(schema.approvalRequests).values({
      id: newId,
      module: 'APPROVALS',
      entityType: input.entityType,
      entityId: `${input.entityType.toLowerCase()}_${Date.now()}`,
      title: input.title,
      description: input.description,
      status: 'PENDING',
      requesterId: actor.id,
      requesterName: actor.name,
      approverRole: input.approverRole || 'ADMIN',
      payload: input.payload || {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    revalidatePath('/[locale]/approvals', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
