import { and, desc, eq, sql } from 'drizzle-orm';
import { db, schema } from './db';
import { getCurrentActor, writeAuditLog, type Actor } from './auth-helper';

// ============================================================================
// GIÁO ÁN (LESSON PLANS)
// ============================================================================

export async function getLessonPlans(filters?: { status?: string; teacherId?: string }) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const conditions = [];
  if (filters?.status) conditions.push(eq(schema.lessonPlans.status, filters.status as any));
  if (filters?.teacherId) conditions.push(eq(schema.lessonPlans.teacherId, filters.teacherId));

  // Access control
  if (actor.role === 'TEACHER') {
    conditions.push(eq(schema.lessonPlans.teacherId, actor.id));
  }

  return db.select().from(schema.lessonPlans)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.lessonPlans.createdAt));
}

export async function createLessonPlan(input: {
  title: string;
  subjectId?: string;
  classId?: string;
  groupId?: string;
  week?: number;
  schoolYear?: string;
  term?: string;
  content?: string;
  fileUrl?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const id = `lp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const plan = {
    id,
    teacherId: actor.id,
    ...input,
    status: 'draft' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(schema.lessonPlans).values(plan);
  await writeAuditLog(actor.id, 'LESSON_PLAN_CREATED', 'LESSON_PLAN', id, input);

  return plan;
}

export async function updateLessonPlan(id: string, updates: Record<string, any>) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const [existing] = await db.select().from(schema.lessonPlans).where(eq(schema.lessonPlans.id, id)).limit(1);
  if (!existing) throw new Error('NOT_FOUND');
  if (existing.teacherId !== actor.id && actor.role !== 'ADMIN') throw new Error('FORBIDDEN');
  if (existing.status !== 'draft' && existing.status !== 'rejected') throw new Error('INVALID_STATE');

  const updateData = { ...updates, updatedAt: new Date() };
  await db.update(schema.lessonPlans).set(updateData).where(eq(schema.lessonPlans.id, id));
  await writeAuditLog(actor.id, 'LESSON_PLAN_UPDATED', 'LESSON_PLAN', id, updates);

  return { ...existing, ...updateData };
}

export async function submitLessonPlan(id: string, approverId: string, approverWorkspaceId?: string, approverRole?: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const [existing] = await db.select().from(schema.lessonPlans).where(eq(schema.lessonPlans.id, id)).limit(1);
  if (!existing) throw new Error('NOT_FOUND');
  if (existing.teacherId !== actor.id && actor.role !== 'ADMIN') throw new Error('FORBIDDEN');
  if (existing.status !== 'draft' && existing.status !== 'rejected') throw new Error('INVALID_STATE');

  // Import locally to avoid circular dependencies if any, or just import at the top
  const { createApprovalRequest } = await import('./approval-engine');

  const request = await createApprovalRequest({
    module: 'ACADEMIC',
    entityType: 'LESSON_PLAN',
    entityId: id,
    title: `Phê duyệt giáo án: ${existing.title}`,
    status: 'PENDING',
    approverId,
    approverWorkspaceId,
    approverRole,
    targetUrl: `/academic/lesson-plans/${id}`,
  }, actor);

  await db.update(schema.lessonPlans).set({ 
    status: 'submitted', 
    submittedAt: new Date(), 
    updatedAt: new Date() 
  }).where(eq(schema.lessonPlans.id, id));

  await writeAuditLog(actor.id, 'LESSON_PLAN_SUBMITTED', 'LESSON_PLAN', id, { requestId: request.id });

  return request;
}

export async function deleteLessonPlan(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const [existing] = await db.select().from(schema.lessonPlans).where(eq(schema.lessonPlans.id, id)).limit(1);
  if (!existing) throw new Error('NOT_FOUND');
  if (existing.teacherId !== actor.id && actor.role !== 'ADMIN') throw new Error('FORBIDDEN');
  if (existing.status !== 'draft') throw new Error('INVALID_STATE');

  await db.delete(schema.lessonPlans).where(eq(schema.lessonPlans.id, id));
  await writeAuditLog(actor.id, 'LESSON_PLAN_DELETED', 'LESSON_PLAN', id);

  return true;
}

// ============================================================================
// PHÂN CÔNG GIẢNG DẠY (TEACHING ASSIGNMENTS)
// ============================================================================

export async function getTeachingAssignments(filters?: { teacherId?: string; classId?: string }) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const conditions = [];
  if (filters?.teacherId) conditions.push(eq(schema.teachingAssignments.teacherId, filters.teacherId));
  if (filters?.classId) conditions.push(eq(schema.teachingAssignments.classId, filters.classId));

  return db.select().from(schema.teachingAssignments)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.teachingAssignments.createdAt));
}

// ============================================================================
// DỰ GIỜ (TEACHING OBSERVATIONS)
// ============================================================================

export async function getTeachingObservations(filters?: { teacherId?: string; observerId?: string }) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const conditions = [];
  if (filters?.teacherId) conditions.push(eq(schema.teachingObservations.teacherId, filters.teacherId));
  if (filters?.observerId) conditions.push(eq(schema.teachingObservations.observerId, filters.observerId));

  return db.select().from(schema.teachingObservations)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.teachingObservations.date));
}

// ============================================================================
// THỜI KHÓA BIỂU (TIMETABLE)
// ============================================================================

export async function getTimetable(filters?: { classId?: string; teacherId?: string; schoolYear?: string; term?: string }) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  const conditions = [];
  if (filters?.classId) conditions.push(eq(schema.timetableEntries.classId, filters.classId));
  if (filters?.teacherId) conditions.push(eq(schema.timetableEntries.teacherId, filters.teacherId));
  if (filters?.schoolYear) conditions.push(eq(schema.timetableEntries.schoolYear, filters.schoolYear));
  if (filters?.term) conditions.push(eq(schema.timetableEntries.term, filters.term));

  return db.select().from(schema.timetableEntries)
    .where(conditions.length ? and(...conditions) : undefined);
}

export async function addTimetableSlot(data: {
  classId: string;
  subjectId?: string;
  teacherId?: string;
  dayOfWeek: number;
  period: number;
  startTime?: string;
  endTime?: string;
  room?: string;
  schoolYear?: string;
  term?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('UNAUTHORIZED');

  // Basic server-side conflict check (same class, day, period, year, term)
  const [conflict] = await db.select().from(schema.timetableEntries).where(and(
    eq(schema.timetableEntries.classId, data.classId),
    eq(schema.timetableEntries.dayOfWeek, data.dayOfWeek),
    eq(schema.timetableEntries.period, data.period),
    data.schoolYear ? eq(schema.timetableEntries.schoolYear, data.schoolYear) : undefined,
    data.term ? eq(schema.timetableEntries.term, data.term) : undefined
  ) as any).limit(1);

  if (conflict) {
    throw new Error('TIMETABLE_CONFLICT: Slot already exists for this class, period, and day.');
  }

  // Also check if teacher is already booked
  if (data.teacherId) {
    const [teacherConflict] = await db.select().from(schema.timetableEntries).where(and(
      eq(schema.timetableEntries.teacherId, data.teacherId),
      eq(schema.timetableEntries.dayOfWeek, data.dayOfWeek),
      eq(schema.timetableEntries.period, data.period),
      data.schoolYear ? eq(schema.timetableEntries.schoolYear, data.schoolYear) : undefined,
      data.term ? eq(schema.timetableEntries.term, data.term) : undefined
    ) as any).limit(1);

    if (teacherConflict) {
      throw new Error('TIMETABLE_CONFLICT: Teacher already booked for this period and day.');
    }
  }

  const id = `tt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  await db.insert(schema.timetableEntries).values({ id, ...data, createdAt: new Date(), updatedAt: new Date() });
  await writeAuditLog(actor.id, 'TIMETABLE_SLOT_ADDED', 'TIMETABLE', id, data);

  return { id, ...data };
}

