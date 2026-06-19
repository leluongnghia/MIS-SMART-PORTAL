'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, like, or, and, desc, asc, count, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type LeadStatus = 'received' | 'consulting' | 'test_scheduled' | 'test_participated' | 'seat_reserved' | 'docs_submitted' | 'enrolled' | 'cancelled';

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

  const conditions = [isNull(schema.leads.deletedAt)];

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

export async function getAllLeadsForExport(params?: { search?: string; status?: string; source?: string; grade?: string }) {
  const conditions = [isNull(schema.leads.deletedAt)];
  if (params?.search) {
    const searchPattern = `%${params.search}%`;
    conditions.push(or(
      like(schema.leads.fullName, searchPattern),
      like(schema.leads.phone, searchPattern),
      like(schema.leads.leadCode, searchPattern),
    ));
  }
  if (params?.status && params.status !== 'all') {
    conditions.push(eq(schema.leads.status, params.status as any));
  }
  if (params?.source && params.source !== 'all') {
    conditions.push(eq(schema.leads.source, params.source));
  }
  if (params?.grade && params.grade !== 'all') {
    conditions.push(eq(schema.leads.grade, params.grade));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return await db.select().from(schema.leads).where(where).orderBy(desc(schema.leads.createdAt));
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
  // Student Details
  dateOfBirth?: Date | null;
  currentClass?: string | null;
  currentSchool?: string | null;
  address?: string | null;
  enrollmentSystem?: string | null;
  // Test Details
  testDate?: Date | null;
  testTime?: string | null;
  mathScore?: number | null;
  englishScore?: number | null;
  vietnameseScore?: number | null;
  // Financial & Discount Details
  scholarshipPercent?: number | null;
  periodDiscountPercent?: number | null;
  siblingDiscountPercent?: number | null;
  staffDiscountPercent?: number | null;
  otherDiscountPercent?: number | null;
  finalTuition?: number | null;
  seatReservationFee?: number | null;
  additionalFee?: number | null;
  seatReservationDate?: Date | null;
  // Post-Enrollment Details
  nationalStudentId?: string | null;
  insuranceId?: string | null;
  moetStudentId?: string | null;
  siblingsInfo?: any | null;
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
    
    // Student Details
    dateOfBirth: data.dateOfBirth || null,
    currentClass: data.currentClass || null,
    currentSchool: data.currentSchool || null,
    address: data.address || null,
    enrollmentSystem: data.enrollmentSystem || null,

    // Test Details
    testDate: data.testDate || null,
    testTime: data.testTime || null,
    mathScore: data.mathScore || null,
    englishScore: data.englishScore || null,
    vietnameseScore: data.vietnameseScore || null,

    // Financial & Discount Details
    scholarshipPercent: data.scholarshipPercent || null,
    periodDiscountPercent: data.periodDiscountPercent || null,
    siblingDiscountPercent: data.siblingDiscountPercent || null,
    staffDiscountPercent: data.staffDiscountPercent || null,
    otherDiscountPercent: data.otherDiscountPercent || null,
    finalTuition: data.finalTuition || null,
    seatReservationFee: data.seatReservationFee || null,
    additionalFee: data.additionalFee || null,
    seatReservationDate: data.seatReservationDate || null,

    // Post-Enrollment Details
    nationalStudentId: data.nationalStudentId || null,
    insuranceId: data.insuranceId || null,
    moetStudentId: data.moetStudentId || null,
    siblingsInfo: data.siblingsInfo || null,
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
    // Student Details
    dateOfBirth?: Date | null;
    currentClass?: string | null;
    currentSchool?: string | null;
    address?: string | null;
    enrollmentSystem?: string | null;
    // Test Details
    testDate?: Date | null;
    testTime?: string | null;
    mathScore?: number | null;
    englishScore?: number | null;
    vietnameseScore?: number | null;
    // Financial & Discount Details
    scholarshipPercent?: number | null;
    periodDiscountPercent?: number | null;
    siblingDiscountPercent?: number | null;
    staffDiscountPercent?: number | null;
    otherDiscountPercent?: number | null;
    finalTuition?: number | null;
    seatReservationFee?: number | null;
    additionalFee?: number | null;
    seatReservationDate?: Date | null;
    // Post-Enrollment Details
    nationalStudentId?: string | null;
    insuranceId?: string | null;
    moetStudentId?: string | null;
    siblingsInfo?: any | null;
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
      
      // Student Details
      dateOfBirth: data.dateOfBirth || null,
      currentClass: data.currentClass || null,
      currentSchool: data.currentSchool || null,
      address: data.address || null,
      enrollmentSystem: data.enrollmentSystem || null,

      // Test Details
      testDate: data.testDate || null,
      testTime: data.testTime || null,
      mathScore: data.mathScore || null,
      englishScore: data.englishScore || null,
      vietnameseScore: data.vietnameseScore || null,

      // Financial & Discount Details
      scholarshipPercent: data.scholarshipPercent || null,
      periodDiscountPercent: data.periodDiscountPercent || null,
      siblingDiscountPercent: data.siblingDiscountPercent || null,
      staffDiscountPercent: data.staffDiscountPercent || null,
      otherDiscountPercent: data.otherDiscountPercent || null,
      finalTuition: data.finalTuition || null,
      seatReservationFee: data.seatReservationFee || null,
      additionalFee: data.additionalFee || null,
      seatReservationDate: data.seatReservationDate || null,

      // Post-Enrollment Details
      nationalStudentId: data.nationalStudentId || null,
      insuranceId: data.insuranceId || null,
      moetStudentId: data.moetStudentId || null,
      siblingsInfo: data.siblingsInfo || null,
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
  await db.update(schema.leads).set({ deletedAt: new Date(), deletedBy: 'system', updatedAt: new Date() }).where(eq(schema.leads.id, id));
  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}
