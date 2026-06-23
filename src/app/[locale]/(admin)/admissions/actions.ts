'use server';

import { db, schema } from '@/src/libs/server/db';
import { and, eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { type LeadStatus } from '../leads/actions';

export async function getAdmissionsData() {
  const allLeads = await db.select().from(schema.leads);
  const allUsers = await db.select().from(schema.users);
  
  // Fetch activities to display the last activity date for each lead
  const allActivities = await db
    .select()
    .from(schema.leadActivities)
    .orderBy(desc(schema.leadActivities.activityAt));

  const allDocuments = await db
    .select()
    .from(schema.documents)
    .orderBy(desc(schema.documents.createdAt));

  return {
    leads: allLeads,
    users: allUsers,
    activities: allActivities,
    documents: allDocuments,
  };
}

export async function getAdmissionDocuments() {
  return await db
    .select()
    .from(schema.documents)
    .orderBy(desc(schema.documents.createdAt));
}

export async function updateAdmissionLeadFields(
  leadId: string,
  data: {
    parentName?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    testDate?: string | null;
    testTime?: string | null;
    mathScore?: number | null;
    englishScore?: number | null;
    scholarshipPercent?: number | null;
    periodDiscountPercent?: number | null;
    status?: LeadStatus;
  }
) {
  const updateData: Partial<typeof schema.leads.$inferInsert> = {
    updatedAt: new Date(),
  };

  if ('parentName' in data) updateData.parentName = data.parentName || null;
  if ('phone' in data && data.phone) updateData.phone = data.phone;
  if ('email' in data) updateData.email = data.email || null;
  if ('address' in data) updateData.address = data.address || null;
  if ('testDate' in data) updateData.testDate = data.testDate ? new Date(data.testDate) : null;
  if ('testTime' in data) updateData.testTime = data.testTime || null;
  if ('mathScore' in data) updateData.mathScore = data.mathScore ?? null;
  if ('englishScore' in data) updateData.englishScore = data.englishScore ?? null;
  if ('scholarshipPercent' in data) updateData.scholarshipPercent = data.scholarshipPercent ?? null;
  if ('periodDiscountPercent' in data) updateData.periodDiscountPercent = data.periodDiscountPercent ?? null;
  if ('status' in data && data.status) updateData.status = data.status;

  await db.update(schema.leads).set(updateData).where(eq(schema.leads.id, leadId));

  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'update',
    title: 'Cập nhật hồ sơ tuyển sinh',
    description: 'Nhân viên tuyển sinh cập nhật nhanh thông tin trong màn hình làm việc tập trung.',
    activityAt: new Date(),
    payload: { fields: Object.keys(data) },
  });

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function updateAdmissionAppointment(
  leadId: string,
  data: {
    testDate?: string | null;
    testTime?: string | null;
    status?: LeadStatus;
    note?: string;
  }
) {
  const updateData: Partial<typeof schema.leads.$inferInsert> = {
    updatedAt: new Date(),
  };

  if ('testDate' in data) updateData.testDate = data.testDate ? new Date(data.testDate) : null;
  if ('testTime' in data) updateData.testTime = data.testTime || null;
  if ('status' in data && data.status) updateData.status = data.status;

  await db.update(schema.leads).set(updateData).where(eq(schema.leads.id, leadId));

  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'appointment',
    title: 'Cập nhật lịch test tuyển sinh',
    description: data.note || 'Lịch test/phỏng vấn tuyển sinh được cập nhật.',
    activityAt: new Date(),
    payload: { testDate: data.testDate, testTime: data.testTime, status: data.status },
  });

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath('/[locale]/leads', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function addAdmissionCareActivity(
  leadId: string,
  data: {
    channel: string;
    description: string;
  }
) {
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: data.channel,
    title: `Chăm sóc qua ${data.channel}`,
    description: data.description,
    activityAt: new Date(),
    payload: { channel: data.channel },
  });

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function updateAdmissionDocumentStatus(
  leadId: string,
  docType: string,
  checked: boolean
) {
  const existing = await db
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.leadId, leadId), eq(schema.documents.type, docType)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.documents)
      .set({
        status: checked ? 'submitted' : 'pending',
        uploadedAt: checked ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, existing[0].id));
  } else {
    await db.insert(schema.documents).values({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      leadId,
      type: docType,
      name: docType,
      status: checked ? 'submitted' : 'pending',
      uploadedAt: checked ? new Date() : null,
      payload: {},
    });
  }

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function updateAdmissionDocumentFile(
  leadId: string,
  docType: string,
  data: {
    fileName: string;
    status?: 'submitted' | 'pending' | 'rejected';
    note?: string;
  }
) {
  const existing = await db
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.leadId, leadId), eq(schema.documents.type, docType)))
    .limit(1);

  const payload = { fileName: data.fileName, note: data.note || '' };
  if (existing[0]) {
    await db
      .update(schema.documents)
      .set({
        name: docType,
        status: data.status || 'submitted',
        fileUrl: data.fileName,
        uploadedAt: new Date(),
        payload,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, existing[0].id));
  } else {
    await db.insert(schema.documents).values({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      leadId,
      type: docType,
      name: docType,
      status: data.status || 'submitted',
      fileUrl: data.fileName,
      uploadedAt: new Date(),
      payload,
    });
  }

  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'document',
    title: 'Cập nhật tài liệu tuyển sinh',
    description: `Đã cập nhật tài liệu: ${docType}`,
    activityAt: new Date(),
    payload,
  });

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function updateLeadStatusKanban(
  leadId: string,
  toStatus: LeadStatus,
  note?: string
) {
  const existing = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, leadId))
    .limit(1);
  const lead = existing[0];

  if (!lead) {
    throw new Error('Lead not found');
  }

  const fromStatus = lead.status;
  if (fromStatus === toStatus) return { success: true };

  await db
    .update(schema.leads)
    .set({
      status: toStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.leads.id, leadId));

  // Log pipeline change
  await db.insert(schema.leadPipeline).values({
    id: `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    fromStatus,
    toStatus,
    changedAt: new Date(),
    note: note || `Status updated via Kanban board from ${fromStatus} to ${toStatus}`,
    payload: {},
  });

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'pipeline',
    title: 'Status Updated',
    description: `Lead status updated via Kanban board to ${toStatus}`,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath('/[locale]/leads', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}
