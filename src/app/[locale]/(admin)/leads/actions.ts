'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, like, or, and, desc, asc, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type LeadStatus = 'new' | 'contacted' | 'consultation_scheduled' | 'application_submitted' | 'seat_reserved' | 'payment_confirmed' | 'enrolled' | 'lost';

export interface GetLeadsParams {
  search?: string;
  status?: string;
  source?: string;
  grade?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getLeads(params: GetLeadsParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.search) {
    const searchPattern = `%${params.search}%`;
    conditions.push(
      or(
        like(schema.leads.fullName, searchPattern),
        like(schema.leads.phone, searchPattern),
        like(schema.leads.email, searchPattern),
        like(schema.leads.leadCode, searchPattern)
      )
    );
  }

  if (params.status && params.status !== 'all') {
    conditions.push(eq(schema.leads.status, params.status as any));
  }

  if (params.source && params.source !== 'all') {
    conditions.push(eq(schema.leads.source, params.source));
  }

  if (params.grade && params.grade !== 'all') {
    conditions.push(eq(schema.leads.grade, params.grade));
  }

  const queryCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Count total
  const totalCountResult = await db
    .select({ value: count() })
    .from(schema.leads)
    .where(queryCondition);
  const totalItems = totalCountResult[0]?.value || 0;

  // Query database
  let selectQuery = db.select().from(schema.leads).where(queryCondition);

  // Sorting
  const sortCol = params.sortBy ? (schema.leads as any)[params.sortBy] : schema.leads.createdAt;
  const orderFn = params.sortOrder === 'asc' ? asc : desc;
  selectQuery = selectQuery.orderBy(orderFn(sortCol)).limit(limit).offset(offset) as any;

  const data = await selectQuery;

  return {
    data,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  };
}

export async function getUsers() {
  return await db.select().from(schema.users);
}

export async function createLead(data: {
  fullName: string;
  parentName?: string;
  phone: string;
  email?: string;
  source: string;
  grade: string;
  status: LeadStatus;
  assignedUserId?: string | null;
  notes?: string;
}) {
  const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const leadCode = `LD-${Date.now().toString(36).toUpperCase()}`;

  const newLead = {
    id,
    leadCode,
    fullName: data.fullName,
    parentName: data.parentName || null,
    phone: data.phone,
    email: data.email || null,
    source: data.source,
    grade: data.grade,
    status: data.status,
    assignedUserId: data.assignedUserId || null,
    notes: data.notes || null,
    payload: {},
  };

  await db.insert(schema.leads).values(newLead);
  
  // Log pipeline change
  await db.insert(schema.leadPipeline).values({
    id: `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId: id,
    fromStatus: null,
    toStatus: data.status,
    changedAt: new Date(),
    note: 'Lead created',
    payload: {},
  });

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId: id,
    type: 'create',
    title: 'Lead Created',
    description: `Lead created with status: ${data.status}`,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath('/[locale]/leads', 'page');
  return { success: true, leadId: id };
}

export async function updateLead(
  id: string,
  data: {
    fullName: string;
    parentName?: string;
    phone: string;
    email?: string;
    source: string;
    grade: string;
    status: LeadStatus;
    assignedUserId?: string | null;
    notes?: string;
  }
) {
  // Get existing lead to check status changes
  const existingLeads = await db.select().from(schema.leads).where(eq(schema.leads.id, id)).limit(1);
  const existing = existingLeads[0];

  if (!existing) {
    throw new Error('Lead not found');
  }

  await db
    .update(schema.leads)
    .set({
      fullName: data.fullName,
      parentName: data.parentName || null,
      phone: data.phone,
      email: data.email || null,
      source: data.source,
      grade: data.grade,
      status: data.status,
      assignedUserId: data.assignedUserId || null,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.leads.id, id));

  // If status changes, log it
  if (existing.status !== data.status) {
    await db.insert(schema.leadPipeline).values({
      id: `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      leadId: id,
      fromStatus: existing.status,
      toStatus: data.status,
      changedAt: new Date(),
      note: `Status updated from ${existing.status} to ${data.status}`,
      payload: {},
    });

    await db.insert(schema.leadActivities).values({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      leadId: id,
      type: 'pipeline',
      title: 'Status Updated',
      description: `Lead status updated to ${data.status}`,
      activityAt: new Date(),
      payload: {},
    });
  }

  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}

export async function deleteLead(id: string) {
  await db.delete(schema.leads).where(eq(schema.leads.id, id));
  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}
