import { db, schema } from "./src/libs/server/db";
import { eq } from "drizzle-orm";
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from "./src/app/[locale]/(admin)/users/users.constants";

const initialMatrix: any = {};

// Helper to set permission
function setPerm(dept: string, module: string, actions: string[]) {
  if (!initialMatrix[dept]) initialMatrix[dept] = {};
  if (!initialMatrix[dept][module]) initialMatrix[dept][module] = {};
  for (const action of actions) {
    initialMatrix[dept][module][action] = true;
  }
}

// dept_bgh
const bghModules = ['dashboard', 'directives', 'approvals', 'kpi', 'okr', 'risk', 'plans', 'reports'];
for (const m of bghModules) setPerm('dept_bgh', m, ['view', 'approve']);
setPerm('dept_bgh', 'directives', ['create', 'edit']);

// dept_tuyensinh
const tsModules = ['crm', 'admissions'];
for (const m of tsModules) setPerm('dept_tuyensinh', m, ['view', 'create', 'edit', 'delete', 'export']);
setPerm('dept_tuyensinh', 'announcements', ['view']);
setPerm('dept_tuyensinh', 'chat', ['view']);
setPerm('dept_tuyensinh', 'events', ['view']);

// dept_nhansu
const hrModules = ['hrm', 'users', 'departments', 'kpi'];
for (const m of hrModules) setPerm('dept_nhansu', m, ['view', 'create', 'edit', 'delete', 'export']);

// dept_giaovu
const gvModules = ['students', 'classes', 'timetable', 'exams', 'conduct', 'communication-book'];
for (const m of gvModules) setPerm('dept_giaovu', m, ['view', 'create', 'edit', 'delete', 'export']);

// dept_csvc
const csvcModules = ['facilities', 'tickets'];
for (const m of csvcModules) setPerm('dept_csvc', m, ['view', 'create', 'edit', 'delete', 'export']);

// dept_hanhchinh
const hcModules = ['tasks', 'approvals', 'meetings', 'letters', 'storage'];
for (const m of hcModules) setPerm('dept_hanhchinh', m, ['view', 'create', 'edit', 'approve']);

// dept_ketoan
const ktModules = ['payments'];
for (const m of ktModules) setPerm('dept_ketoan', m, ['view', 'create', 'edit', 'export']);

// dept_dichvu
const dvModules = ['school-services', 'meals', 'transport'];
for (const m of dvModules) setPerm('dept_dichvu', m, ['view', 'create', 'edit', 'export']);

// dept_yte
setPerm('dept_yte', 'health', ['view', 'create', 'edit', 'export']);

// dept_truyenthong
const ttModules = ['media', 'events', 'announcements'];
for (const m of ttModules) setPerm('dept_truyenthong', m, ['view', 'create', 'edit']);

// dept_it
const itModules = ['settings', 'users', 'storage', 'tickets'];
for (const m of itModules) setPerm('dept_it', m, ['view', 'configure']);

// Tổ chuyên môn
const tcModules = ['lesson-plans', 'exams', 'subject-groups'];
for (const dept of ['dept_toantin', 'dept_nguvan', 'dept_tienganh', 'dept_khoahoc']) {
  for (const m of tcModules) setPerm(dept, m, ['view', 'create', 'edit']);
}

// Add admin role explicitly
for (const m of PERMISSION_MODULES) {
  setPerm('ADMIN', m.key, PERMISSION_ACTIONS.map(a => a.key));
}

async function seed() {
  console.log("Seeding system_matrix...");
  const existing = await db.select().from(schema.rbacConfig).where(eq(schema.rbacConfig.id, "system_matrix")).limit(1);
  if (existing.length > 0) {
    await db.update(schema.rbacConfig).set({ config: initialMatrix, updatedAt: new Date() }).where(eq(schema.rbacConfig.id, "system_matrix"));
    console.log("Updated system_matrix!");
  } else {
    await db.insert(schema.rbacConfig).values({
      id: "system_matrix",
      config: initialMatrix,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Inserted system_matrix!");
  }
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
