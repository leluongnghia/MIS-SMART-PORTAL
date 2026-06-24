/* =============================================================================
 *  SERVICE: TRANSPORT — Xe đưa đón
 *  File: src/libs/server/transport.ts
 * -----------------------------------------------------------------------------
 *  Nghiệp vụ xe đưa đón kết nối DB thực (schema.transportRoutes, v.v.).
 * ============================================================================= */

import { db, schema } from "./db";
import { and, eq, desc } from "drizzle-orm";

/* ---------- Tuyến ---------- */
export async function listRoutes(opts: { activeOnly?: boolean } = {}) {
  const where = opts.activeOnly ? eq(schema.transportRoutes.active, true) : undefined;
  return db.select().from(schema.transportRoutes).where(where);
}

export async function createRoute(data: typeof schema.transportRoutes.$inferInsert) {
  const [row] = await db.insert(schema.transportRoutes).values(data).returning();
  return row;
}

export async function updateRoute(id: string, data: Partial<typeof schema.transportRoutes.$inferInsert>) {
  const [row] = await db
    .update(schema.transportRoutes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.transportRoutes.id, id))
    .returning();
  return row;
}

/* ---------- Điểm dừng theo tuyến ---------- */
export async function listStops(routeId: string) {
  return db
    .select()
    .from(schema.transportStops)
    .where(eq(schema.transportStops.routeId, routeId))
    .orderBy(schema.transportStops.sequence);
}

/* ---------- Xe ---------- */
export async function listVehicles() {
  return db.select().from(schema.transportVehicles);
}

/* ---------- Đăng ký HS theo tuyến ---------- */
export async function assignStudent(data: typeof schema.transportStudentAssignments.$inferInsert) {
  const [row] = await db.insert(schema.transportStudentAssignments).values(data).returning();
  return row;
}

export async function listStudentsByRoute(routeId: string) {
  return db
    .select()
    .from(schema.transportStudentAssignments)
    .where(
      and(
        eq(schema.transportStudentAssignments.routeId, routeId),
        eq(schema.transportStudentAssignments.status, "active")
      )
    );
}

/* ---------- Điểm danh lên/xuống xe ---------- */
export async function recordBoarding(params: {
  studentId: string;
  routeId: string;
  vehicleId?: string;
  date: string;       // YYYY-MM-DD
  direction: "pickup" | "dropoff" | "both";
  status?: "boarded" | "alighted" | "absent" | "no_show";
  recordedBy?: string;
}) {
  const [row] = await db
    .insert(schema.transportAttendance)
    .values({
      id: crypto.randomUUID(),
      studentId: params.studentId,
      routeId: params.routeId,
      vehicleId: params.vehicleId,
      date: params.date,
      direction: params.direction,
      status: params.status ?? "boarded",
      boardOnTime: params.status === "boarded" ? new Date() : undefined,
      boardOffTime: params.status === "alighted" ? new Date() : undefined,
      recordedBy: params.recordedBy,
    })
    .returning();
  return row;
}

export async function getAttendanceByDate(routeId: string, date: string) {
  return db
    .select()
    .from(schema.transportAttendance)
    .where(and(eq(schema.transportAttendance.routeId, routeId), eq(schema.transportAttendance.date, date)));
}

/* ---------- Sự cố ---------- */
export async function reportIncident(data: typeof schema.transportIncidents.$inferInsert) {
  const [row] = await db.insert(schema.transportIncidents).values(data).returning();
  return row;
}

export async function listIncidents(routeId?: string) {
  const where = routeId ? eq(schema.transportIncidents.routeId, routeId) : undefined;
  return db
    .select()
    .from(schema.transportIncidents)
    .where(where)
    .orderBy(desc(schema.transportIncidents.occurredAt));
}
