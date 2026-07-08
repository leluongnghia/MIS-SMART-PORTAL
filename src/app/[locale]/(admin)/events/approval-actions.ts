"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitForApproval(entityId: string, entityType: string, approverId: string, title: string) {
  try {
    const requestId = 'req_' + Math.random().toString(36).substring(2, 11);
    
    await db.insert(schema.approvalRequests).values({
      id: requestId,
      module: 'EVENTS',
      entityType, // 'EVENT' | 'CAMPAIGN'
      entityId,
      title: `Yêu cầu duyệt: ${title}`,
      status: 'PENDING',
      requesterId: 'SystemUser', // Mocked
      requesterName: 'Người tạo hệ thống', // Mocked
      approverId,
      currentStep: 1
    });

    await db.insert(schema.approvalEvents).values({
      id: 'evt_' + Math.random().toString(36).substring(2, 11),
      approvalRequestId: requestId,
      action: 'SUBMIT',
      toStatus: 'PENDING',
      actorId: 'SystemUser',
      actorName: 'Người tạo hệ thống',
      comment: 'Đã gửi yêu cầu phê duyệt'
    });

    // Update entity status
    if (entityType === 'EVENT') {
      await db.update(schema.events).set({ status: 'pending_approval' }).where(eq(schema.events.id, entityId));
    } else if (entityType === 'CAMPAIGN') {
      await db.update(schema.communicationCampaigns).set({ status: 'pending' }).where(eq(schema.communicationCampaigns.id, entityId));
    }

    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("submitForApproval failed:", e);
    return { success: false, error: e.message };
  }
}

export async function processApproval(requestId: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION', comment: string, nextApproverId?: string) {
  try {
    const reqData = await db.select().from(schema.approvalRequests).where(eq(schema.approvalRequests.id, requestId)).limit(1);
    if (!reqData || reqData.length === 0) throw new Error("Request not found");
    const request = reqData[0];

    let newReqStatus = request.status;
    let newEntityStatus = '';

    if (action === 'APPROVE') {
      if (nextApproverId) {
        newReqStatus = 'PENDING';
        await db.update(schema.approvalRequests).set({ 
          currentStep: request.currentStep + 1,
          approverId: nextApproverId
        }).where(eq(schema.approvalRequests.id, requestId));
      } else {
        newReqStatus = 'APPROVED';
        newEntityStatus = 'approved';
        await db.update(schema.approvalRequests).set({ status: 'APPROVED', resolvedAt: new Date() }).where(eq(schema.approvalRequests.id, requestId));
      }
    } else if (action === 'REJECT') {
      newReqStatus = 'REJECTED';
      newEntityStatus = 'cancelled';
      await db.update(schema.approvalRequests).set({ status: 'REJECTED', resolvedAt: new Date() }).where(eq(schema.approvalRequests.id, requestId));
    } else if (action === 'REQUEST_REVISION') {
      newReqStatus = 'REVISION_REQUESTED';
      newEntityStatus = 'draft';
      await db.update(schema.approvalRequests).set({ status: 'REVISION_REQUESTED', resolvedAt: new Date() }).where(eq(schema.approvalRequests.id, requestId));
    }

    await db.insert(schema.approvalEvents).values({
      id: 'evt_' + Math.random().toString(36).substring(2, 11),
      approvalRequestId: requestId,
      action,
      fromStatus: request.status,
      toStatus: newReqStatus,
      actorId: 'Approver',
      actorName: 'Người duyệt', // Mocked
      comment
    });

    if (newEntityStatus) {
      if (request.entityType === 'EVENT') {
        await db.update(schema.events).set({ status: newEntityStatus }).where(eq(schema.events.id, request.entityId));
      } else if (request.entityType === 'CAMPAIGN') {
        await db.update(schema.communicationCampaigns).set({ status: newEntityStatus }).where(eq(schema.communicationCampaigns.id, request.entityId));
      }
    }

    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("processApproval failed:", e);
    return { success: false, error: e.message };
  }
}

export async function getApprovalHistory(entityId: string) {
  try {
    const requests = await db.select().from(schema.approvalRequests).where(eq(schema.approvalRequests.entityId, entityId)).orderBy(desc(schema.approvalRequests.submittedAt));
    if (!requests || requests.length === 0) return { data: [] };

    // Get events for all requests related to this entity
    const reqIds = requests.map(r => r.id);
    let events = [];
    for (const rid of reqIds) {
      const evs = await db.select().from(schema.approvalEvents).where(eq(schema.approvalEvents.approvalRequestId, rid)).orderBy(desc(schema.approvalEvents.createdAt));
      events.push(...evs);
    }
    
    // sort events overall by created date desc
    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { data: events, currentRequest: requests[0] };
  } catch (e: any) {
    console.error("getApprovalHistory failed:", e);
    return { data: [], currentRequest: null };
  }
}
