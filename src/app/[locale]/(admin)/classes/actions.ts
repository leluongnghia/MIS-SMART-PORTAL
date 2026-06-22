"use server";

import { classService } from "@/src/libs/server/class-service";
import { studentService } from "@/src/libs/server/student-service";
import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from "@/src/libs/server/auth-helper";

function canManageClasses(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || actor.workspaceId === 'BGH');
}

function classesChanged() {
  revalidatePath('/[locale]/classes', 'layout');
  revalidatePath('/[locale]/students', 'layout');
}

async function seedClassesIfEmpty() {
  const classes = [
    // Tiểu học
    { id: "class_1A1", name: "1A1", code: "1A1", gradeLevel: "1" },
    { id: "class_1A2", name: "1A2", code: "1A2", gradeLevel: "1" },
    { id: "class_1A3", name: "1A3", code: "1A3", gradeLevel: "1" },
    { id: "class_1A4", name: "1A4", code: "1A4", gradeLevel: "1" },
    { id: "class_2A1", name: "2A1", code: "2A1", gradeLevel: "2" },
    { id: "class_2A2", name: "2A2", code: "2A2", gradeLevel: "2" },
    { id: "class_2A3", name: "2A3", code: "2A3", gradeLevel: "2" },
    { id: "class_2A4", name: "2A4", code: "2A4", gradeLevel: "2" },
    { id: "class_3A1", name: "3A1", code: "3A1", gradeLevel: "3" },
    { id: "class_3A2", name: "3A2", code: "3A2", gradeLevel: "3" },
    { id: "class_3A3", name: "3A3", code: "3A3", gradeLevel: "3" },
    { id: "class_3A4", name: "3A4", code: "3A4", gradeLevel: "3" },
    { id: "class_4A1", name: "4A1", code: "4A1", gradeLevel: "4" },
    { id: "class_4A2", name: "4A2", code: "4A2", gradeLevel: "4" },
    { id: "class_4A3", name: "4A3", code: "4A3", gradeLevel: "4" },
    { id: "class_4A4", name: "4A4", code: "4A4", gradeLevel: "4" },
    { id: "class_5A1", name: "5A1", code: "5A1", gradeLevel: "5" },
    { id: "class_5A2", name: "5A2", code: "5A2", gradeLevel: "5" },
    { id: "class_5A3", name: "5A3", code: "5A3", gradeLevel: "5" },
    { id: "class_5A4", name: "5A4", code: "5A4", gradeLevel: "5" },
    // THCS
    { id: "class_6A1", name: "6A1", code: "6A1", gradeLevel: "6" },
    { id: "class_6A2", name: "6A2", code: "6A2", gradeLevel: "6" },
    { id: "class_7A1", name: "7A1", code: "7A1", gradeLevel: "7" },
    { id: "class_7A2", name: "7A2", code: "7A2", gradeLevel: "7" },
    { id: "class_8A1", name: "8A1", code: "8A1", gradeLevel: "8" },
    { id: "class_8A2", name: "8A2", code: "8A2", gradeLevel: "8" },
    { id: "class_9A1", name: "9A1", code: "9A1", gradeLevel: "9" },
    { id: "class_9A2", name: "9A2", code: "9A2", gradeLevel: "9" },
    // THPT
    { id: "class_10A1", name: "10A1", code: "10A1", gradeLevel: "10" },
    { id: "class_10A2", name: "10A2", code: "10A2", gradeLevel: "10" },
    { id: "class_11A1", name: "11A1", code: "11A1", gradeLevel: "11" },
    { id: "class_11A2", name: "11A2", code: "11A2", gradeLevel: "11" },
    { id: "class_12A1", name: "12A1", code: "12A1", gradeLevel: "12" },
    { id: "class_12A2", name: "12A2", code: "12A2", gradeLevel: "12" },
  ];

  await db.insert(schema.classes).values(classes.map(c => ({
    ...c,
    payload: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }))).onConflictDoNothing();
}

export async function getInitialData() {
  try {
    await seedClassesIfEmpty();
    const [classesList, studentsList] = await Promise.all([
      classService.findMany({}),
      studentService.findMany({})
    ]);

    return {
      classes: classesList,
      students: studentsList,
    };
  } catch (e) {
    console.error("Failed to fetch classes data:", e);
    return { classes: [], students: [] };
  }
}

export async function createClass(input: any) {
  try {
    const actor = await getCurrentActor();
    if (!canManageClasses(actor)) return { success: false, error: 'Unauthorized' };
    const name = String(input.name || '').trim();
    if (!name) return { success: false, error: 'Tên lớp bắt buộc.' };
    const [row] = await db.insert(schema.classes).values({
      id: `class_${Date.now()}`,
      name,
      code: input.code || name,
      gradeLevel: input.gradeLevel || String(name.match(/\d+/)?.[0] || ''),
      capacity: Number(input.capacity) || null,
      status: input.status || 'ACTIVE',
      payload: input.payload || {},
    }).returning();
    await writeAuditLog(actor?.id || null, 'create_class', 'class', row.id, { after: row, module: 'classes' });
    classesChanged();
    return { success: true, data: row };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateClass(id: string, input: any) {
  try {
    const actor = await getCurrentActor();
    if (!canManageClasses(actor)) return { success: false, error: 'Unauthorized' };
    const [before] = await db.select().from(schema.classes).where(eq(schema.classes.id, id)).limit(1);
    if (!before) return { success: false, error: 'Không tìm thấy lớp.' };
    const [row] = await db.update(schema.classes).set({
      name: input.name ?? before.name,
      code: input.code ?? before.code,
      gradeLevel: input.gradeLevel ?? before.gradeLevel,
      capacity: Number(input.capacity) || before.capacity,
      status: input.status ?? before.status,
      payload: { ...((before.payload as any) || {}), ...(input.payload || {}) },
      updatedAt: new Date(),
    }).where(eq(schema.classes.id, id)).returning();
    if (before.name !== row.name) {
      await db.update(schema.studentDirectory).set({ className: row.name, updatedAt: new Date() }).where(eq(schema.studentDirectory.className, before.name));
    }
    await writeAuditLog(actor?.id || null, 'update_class', 'class', id, { before, after: row, module: 'classes' });
    classesChanged();
    return { success: true, data: row };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteClass(id: string) {
  try {
    const actor = await getCurrentActor();
    if (!canManageClasses(actor)) return { success: false, error: 'Unauthorized' };
    const [before] = await db.select().from(schema.classes).where(eq(schema.classes.id, id)).limit(1);
    if (!before) return { success: false, error: 'Không tìm thấy lớp.' };
    const count = (await db.select().from(schema.studentDirectory).where(eq(schema.studentDirectory.className, before.name))).length;
    if (count > 0) return { success: false, error: 'Không thể xóa lớp còn học sinh. Chuyển học sinh trước.' };
    await db.delete(schema.classes).where(eq(schema.classes.id, id));
    await writeAuditLog(actor?.id || null, 'delete_class', 'class', id, { before, module: 'classes' });
    classesChanged();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function moveStudentToClass(studentId: string, className: string) {
  try {
    const actor = await getCurrentActor();
    if (!canManageClasses(actor)) return { success: false, error: 'Unauthorized' };
    const [row] = await db.update(schema.studentDirectory).set({ className, updatedAt: new Date() }).where(eq(schema.studentDirectory.id, studentId)).returning();
    await writeAuditLog(actor?.id || null, 'move_student_class', 'student', studentId, { after: { className }, module: 'classes' });
    classesChanged();
    return { success: true, data: row };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
