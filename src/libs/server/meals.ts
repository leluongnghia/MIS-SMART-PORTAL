/* =============================================================================
 *  SERVICE: MEALS — Bán trú & Ăn uống
 *  File: src/libs/server/meals.ts
 * -----------------------------------------------------------------------------
 *  Nghiệp vụ bếp ăn & bán trú kết nối DB thực (schema.mealMenus, v.v.).
 * ============================================================================= */

import { db, schema } from "./db";
import { and, eq, gte, lte, desc } from "drizzle-orm";

/* ---------- Thực đơn ---------- */
export async function getWeekMenu(weekStart: string, campus?: string) {
  const conds = [eq(schema.mealMenus.weekStart, weekStart)];
  if (campus) conds.push(eq(schema.mealMenus.campus, campus));
  return db.select().from(schema.mealMenus).where(and(...conds)).orderBy(schema.mealMenus.dayOfWeek);
}

export async function upsertMenu(data: typeof schema.mealMenus.$inferInsert) {
  const [row] = await db.insert(schema.mealMenus).values(data).returning();
  return row;
}

/* ---------- Đăng ký bán trú ---------- */
export async function registerMeal(data: typeof schema.mealRegistrations.$inferInsert) {
  const [row] = await db.insert(schema.mealRegistrations).values(data).returning();
  return row;
}

export async function listActiveRegistrations() {
  return db
    .select()
    .from(schema.mealRegistrations)
    .where(eq(schema.mealRegistrations.status, "active"));
}

/* ---------- Hồ sơ dị ứng / chế độ ăn ---------- */
export async function setDietaryProfile(data: typeof schema.mealDietaryProfiles.$inferInsert) {
  const [row] = await db
    .insert(schema.mealDietaryProfiles)
    .values({ ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.mealDietaryProfiles.studentId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return row;
}

/** Danh sách HS có dị ứng/chế độ đặc biệt — quan trọng cho bếp ăn */
export async function listSpecialDiets() {
  return db.select().from(schema.mealDietaryProfiles);
}

/* ---------- Điểm danh ăn ---------- */
export async function recordMealAttendance(data: typeof schema.mealDailyAttendance.$inferInsert) {
  const [row] = await db.insert(schema.mealDailyAttendance).values(data).returning();
  return row;
}

export async function getMealAttendance(date: string, mealType?: string) {
  const conds = [eq(schema.mealDailyAttendance.date, date)];
  if (mealType) conds.push(eq(schema.mealDailyAttendance.mealType, mealType as any));
  return db.select().from(schema.mealDailyAttendance).where(and(...conds));
}

/* ---------- Phản hồi bữa ăn ---------- */
export async function submitFeedback(data: typeof schema.mealFeedback.$inferInsert) {
  const [row] = await db.insert(schema.mealFeedback).values(data).returning();
  return row;
}

export async function feedbackInRange(from: string, to: string) {
  return db
    .select()
    .from(schema.mealFeedback)
    .where(and(gte(schema.mealFeedback.date, from), lte(schema.mealFeedback.date, to)));
}

/* ---------- VSATTP ---------- */
export async function logFoodSafety(data: typeof schema.mealFoodSafetyLogs.$inferInsert) {
  const [row] = await db.insert(schema.mealFoodSafetyLogs).values(data).returning();
  return row;
}

export async function recentSafetyLogs(limit = 30) {
  return db
    .select()
    .from(schema.mealFoodSafetyLogs)
    .orderBy(desc(schema.mealFoodSafetyLogs.date))
    .limit(limit);
}
