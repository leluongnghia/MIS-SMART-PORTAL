/* =============================================================================
 *  SERVICE: HEALTH — Y tế học đường  (DỮ LIỆU NHẠY CẢM)
 *  File: src/libs/server/health.ts
 * -----------------------------------------------------------------------------
 *  CƠ CHẾ BẢO MẬT (confidential):
 *  - Mọi hàm đọc đều nhận `ctx` (người dùng hiện tại) và đi qua `assertHealthAccess`.
 *  - Chỉ các role sau được xem dữ liệu y tế nhạy cảm:
 *      'nurse' (y tá), 'operations' (khối vận hành DV), 'principal' (BGH),
 *      'council' (HĐT - xem tổng hợp), và GVCN/Quản nhiệm CHỈ với HS lớp mình.
 *  - Phụ huynh chỉ xem hồ sơ con mình (qua cổng riêng, không nằm trong service này).
 *  - Mọi truy cập hồ sơ nhạy cảm nên ghi audit log.
 * ============================================================================= */

import { db, schema } from "./db";
import { and, eq, desc } from "drizzle-orm";
import { writeAuditLog } from "./auth-helper";

/* ---- Bối cảnh người gọi (lấy từ session/auth) ---- */
export interface HealthCtx {
  userId: string;
  role: string;                       // 'nurse' | 'operations' | 'principal' | 'council' | 'homeroom_gvcn' | ...
  homeroomClassIds?: string[];        // lớp mà GVCN/Quản nhiệm phụ trách
}

const HEALTH_FULL_ROLES = new Set(["nurse", "operations", "principal", "system_admin", "ADMIN"]);
const HEALTH_SUMMARY_ROLES = new Set(["council"]); // chỉ xem tổng hợp, không chi tiết nhạy cảm

export class HealthAccessError extends Error {
  constructor(msg = "Không có quyền truy cập dữ liệu y tế") {
    super(msg);
    this.name = "HealthAccessError";
  }
}

/**
 * Kiểm tra quyền truy cập 1 hồ sơ HS cụ thể.
 * @param studentClassId lớp của HS (để chiếu quyền GVCN theo lớp)
 */
function assertHealthAccess(ctx: HealthCtx, studentClassId?: string) {
  if (HEALTH_FULL_ROLES.has(ctx.role)) return;
  // GVCN/Quản nhiệm: chỉ HS thuộc lớp mình
  if (
    (ctx.role === "homeroom_gvcn" || ctx.role === "supervisor_quannhiem" || ctx.role === "TEACHER") &&
    studentClassId != null &&
    ctx.homeroomClassIds?.includes(studentClassId)
  ) {
    return;
  }
  throw new HealthAccessError();
}

/** Ghi audit log mỗi lần xem hồ sơ nhạy cảm */
async function auditHealthAccess(ctx: HealthCtx, action: string, studentId: string) {
  try {
    await writeAuditLog(ctx.userId, action, "HEALTH", studentId, { module: "HEALTH" });
  } catch (e) {
    console.error("Failed to write health audit log:", e);
  }
}

/* ---------- Hồ sơ sức khỏe ---------- */
export async function getHealthProfile(ctx: HealthCtx, studentId: string, studentClassId?: string) {
  assertHealthAccess(ctx, studentClassId);
  await auditHealthAccess(ctx, "view_profile", studentId);
  const [row] = await db
    .select()
    .from(schema.healthProfiles)
    .where(eq(schema.healthProfiles.studentId, studentId));
  return row;
}

export async function upsertHealthProfile(
  ctx: HealthCtx,
  data: typeof schema.healthProfiles.$inferInsert
) {
  // chỉ y tá / vận hành được ghi
  if (!HEALTH_FULL_ROLES.has(ctx.role)) throw new HealthAccessError("Chỉ y tế được cập nhật hồ sơ");
  const [row] = await db
    .insert(schema.healthProfiles)
    .values({ ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.healthProfiles.studentId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  await auditHealthAccess(ctx, "upsert_profile", data.studentId);
  return row;
}

/* ---------- Sự cố / sơ cứu ---------- */
export async function recordIncident(ctx: HealthCtx, data: typeof schema.healthIncidents.$inferInsert) {
  if (!HEALTH_FULL_ROLES.has(ctx.role)) throw new HealthAccessError("Chỉ y tế được ghi sự cố");
  const [row] = await db
    .insert(schema.healthIncidents)
    .values({ ...data, handledBy: data.handledBy ?? ctx.userId })
    .returning();
  await auditHealthAccess(ctx, "record_incident", data.studentId);
  return row;
}

export async function listIncidents(ctx: HealthCtx, studentId: string, studentClassId?: string) {
  assertHealthAccess(ctx, studentClassId);
  await auditHealthAccess(ctx, "list_incidents", studentId);
  return db
    .select()
    .from(schema.healthIncidents)
    .where(eq(schema.healthIncidents.studentId, studentId))
    .orderBy(desc(schema.healthIncidents.occurredAt));
}

/* ---------- Thuốc (cần đồng ý PH) ---------- */
export async function addMedication(ctx: HealthCtx, data: typeof schema.healthMedications.$inferInsert) {
  if (!HEALTH_FULL_ROLES.has(ctx.role)) throw new HealthAccessError();
  if (!data.parentConsent) {
    throw new Error("Không thể cấp thuốc khi chưa có sự đồng ý của phụ huynh");
  }
  const [row] = await db.insert(schema.healthMedications).values(data).returning();
  await auditHealthAccess(ctx, "add_medication", data.studentId);
  return row;
}

export async function activeMedications(ctx: HealthCtx, studentId: string, studentClassId?: string) {
  assertHealthAccess(ctx, studentClassId);
  return db
    .select()
    .from(schema.healthMedications)
    .where(and(eq(schema.healthMedications.studentId, studentId), eq(schema.healthMedications.status, "active")));
}

/* ---------- Nghỉ ốm ---------- */
export async function recordSickLeave(ctx: HealthCtx, data: typeof schema.healthSickLeaves.$inferInsert) {
  // GVCN cũng có thể ghi nhận nghỉ ốm cho lớp mình
  assertHealthAccess(ctx, undefined);
  const [row] = await db.insert(schema.healthSickLeaves).values(data).returning();
  return row;
}

/**
 * Báo cáo TỔNG HỢP (không lộ chi tiết nhạy cảm) — dùng cho HĐT/council.
 * Chỉ trả về số liệu thống kê, không trả nội dung hồ sơ cá nhân.
 */
export async function healthSummary(ctx: HealthCtx) {
  if (!HEALTH_FULL_ROLES.has(ctx.role) && !HEALTH_SUMMARY_ROLES.has(ctx.role)) {
    throw new HealthAccessError();
  }
  const incidents = await db.select().from(schema.healthIncidents);
  return {
    totalIncidents: incidents.length,
    emergencies: incidents.filter((i) => i.severity === "emergency").length,
    serious: incidents.filter((i) => i.severity === "serious").length,
  };
}
