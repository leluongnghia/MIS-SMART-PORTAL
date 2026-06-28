"use server";

import { db, schema } from '../db';
import { eq, and, inArray } from 'drizzle-orm';
import { getCurrentActor } from '../auth-helper';
import { getUserModules, getModuleDataScope, DataScopeType } from '../module-auth-service';
import { revalidatePath } from 'next/cache';

async function checkAdminAuth() {
  const actor = await getCurrentActor();
  if (!actor || (actor.role !== 'ADMIN' && (actor as any).userType !== 'SUPER_ADMIN')) {
    throw new Error("Unauthorized: Chỉ Super Admin hoặc Admin mới có quyền thực hiện thao tác này.");
  }
  return actor;
}

// ==========================================
// 1. QUẢN LÝ MODULES
// ==========================================
export async function getAllModulesAdmin() {
  await checkAdminAuth();
  return await db.select().from(schema.modules).orderBy(schema.modules.sort);
}

export async function toggleModuleStatusAdmin(moduleId: string, status: boolean) {
  await checkAdminAuth();
  await db.update(schema.modules)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.modules.id, moduleId));
  revalidatePath('/[locale]/(admin)/system-settings/permissions', 'page');
  return { success: true };
}

// ==========================================
// 2. QUẢN LÝ PHÂN QUYỀN PHÒNG BAN
// ==========================================
export async function getAllDepartmentsAdmin() {
  await checkAdminAuth();
  return await db.select().from(schema.departments).orderBy(schema.departments.sort, schema.departments.name);
}

export async function getDepartmentModulesAdmin(departmentId: string) {
  await checkAdminAuth();
  const rows = await db.select({ moduleId: schema.departmentModules.moduleId })
    .from(schema.departmentModules)
    .where(eq(schema.departmentModules.departmentId, departmentId));
  return rows.map(r => r.moduleId);
}

export async function saveDepartmentModulesAdmin(departmentId: string, moduleIds: string[]) {
  await checkAdminAuth();
  // Xoá cũ
  await db.delete(schema.departmentModules)
    .where(eq(schema.departmentModules.departmentId, departmentId));
  
  // Thêm mới
  if (moduleIds.length > 0) {
    const now = new Date();
    const inserts = moduleIds.map(modId => ({
      id: `dm_${departmentId}_${modId}`,
      departmentId,
      moduleId: modId,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(schema.departmentModules).values(inserts).onConflictDoNothing();
  }
  revalidatePath('/[locale]/(admin)/system-settings/permissions', 'page');
  return { success: true };
}

// ==========================================
// 3. QUẢN LÝ USER OVERRIDES & DATA SCOPES
// ==========================================
export async function getAllUsersForPermAdmin() {
  await checkAdminAuth();
  return await db.select({
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    role: schema.users.role,
    userType: schema.users.userType,
    departmentId: schema.users.departmentId,
    avatarUrl: schema.users.avatarUrl,
    status: schema.users.status,
  }).from(schema.users).orderBy(schema.users.name);
}

export async function getUserPermissionDetailsAdmin(userId: string) {
  await checkAdminAuth();
  
  // Overrides
  const overrides = await db.select({
    id: schema.userModuleOverrides.id,
    moduleId: schema.userModuleOverrides.moduleId,
    moduleName: schema.modules.name,
    moduleSlug: schema.modules.slug,
    effect: schema.userModuleOverrides.effect,
  })
  .from(schema.userModuleOverrides)
  .innerJoin(schema.modules, eq(schema.userModuleOverrides.moduleId, schema.modules.id))
  .where(eq(schema.userModuleOverrides.userId, userId));

  // Data Scopes
  const scopes = await db.select({
    id: schema.dataScopes.id,
    moduleId: schema.dataScopes.moduleId,
    moduleName: schema.modules.name,
    moduleSlug: schema.modules.slug,
    scope: schema.dataScopes.scope,
  })
  .from(schema.dataScopes)
  .innerJoin(schema.modules, eq(schema.dataScopes.moduleId, schema.modules.id))
  .where(eq(schema.dataScopes.userId, userId));

  return { overrides, scopes };
}

export async function saveUserModuleOverrideAdmin(userId: string, moduleId: string, effect: 'ALLOW' | 'DENY') {
  await checkAdminAuth();
  const id = `ovr_${userId}_${moduleId}`;
  const now = new Date();
  
  // Upsert
  await db.insert(schema.userModuleOverrides).values({
    id,
    userId,
    moduleId,
    effect,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: [schema.userModuleOverrides.userId, schema.userModuleOverrides.moduleId],
    set: { effect, updatedAt: now }
  });
  
  revalidatePath('/[locale]/(admin)/system-settings/permissions', 'page');
  return { success: true };
}

export async function removeUserModuleOverrideAdmin(overrideId: string) {
  await checkAdminAuth();
  await db.delete(schema.userModuleOverrides).where(eq(schema.userModuleOverrides.id, overrideId));
  revalidatePath('/[locale]/(admin)/system-settings/permissions', 'page');
  return { success: true };
}

export async function saveUserDataScopeAdmin(userId: string, moduleId: string, scope: DataScopeType) {
  await checkAdminAuth();
  const id = `scp_${userId}_${moduleId}`;
  const now = new Date();

  await db.insert(schema.dataScopes).values({
    id,
    userId,
    moduleId,
    scope,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: [schema.dataScopes.userId, schema.dataScopes.moduleId],
    set: { scope, updatedAt: now }
  });

  revalidatePath('/[locale]/(admin)/system-settings/permissions', 'page');
  return { success: true };
}

// ==========================================
// 4. EFFECTIVE PERMISSION PREVIEW (KIỂM TRA QUYỀN THỰC TẾ)
// ==========================================
export async function getEffectivePermissionPreviewAdmin(userId: string) {
  await checkAdminAuth();

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user) throw new Error("Không tìm thấy người dùng");

  // 1. Lấy phòng ban của user
  const userDepts = await db.select({
    deptId: schema.departments.id,
    deptName: schema.departments.name,
    deptCode: schema.departments.code,
  })
  .from(schema.userDepartments)
  .innerJoin(schema.departments, eq(schema.userDepartments.departmentId, schema.departments.id))
  .where(eq(schema.userDepartments.userId, userId));

  const deptIds = userDepts.map(d => d.deptId);
  if (user.departmentId && !deptIds.includes(user.departmentId)) {
    const [fallbackDept] = await db.select().from(schema.departments).where(eq(schema.departments.id, user.departmentId)).limit(1);
    if (fallbackDept) {
      userDepts.push({ deptId: fallbackDept.id, deptName: fallbackDept.name, deptCode: fallbackDept.code });
      deptIds.push(fallbackDept.id);
    }
  }

  // 2. Lấy module từ phòng ban
  let deptModules: { slug: string; name: string; fromDept: string }[] = [];
  if (deptIds.length > 0) {
    const rows = await db.select({
      slug: schema.modules.slug,
      name: schema.modules.name,
      deptName: schema.departments.name,
    })
    .from(schema.departmentModules)
    .innerJoin(schema.modules, eq(schema.departmentModules.moduleId, schema.modules.id))
    .innerJoin(schema.departments, eq(schema.departmentModules.departmentId, schema.departments.id))
    .where(and(
      inArray(schema.departmentModules.departmentId, deptIds),
      eq(schema.modules.status, true)
    ));
    deptModules = rows.map(r => ({ slug: r.slug, name: r.name, fromDept: r.deptName }));
  }

  // 3. Lấy overrides
  const overrides = await db.select({
    slug: schema.modules.slug,
    name: schema.modules.name,
    effect: schema.userModuleOverrides.effect,
  })
  .from(schema.userModuleOverrides)
  .innerJoin(schema.modules, eq(schema.userModuleOverrides.moduleId, schema.modules.id))
  .where(eq(schema.userModuleOverrides.userId, userId));

  const allowOverrides = overrides.filter(o => o.effect === 'ALLOW');
  const denyOverrides = overrides.filter(o => o.effect === 'DENY');

  // 4. Quyền thực tế
  const effectiveSlugs = await getUserModules(userId);
  const allModules = await db.select().from(schema.modules).where(eq(schema.modules.status, true));
  
  const effectiveModulesWithScope = await Promise.all(
    allModules.filter(m => effectiveSlugs.includes(m.slug)).map(async m => {
      const scope = await getModuleDataScope(userId, m.slug);
      return {
        id: m.id,
        slug: m.slug,
        name: m.name,
        icon: m.icon,
        scope,
      };
    })
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
    },
    departments: userDepts,
    departmentModules: deptModules,
    allowOverrides,
    denyOverrides,
    effectiveModules: effectiveModulesWithScope,
  };
}
