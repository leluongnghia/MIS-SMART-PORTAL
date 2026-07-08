"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    let data = await db.select().from(schema.events).where(isNull(schema.events.deletedAt));
    if (data.length === 0) {
      const defaultEvents = [
        {
          id: 'event_1',
          title: 'Hội nghị sơ kết học kỳ và Đánh giá chất lượng chuyên môn',
          date: new Date('2026-06-22T08:30:00Z'),
          department: 'Ban Giám hiệu',
          payload: { desc: 'Họp toàn bộ cán bộ tổ trưởng chuyên môn rà soát kết quả dạy học học kỳ vừa qua.', location: 'Phòng họp tầng 3' }
        },
        {
          id: 'event_2',
          title: 'Ngày hội Trải nghiệm Khoa học & Công nghệ STEM 2026',
          date: new Date('2026-06-25T07:30:00Z'),
          department: 'Tổ Toán - Tin học',
          payload: { desc: 'Trưng bày các gian hàng mô hình kỹ thuật, robot tự chế và thí nghiệm hóa lý lý thú.', location: 'Sân trường cơ sở 1' }
        },
        {
          id: 'event_3',
          title: 'Tập huấn nâng cao năng lực ứng dụng AI trong giảng dạy',
          date: new Date('2026-06-28T14:00:00Z'),
          department: 'Tổ Văn phòng - CNTT',
          payload: { desc: 'Hướng dẫn sử dụng các công cụ AI hỗ trợ soạn giáo án và lập kế hoạch bài dạy thông minh.', location: 'Phòng máy số 2' }
        }
      ];
      for (const ev of defaultEvents) {
        await db.insert(schema.events).values(ev);
      }
      data = await db.select().from(schema.events).where(isNull(schema.events.deletedAt));
    }
    
    // Fetch campaigns
    const campaigns = await db.select().from(schema.communicationCampaigns).where(isNull(schema.communicationCampaigns.deletedAt));
    
    return { data, campaigns };
  } catch (e) {
    console.error("Events getInitialData failed:", e);
    return { data: [], campaigns: [] };
  }
}

export async function createEvent(formData: any) {
  try {
    const id = 'event_' + Math.random().toString(36).substring(2, 11);
    
    // Build payload object
    const payload = {
      desc: formData.description,
      objective: formData.objective,
      isOnline: formData.isOnline,
      onlineLink: formData.onlineLink,
      participants: formData.participants,
      gradeIds: formData.gradeIds,
      classIds: formData.classIds,
      expectedAttendees: formData.expectedAttendees,
      guestNote: formData.guestNote,
      coDepartments: formData.coDepartments,
      eventTeam: formData.eventTeam,
      approverId: formData.approverId,
      content: formData.content,
      checklist: formData.checklist,
      needCommunicationPlan: formData.needCommunicationPlan,
      needParentNotice: formData.needParentNotice,
      communicationChannels: formData.communicationChannels,
      plannedAnnouncementAt: formData.plannedAnnouncementAt,
      riskLevel: formData.riskLevel,
      safetyPlan: formData.safetyPlan,
      medicalSupportNeeded: formData.medicalSupportNeeded,
      securitySupportNeeded: formData.securitySupportNeeded,
      emergencyContact: formData.emergencyContact,
      createRiskRecord: formData.createRiskRecord,
      postEventReport: null
    };

    await db.insert(schema.events).values({
      id,
      title: formData.eventName,
      type: formData.eventType,
      status: formData.status || 'draft',
      date: new Date(formData.startAt || Date.now()), // date is required by schema, fallback
      startAt: formData.startAt ? new Date(formData.startAt) : null,
      endAt: formData.endAt ? new Date(formData.endAt) : null,
      location: formData.location,
      department: formData.ownerDepartment,
      managerId: formData.ownerId,
      budget: formData.budget || 0,
      payload
    });
    
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Create event failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateEventStatus(eventId: string, newStatus: string) {
  try {
    await db.update(schema.events)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.events.id, eventId));
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Update event status failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateEventChecklist(eventId: string, checklist: any[]) {
  try {
    const event = await db.select().from(schema.events).where(eq(schema.events.id, eventId)).limit(1);
    if (!event || event.length === 0) throw new Error("Event not found");
    const existingPayload = event[0].payload as any;
    
    await db.update(schema.events)
      .set({ 
        payload: { ...existingPayload, checklist }, 
        updatedAt: new Date() 
      })
      .where(eq(schema.events.id, eventId));
      
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Update event checklist failed:", e);
    return { success: false, error: e.message };
  }
}

export async function submitPostEventReport(eventId: string, reportData: any) {
  try {
    const event = await db.select().from(schema.events).where(eq(schema.events.id, eventId)).limit(1);
    if (!event || event.length === 0) throw new Error("Event not found");
    const existingPayload = event[0].payload as any;
    
    await db.update(schema.events)
      .set({ 
        payload: { ...existingPayload, postEventReport: reportData }, 
        updatedAt: new Date() 
      })
      .where(eq(schema.events.id, eventId));
      
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Submit report failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.update(schema.events).set({ deletedAt: new Date(), deletedBy: 'system', updatedAt: new Date() }).where(eq(schema.events.id, id));
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Delete event failed:", e);
    return { success: false, error: e.message };
  }
}

