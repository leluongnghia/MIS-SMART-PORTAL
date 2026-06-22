"use server";

import { db, schema } from "@/src/libs/server/db";
import { MOCK_MASTER_TIMETABLE } from "@/src/mockData";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from "@/src/libs/server/auth-helper";

function canManageSchedule(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || (actor as any).staffType === 'TEACHER' || actor.workspaceId === 'BGH');
}

function planStatusClass(status: string) {
  if (status === 'Đã duyệt') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (status === 'Từ chối') return 'bg-rose-50 text-rose-600 border-rose-200';
  if (status === 'Chờ duyệt') return 'bg-orange-50 text-orange-600 border-orange-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function scheduleChanged() {
  revalidatePath('/[locale]/schedule', 'layout');
}

async function ensureTimetableTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "timetable_slots" (
      "id" text PRIMARY KEY NOT NULL,
      "day" integer NOT NULL,
      "period" integer NOT NULL,
      "subject" text NOT NULL,
      "class_name" text NOT NULL,
      "teacher_id" text,
      "teacher_name" text,
      "room" text NOT NULL,
      "academic_year_id" text,
      "status" text DEFAULT 'ACTIVE' NOT NULL,
      "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "timetable_slots_day_period_idx" ON "timetable_slots" ("day", "period")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "timetable_slots_class_idx" ON "timetable_slots" ("class_name")`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "timetable_slots_teacher_idx" ON "timetable_slots" ("teacher_id")`);
}

async function seedTimetableIfEmpty(users: any[]) {
  await ensureTimetableTable();
  const existing = await db.select({ id: schema.timetableSlots.id }).from(schema.timetableSlots).limit(1);
  if (existing.length) return;
  await db.insert(schema.timetableSlots).values(MOCK_MASTER_TIMETABLE.map(slot => {
    const teacher = users.find(user => user.id === slot.teacherId);
    return {
      id: slot.id,
      day: slot.day,
      period: slot.period,
      subject: slot.subject,
      className: slot.className,
      teacherId: slot.teacherId,
      teacherName: teacher?.name || (slot as any).teacherName || null,
      room: slot.room,
      status: 'ACTIVE',
      payload: { teacherRole: teacher?.title || 'Giáo viên', source: 'seed_from_mock' },
    };
  })).onConflictDoNothing();
}

export async function getInitialData() {
  try {
    const users = await db.select().from(schema.users);
    await seedTimetableIfEmpty(users);
    const timetableRows = await db.select().from(schema.timetableSlots).where(eq(schema.timetableSlots.status, 'ACTIVE')).orderBy(schema.timetableSlots.day, schema.timetableSlots.period);

    const timetable = timetableRows.map(slot => {
      const teacher = users.find(u => u.id === slot.teacherId);
      const payload = (slot.payload || {}) as Record<string, any>;
      return {
        id: slot.id,
        day: slot.day,
        period: slot.period,
        subject: slot.subject,
        className: slot.className,
        teacherId: slot.teacherId,
        room: slot.room,
        teacherName: slot.teacherName || (teacher ? teacher.name : "Giáo viên ẩn danh"),
        teacherRole: teacher ? teacher.title : payload.teacherRole || "Giáo viên",
        avatar: teacher?.avatarUrl || `https://i.pravatar.cc/150?u=${slot.teacherId}`
      };
    });

    // Compute stats
    const todaySlotsCount = timetable.filter(s => s.day === 4).length || 8; 
    const rooms = new Set(timetable.map(s => s.room));
    const roomsInUse = rooms.size || 12;

    const teacherOptions = users
      .filter(u => u.staffType === 'TEACHER' || (u.title || '').toLowerCase().includes('giáo viên'))
      .map(u => ({ id: u.id, name: u.name }));

    const classOptions = Array.from(new Set(timetable.map(s => s.className)));
    const roomOptions = Array.from(rooms);
    const lessonPlanTasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.tag, 'Giáo án'))
      .orderBy(desc(schema.tasks.createdAt));
    const lessonPlans = lessonPlanTasks.map(task => {
      const payload = (task.payload || {}) as Record<string, any>;
      const tag = payload.displayStatus || task.status || 'Chờ duyệt';
      return {
        id: task.id,
        title: task.title,
        date: task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : '',
        subject: payload.subject || 'N/A',
        targetClass: payload.targetClass || 'N/A',
        tag,
        tagCol: planStatusClass(tag),
        persisted: true,
      };
    });

    return {
      timetable,
      stats: {
        todaySlotsCount,
        totalPlannedSlots: 156,
        roomsInUse,
        totalRooms: 42,
        conflictsCount: 3,
        pendingPlansCount: lessonPlans.filter(plan => plan.tag === 'Chờ duyệt').length || 18
      },
      teachers: teacherOptions,
      classes: classOptions,
      rooms: roomOptions,
      lessonPlans
    };
  } catch (e) {
    console.error("Error fetching Schedule data:", e);
    return {
      timetable: [],
      stats: { todaySlotsCount: 0, totalPlannedSlots: 156, roomsInUse: 0, totalRooms: 42, conflictsCount: 0, pendingPlansCount: 0 },
      teachers: [],
      classes: [],
      rooms: [],
      lessonPlans: []
    };
  }
}

export async function createLessonPlanTask(input: { title: string; subject: string; targetClass: string; status: string }) {
  try {
    const actor = await getCurrentActor();
    if (!canManageSchedule(actor)) return { success: false, error: 'Unauthorized' };
    const title = input.title.trim();
    if (!title) return { success: false, error: 'Tiêu đề giáo án bắt buộc.' };

    const id = `lp_${Date.now()}`;
    await db.insert(schema.tasks).values({
      id,
      title,
      description: `Giáo án ${input.subject} - ${input.targetClass}`,
      workspaceId: actor?.workspaceId || 'BGH',
      assignedId: actor?.id || 'system',
      assignedName: actor?.name,
      status: input.status,
      priority: 'MEDIUM',
      deadline: null,
      tag: 'Giáo án',
      payload: {
        kind: 'lesson_plan',
        subject: input.subject,
        targetClass: input.targetClass,
        displayStatus: input.status,
      },
    });
    await writeAuditLog(actor?.id || null, 'create_lesson_plan', 'schedule', id, { after: input, module: 'schedule' });
    scheduleChanged();
    return {
      success: true,
      data: {
        id,
        title,
        date: new Date().toLocaleDateString('vi-VN'),
        subject: input.subject,
        targetClass: input.targetClass,
        tag: input.status,
        tagCol: planStatusClass(input.status),
        persisted: true,
      },
    };
  } catch (e: any) {
    console.error("Create lesson plan failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateLessonPlanTaskStatus(id: string, status: string) {
  try {
    const actor = await getCurrentActor();
    if (!canManageSchedule(actor)) return { success: false, error: 'Unauthorized' };
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).limit(1);
    if (!task) return { success: false, error: 'Không tìm thấy giáo án trong DB.' };
    const payload = (task.payload || {}) as Record<string, any>;
    await db.update(schema.tasks)
      .set({ status, payload: { ...payload, displayStatus: status }, updatedAt: new Date() })
      .where(eq(schema.tasks.id, id));
    await writeAuditLog(actor?.id || null, 'update_lesson_plan_status', 'schedule', id, { after: { status }, module: 'schedule' });
    scheduleChanged();
    return { success: true };
  } catch (e: any) {
    console.error("Update lesson plan status failed:", e);
    return { success: false, error: e.message };
  }
}

export async function saveAttendanceTask(input: { slot: any; attendance: Array<{ id: string; name: string; status: string; note?: string }> }) {
  try {
    const actor = await getCurrentActor();
    if (!canManageSchedule(actor)) return { success: false, error: 'Unauthorized' };
    const id = `att_${Date.now()}`;
    await db.insert(schema.tasks).values({
      id,
      title: `Điểm danh ${input.slot?.className || ''} - ${input.slot?.subject || ''}`.trim(),
      description: 'Ghi nhận điểm danh từ thời khóa biểu',
      workspaceId: actor?.workspaceId || 'BGH',
      assignedId: actor?.id || 'system',
      assignedName: actor?.name,
      status: 'COMPLETED',
      priority: 'LOW',
      deadline: null,
      tag: 'Điểm danh',
      payload: {
        kind: 'attendance',
        slot: input.slot,
        attendance: input.attendance,
      },
    });
    await writeAuditLog(actor?.id || null, 'save_attendance', 'schedule', id, { module: 'schedule', count: input.attendance.length });
    scheduleChanged();
    return { success: true, id };
  } catch (e: any) {
    console.error("Save attendance failed:", e);
    return { success: false, error: e.message };
  }
}

export async function createTimetableSlot(input: any) {
  try {
    const actor = await getCurrentActor();
    if (!canManageSchedule(actor)) return { success: false, error: 'Unauthorized' };
    await ensureTimetableTable();
    const id = `slot_${Date.now()}`;
    const [row] = await db.insert(schema.timetableSlots).values({
      id,
      day: Number(input.day) || 2,
      period: Number(input.period) || 1,
      subject: input.subject || 'Môn học',
      className: input.className || 'Chưa chọn',
      teacherId: input.teacherId || null,
      teacherName: input.teacherName || null,
      room: input.room || 'N/A',
      status: 'ACTIVE',
      payload: input.payload || {},
    }).returning();
    await writeAuditLog(actor?.id || null, 'create_timetable_slot', 'schedule', id, { after: row, module: 'schedule' });
    scheduleChanged();
    return { success: true, data: row };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateTimetableSlot(id: string, input: any) {
  try {
    const actor = await getCurrentActor();
    if (!canManageSchedule(actor)) return { success: false, error: 'Unauthorized' };
    await ensureTimetableTable();
    const [before] = await db.select().from(schema.timetableSlots).where(eq(schema.timetableSlots.id, id)).limit(1);
    if (!before) return { success: false, error: 'Không tìm thấy tiết học.' };
    const [row] = await db.update(schema.timetableSlots).set({
      day: Number(input.day ?? before.day),
      period: Number(input.period ?? before.period),
      subject: input.subject ?? before.subject,
      className: input.className ?? before.className,
      teacherId: input.teacherId ?? before.teacherId,
      teacherName: input.teacherName ?? before.teacherName,
      room: input.room ?? before.room,
      payload: { ...((before.payload as any) || {}), ...(input.payload || {}) },
      updatedAt: new Date(),
    }).where(eq(schema.timetableSlots.id, id)).returning();
    await writeAuditLog(actor?.id || null, 'update_timetable_slot', 'schedule', id, { before, after: row, module: 'schedule' });
    scheduleChanged();
    return { success: true, data: row };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteTimetableSlot(id: string) {
  try {
    const actor = await getCurrentActor();
    if (!canManageSchedule(actor)) return { success: false, error: 'Unauthorized' };
    await ensureTimetableTable();
    const [row] = await db.update(schema.timetableSlots).set({ status: 'DELETED', updatedAt: new Date() }).where(eq(schema.timetableSlots.id, id)).returning();
    await writeAuditLog(actor?.id || null, 'delete_timetable_slot', 'schedule', id, { before: row, module: 'schedule' });
    scheduleChanged();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
