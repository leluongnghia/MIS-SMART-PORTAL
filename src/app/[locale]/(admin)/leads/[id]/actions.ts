'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { type LeadStatus } from '../actions';

export async function getLeadDetail(id: string) {
  const leadList = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, id))
    .limit(1);
  const lead = leadList[0];

  if (!lead) {
    return null;
  }

  const activities = await db
    .select()
    .from(schema.leadActivities)
    .where(eq(schema.leadActivities.leadId, id))
    .orderBy(desc(schema.leadActivities.activityAt));

  const pipeline = await db
    .select()
    .from(schema.leadPipeline)
    .where(eq(schema.leadPipeline.leadId, id))
    .orderBy(desc(schema.leadPipeline.changedAt));

  const leadPayments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.leadId, id))
    .orderBy(desc(schema.payments.createdAt));

  const leadDocuments = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.leadId, id))
    .orderBy(desc(schema.documents.createdAt));

  return {
    lead,
    activities,
    pipeline,
    payments: leadPayments,
    documents: leadDocuments,
  };
}

export async function updateLeadProfile(
  id: string,
  data: {
    fullName: string;
    parentName?: string;
    phone: string;
    email?: string;
    source: string;
    grade: string;
    notes?: string;
  }
) {
  await db
    .update(schema.leads)
    .set({
      fullName: data.fullName,
      parentName: data.parentName || null,
      phone: data.phone,
      email: data.email || null,
      source: data.source,
      grade: data.grade,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.leads.id, id));

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId: id,
    type: 'update',
    title: 'Lead Profile Updated',
    description: 'Updated profile details',
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath(`/[locale]/leads/${id}`, 'page');
  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}

export async function addConsultationActivity(
  leadId: string,
  data: {
    title: string;
    description?: string;
  }
) {
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'consultation',
    title: data.title,
    description: data.description || null,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function updateLeadPipelineStatus(
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
    note: note || `Status updated from ${fromStatus} to ${toStatus}`,
    payload: {},
  });

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'pipeline',
    title: 'Status Updated',
    description: `Lead status updated to ${toStatus}`,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}
